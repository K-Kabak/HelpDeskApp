import { prisma } from "@/lib/prisma";
import { runAttachmentScan } from "@/lib/av-scanner";
import { createPresignedUpload } from "@/lib/storage";
import {
  isMimeAllowed,
  isSizeAllowed,
  uploadRequestSchema,
} from "@/lib/attachment-validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { recordAttachmentAudit } from "@/lib/audit";
import { requireAuth, isSameOrganization } from "@/lib/authorization";
import { Attachment, AttachmentVisibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: `/api/tickets/${id}/attachments`,
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.securityEvent("authorization_failure", { reason: "missing_session" });
    logger.warn("auth.required");
    return auth.response;
  }

  const rate = checkRateLimit(req, "attachments:create", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  const body = await req.json();
  const parsed = uploadRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;

  if (!isSizeAllowed(payload.sizeBytes)) {
    return NextResponse.json(
      { error: `File too large (max ${process.env.ATTACH_MAX_BYTES ?? "26214400"} bytes)` },
      { status: 400 }
    );
  }

  if (!isMimeAllowed(payload.mimeType)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true, requesterId: true, organizationId: true },
  });

  if (!ticket || !isSameOrganization(auth.user, ticket.organizationId)) {
    logger.securityEvent("suspicious_activity", {
      reason: "attachment_upload_wrong_org",
      ticketId: ticket?.id ?? id,
      attemptedOrgId: auth.user.organizationId,
      actualOrgId: ticket?.organizationId,
    });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isRequester = auth.user.role === "REQUESTER";

  if (isRequester && ticket.requesterId !== auth.user.id) {
    logger.securityEvent("suspicious_activity", {
      reason: "attachment_upload_other_requester",
      ticketId: ticket.id,
      requesterId: ticket.requesterId,
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { uploadUrl, storagePath } = createPresignedUpload(
    payload.fileName,
    payload.visibility
  );

  const visibility =
    payload.visibility === "public"
      ? AttachmentVisibility.PUBLIC
      : AttachmentVisibility.INTERNAL;

  const attachment: Attachment = await prisma.attachment.create({
    data: {
      ticketId: ticket.id,
      uploaderId: auth.user.id,
      fileName: payload.fileName,
      filePath: storagePath,
      mimeType: payload.mimeType,
      sizeBytes: payload.sizeBytes,
      visibility,
    },
  });

  await recordAttachmentAudit({
    ticketId: ticket.id,
    actorId: auth.user.id,
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

  await runAttachmentScan(attachment.id, storagePath);

  return NextResponse.json(
    {
      attachment,
      uploadUrl,
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
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: `/api/tickets/${id}/attachments`,
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.securityEvent("authorization_failure", { reason: "missing_session" });
    logger.warn("auth.required");
    return auth.response;
  }

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
    !isSameOrganization(auth.user, attachment.ticket.organizationId) ||
    attachment.ticket.id !== id
  ) {
    logger.securityEvent("suspicious_activity", {
      reason: "attachment_delete_wrong_org",
      ticketId: attachment?.ticketId ?? id,
      attachmentId: attachment?.id,
      actualOrgId: attachment?.ticket.organizationId,
    });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAgent =
    auth.user.role === "AGENT" || auth.user.role === "ADMIN";
  const isRequester = auth.user.role === "REQUESTER";

  const requesterOwnsTicket =
    isRequester && attachment.ticket.requesterId === auth.user.id;
  const requesterUploaded = attachment.uploaderId === auth.user.id;

  if (!isAgent && !(requesterOwnsTicket && requesterUploaded)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.attachment.delete({
      where: { id: attachment.id },
    });

    await recordAttachmentAudit(
      {
        ticketId: attachment.ticketId,
        actorId: auth.user.id,
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
