import { AttachmentVisibility } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import { recordAttachmentAudit } from "./audit";

const createMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditEvent: {
      create: createMock,
    },
  },
}));

describe("recordAttachmentAudit", () => {
  it("persists audit event with redacted attachment metadata", async () => {
    await recordAttachmentAudit({
      ticketId: "ticket-1",
      actorId: "user-1",
      action: "ATTACHMENT_UPLOADED",
      attachment: {
        id: "att-1",
        fileName: "report.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        visibility: AttachmentVisibility.INTERNAL,
        storagePath: "internal/key/report.pdf",
      },
    });

    expect(createMock).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "user-1",
        action: "ATTACHMENT_UPLOADED",
        data: {
          attachment: {
            attachmentId: "att-1",
            fileName: "report.pdf",
            mimeType: "application/pdf",
            sizeBytes: 1024,
            visibility: AttachmentVisibility.INTERNAL,
            storagePath: "internal/key/report.pdf",
          },
        },
      },
    });
  });

  it("handles missing storagePath and attachment id", async () => {
    await recordAttachmentAudit({
      ticketId: "ticket-2",
      actorId: "user-2",
      action: "ATTACHMENT_DELETED",
      attachment: {
        fileName: "photo.png",
        mimeType: "image/png",
        sizeBytes: 2048,
        visibility: AttachmentVisibility.PUBLIC,
      },
    });

    expect(createMock).toHaveBeenLastCalledWith({
      data: {
        ticketId: "ticket-2",
        actorId: "user-2",
        action: "ATTACHMENT_DELETED",
        data: {
          attachment: {
            attachmentId: null,
            fileName: "photo.png",
            mimeType: "image/png",
            sizeBytes: 2048,
            visibility: AttachmentVisibility.PUBLIC,
            storagePath: null,
          },
        },
      },
    });
  });
});
