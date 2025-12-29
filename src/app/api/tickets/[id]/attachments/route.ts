import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAttachmentScan } from "@/lib/av-scanner";
import { generateStoragePath, storeFile, deleteFile } from "@/lib/storage";
import {
  isMimeAllowed,
  isSizeAllowed,
} from "@/lib/attachment-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { recordAttachmentAudit } from "@/lib/audit";
import { Attachment, AttachmentVisibility } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { SessionWithUser } from "@/lib/session-types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logger = createRequestLogger({
    route: `/api/tickets/${id}/attachments`,
    method: req.method,
    userId: session.user.id,
  });

  const rate = checkRateLimit(req, "attachments:create", {
    logger,
    identifier: session.user.id,
  });
  if (!rate.allowed) return rate.response;

  // Parse multipart/form-data
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (error) {
    logger.warn("failed to parse form data", { error });
    return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const visibilityValue = (formData.get("visibility") as string | null) ?? "public";

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // Validate file size
  if (!isSizeAllowed(file.size)) {
    return NextResponse.json(
      { error: `File too large (max ${process.env.ATTACH_MAX_BYTES ?? "26214400"} bytes)` },
      { status: 400 }
    );
  }

  // Validate MIME type
  const mimeType = file.type || "application/octet-stream";
  if (!isMimeAllowed(mimeType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  // Validate visibility
  if (visibilityValue !== "public" && visibilityValue !== "internal") {
    return NextResponse.json({ error: "Visibility must be 'public' or 'internal'" }, { status: 400 });
  }

  // Check ticket exists and user has access
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true, requesterId: true, organizationId: true },
  });

  if (!ticket || ticket.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isRequester = session.user.role === "REQUESTER";
  const isAgent = session.user.role === "AGENT" || session.user.role === "ADMIN";

  // Requesters can only upload to their own tickets
  if (isRequester && ticket.requesterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only agents/admins can upload internal attachments
  if (visibilityValue === "internal" && !isAgent) {
    return NextResponse.json({ error: "Only agents and admins can upload internal attachments" }, { status: 403 });
  }

  // Generate storage path and store file
  const fileName = file.name;
  const visibility = visibilityValue === "public" ? AttachmentVisibility.PUBLIC : AttachmentVisibility.INTERNAL;
  const storagePath = generateStoragePath(fileName, visibilityValue as "public" | "internal");

  // Convert file to buffer and store
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  await storeFile(storagePath, fileBuffer);

  // Create attachment record
  const attachment: Attachment = await prisma.attachment.create({
    data: {
      ticketId: ticket.id,
      uploaderId: session.user.id,
      fileName,
      filePath: storagePath,
      mimeType,
      sizeBytes: file.size,
      visibility,
    },
  });

  // Record audit event
  await recordAttachmentAudit({
    ticketId: ticket.id,
    actorId: session.user.id,
    action: "ATTACHMENT_UPLOADED",
    attachment: {
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      visibility,
      storagePath,
    },
  });

  // Run antivirus scan (async, non-blocking)
  runAttachmentScan(attachment.id, storagePath).catch((error) => {
    logger.warn("attachment scan failed", { attachmentId: attachment.id, error });
  });

  logger.info("attachment uploaded", {
    attachmentId: attachment.id,
    ticketId: ticket.id,
    fileName,
    sizeBytes: file.size,
  });

  return NextResponse.json(
    {
      attachment: {
        id: attachment.id,
        ticketId: attachment.ticketId,
        uploaderId: attachment.uploaderId,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        sizeBytes: attachment.sizeBytes,
        visibility: attachment.visibility,
        createdAt: attachment.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}

const deleteSchema = z.object({
  attachmentId: z.string().uuid(),
});

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logger = createRequestLogger({
    route: `/api/tickets/${id}/attachments`,
    method: req.method,
    userId: session.user.id,
  });

  const body = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id: parsed.data.attachmentId },
    include: {
      ticket: { select: { id: true, organizationId: true, requesterId: true } },
    },
  });

  if (
    !attachment ||
    attachment.ticket.organizationId !== session.user.organizationId ||
    attachment.ticket.id !== id
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only agents/admins can delete attachments
  const isAgent = session.user.role === "AGENT" || session.user.role === "ADMIN";
  if (!isAgent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete file from storage
  await deleteFile(attachment.filePath).catch((error) => {
    logger.warn("failed to delete file from storage", { filePath: attachment.filePath, error });
  });

  await prisma.$transaction(async (tx) => {
    await tx.attachment.delete({
      where: { id: attachment.id },
    });

    await recordAttachmentAudit(
      {
        ticketId: attachment.ticketId,
        actorId: session.user.id,
        action: "ATTACHMENT_DELETED",
        attachment: {
          id: attachment.id,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          sizeBytes: attachment.sizeBytes,
          visibility: attachment.visibility,
          storagePath: attachment.filePath,
        },
      },
      tx
    );
  });

  logger.info("attachment deleted", { attachmentId: attachment.id });

  return NextResponse.json({ ok: true });
}
