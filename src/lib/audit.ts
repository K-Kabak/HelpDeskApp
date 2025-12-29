import { prisma } from "@/lib/prisma";
import { AttachmentVisibility } from "@prisma/client";

type AuditClient = Pick<typeof prisma, "auditEvent">;

type AttachmentAuditAction = "ATTACHMENT_UPLOADED" | "ATTACHMENT_DELETED" | "ATTACHMENT_DOWNLOADED";

type AttachmentAuditInput = {
  ticketId: string;
  actorId: string;
  action: AttachmentAuditAction;
  attachment: {
    id?: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    visibility: AttachmentVisibility;
    storagePath?: string;
  };
};

/**
 * Records an audit event for attachment operations. Payload redacts sensitive
 * presigned URLs and stores only stable identifiers and metadata.
 */
export async function recordAttachmentAudit(
  input: AttachmentAuditInput,
  client: AuditClient = prisma
) {
  const { ticketId, actorId, action, attachment } = input;
  const attachmentData = {
    attachmentId: attachment.id ?? null,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    sizeBytes: attachment.sizeBytes,
    visibility: attachment.visibility,
    storagePath: attachment.storagePath ?? null,
  };

  return client.auditEvent.create({
    data: {
      ticketId,
      actorId,
      action,
      data: { attachment: attachmentData },
    },
  });
}
