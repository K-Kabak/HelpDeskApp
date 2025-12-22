import { authOptions } from "@/lib/auth";
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
import { Attachment } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logger = createRequestLogger({
    route: `/api/tickets/${params.id}/attachments`,
    method: req.method,
    userId: session.user.id,
  });

  const rate = checkRateLimit(req, "attachments:create", {
    logger,
    identifier: session.user.id,
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
    where: { id: params.id },
    select: { id: true, requesterId: true, organizationId: true },
  });

  if (!ticket || ticket.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAgent =
    session.user.role === "AGENT" || session.user.role === "ADMIN";
  const isRequester = session.user.role === "REQUESTER";

  if (isRequester && ticket.requesterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { uploadUrl, storagePath } = createPresignedUpload(
    payload.fileName,
    payload.visibility
  );

  const attachment: Attachment = await prisma.attachment.create({
    data: {
      ticketId: ticket.id,
      uploaderId: session.user.id,
      fileName: payload.fileName,
      filePath: storagePath,
      mimeType: payload.mimeType,
      sizeBytes: payload.sizeBytes,
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
