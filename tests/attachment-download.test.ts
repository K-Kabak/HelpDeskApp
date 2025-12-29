import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  attachment: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const mockCreateLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock("@/lib/logger", () => ({
  createRequestLogger: () => mockCreateLogger,
}));

const mockRequireAuth = vi.fn();
vi.mock("@/lib/authorization", async () => {
  const actual = await vi.importActual<typeof import("@/lib/authorization")>("@/lib/authorization");
  return {
    ...actual,
    requireAuth: mockRequireAuth,
  };
});

describe("attachment download logging", () => {
  beforeEach(() => {
    mockRequireAuth.mockResolvedValue({
      ok: true,
      user: {
        id: "user-1",
        role: "REQUESTER",
        organizationId: "org-1",
      },
    });
    mockPrisma.attachment.findUnique.mockReset();
    Object.values(mockCreateLogger).forEach((fn) => fn.mockReset?.());
  });

  afterEach(() => {
    mockPrisma.attachment.findUnique.mockReset();
  });

  test("logs download metadata", async () => {
    mockPrisma.attachment.findUnique.mockResolvedValueOnce({
      id: "att-1",
      fileName: "report.pdf",
      filePath: "internal/att-1/report.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      visibility: "INTERNAL",
      ticketId: "t1",
      ticket: {
        id: "t1",
        organizationId: "org-1",
        requesterId: "user-1",
      },
    });

    const { GET } = await vi.importActual<typeof import("@/app/api/tickets/[id]/attachments/[attachmentId]/route")>(
      "@/app/api/tickets/[id]/attachments/[attachmentId]/route"
    );

    const req = new Request("http://localhost/api/tickets/t1/attachments/att-1", {
      method: "GET",
    });

    const res = await GET(req, { params: { id: "t1", attachmentId: "att-1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.attachment.id).toBe("att-1");
    expect(body.downloadUrl).toContain("/uploads/internal/");
    expect(mockCreateLogger.info).toHaveBeenCalledWith(
      "attachment download",
      expect.objectContaining({
        event: "attachment_download",
        ticketId: "t1",
        attachmentId: "att-1",
        userId: "user-1",
        sizeBytes: 1024,
        status: "success",
      })
    );
  });
});
