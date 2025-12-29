import { prisma } from "@/lib/prisma";
import { isAgentOrAdmin, requireAuth } from "@/lib/authorization";
import { createRequestLogger } from "@/lib/logger";
import { resolveDownloadUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const { id, attachmentId } = await params;
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: `/api/tickets/${id}/attachments/${attachmentId}`,
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("attachment download blocked", { event: "attachment_download", status: "unauthorized" });
    return auth.response;
  }

  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      ticket: {
        select: { id: true, organizationId: true, requesterId: true },
      },
    },
  });

  if (!attachment || attachment.ticket.id !== id) {
    logger.warn("attachment not found", { attachmentId, ticketId: id });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (attachment.ticket.organizationId !== auth.user.organizationId) {
    logger.warn(
      "attachment download forbidden",
      { attachmentId: attachment.id, ticketId: attachment.ticket.id, userId: auth.user.id }
    );
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isRequester =
    auth.user.role === "REQUESTER" && attachment.ticket.requesterId === auth.user.id;
  const isAgent = isAgentOrAdmin(auth.user);
  if (!isAgent && !isRequester) {
    logger.warn(
      "attachment download forbidden",
      { attachmentId: attachment.id, ticketId: attachment.ticket.id, userId: auth.user.id }
    );
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const downloadUrl = resolveDownloadUrl(attachment.filePath);

  logger.info(
    "attachment download",
    {
      event: "attachment_download",
      ticketId: attachment.ticketId,
      attachmentId: attachment.id,
      userId: auth.user.id,
      sizeBytes: attachment.sizeBytes,
      status: "success",
    }
  );

  return NextResponse.json({
    attachment: {
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: attachment.sizeBytes,
      visibility: attachment.visibility,
      status: "CLEAN",
    },
    downloadUrl,
  });
}
