import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketStatus, TicketPriority, Role } from "@prisma/client";
import { GET as listViews, POST as createView } from "@/app/api/views/route";
import { PATCH as updateView, DELETE as deleteView } from "@/app/api/views/[id]/route";
import { POST as setDefaultView } from "@/app/api/views/[id]/set-default/route";

const mocks = vi.hoisted(() => ({
  jsonMock: vi.fn((body: unknown, init?: { status?: number }) => ({
    status: init?.status ?? 200,
    body,
    json: async () => body,
  })),
  requireAuth: vi.fn(),
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    securityEvent: vi.fn(),
  })),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  $transaction: vi.fn((operations: unknown[]) => {
    if (Array.isArray(operations)) {
      // Prisma $transaction receives an array of promises/operations
      // Execute them and return results
      return Promise.all(operations);
    }
    return Promise.resolve(operations);
  }),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.jsonMock,
  },
}));

vi.mock("@/lib/authorization", () => ({
  requireAuth: () => mocks.requireAuth(),
}));

vi.mock("@/lib/logger", () => ({
  createRequestLogger: () => mocks.createLogger(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    savedView: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
      updateMany: mocks.updateMany,
      delete: mocks.delete,
    },
    $transaction: mocks.$transaction,
  },
}));

describe("Saved Views Integration", () => {
  const agentUser = {
    id: "user-1",
    role: Role.AGENT,
    organizationId: "org-1",
  };

  const mockView = {
    id: "view-1",
    userId: "user-1",
    organizationId: "org-1",
    name: "My View",
    filters: {
      status: TicketStatus.NOWE,
      priority: TicketPriority.WYSOKIE,
    },
    isShared: false,
    isTeam: false,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ ok: true, user: agentUser });
  });

  describe("List Views", () => {
    it("lists user's saved views", async () => {
      mocks.findMany.mockResolvedValue([mockView]);

      await listViews();
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(mocks.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: "org-1",
          OR: [
            { userId: "user-1" },
            { isTeam: true },
          ],
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" },
        ],
      });
    });

    it("returns 401 when not authenticated", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: false,
        response: { status: 401, body: { error: "Unauthorized" } },
      });

      const result = await listViews();
      expect(result.status).toBe(401);
    });
  });

  describe("Create View", () => {
    it("creates a new saved view", async () => {
      mocks.findUnique.mockResolvedValue(null); // No duplicate
      mocks.create.mockResolvedValue(mockView);

      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "My View",
          filters: {
            status: TicketStatus.NOWE,
            priority: TicketPriority.WYSOKIE,
          },
        }),
      });

      await createView(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(mocks.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          organizationId: "org-1",
          name: "My View",
          filters: expect.any(Object),
          isShared: false,
          isTeam: false,
          isDefault: false,
        },
      });
    });

    it("rejects duplicate view name", async () => {
      mocks.findUnique.mockResolvedValue(mockView); // Duplicate exists

      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "My View",
          filters: {},
        }),
      });

      await createView(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(400);
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("rejects invalid filter schema", async () => {
      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "My View",
          filters: {
            invalidField: "invalid",
          },
        }),
      });

      await createView(req);
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(400);
    });
  });

  describe("Update View", () => {
    it("updates an existing view", async () => {
      mocks.findUnique.mockResolvedValueOnce(mockView); // First call for view lookup
      mocks.findUnique.mockResolvedValueOnce(null); // Second call for duplicate check (no duplicate)
      const updatedView = { ...mockView, name: "Updated View" };
      mocks.update.mockResolvedValue(updatedView);

      const req = new Request("http://localhost/api/views/view-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Updated View",
        }),
      });

      await updateView(req, { params: Promise.resolve({ id: "view-1" }) });
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(mocks.update).toHaveBeenCalled();
    });

    it("returns 404 when view not found", async () => {
      mocks.findUnique.mockResolvedValue(null);

      const req = new Request("http://localhost/api/views/view-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Updated View",
        }),
      });

      await updateView(req, { params: Promise.resolve({ id: "view-1" }) });
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(404);
    });
  });

  describe("Delete View", () => {
    it("deletes a view", async () => {
      mocks.findUnique.mockResolvedValue(mockView);
      mocks.delete.mockResolvedValue(mockView);

      await deleteView(
        new Request("http://localhost/api/views/view-1", { method: "DELETE" }),
        { params: Promise.resolve({ id: "view-1" }) }
      );
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(mocks.delete).toHaveBeenCalledWith({
        where: { id: "view-1" },
      });
    });

    it("returns 404 when view not found", async () => {
      mocks.findUnique.mockResolvedValue(null);

      await deleteView(
        new Request("http://localhost/api/views/view-1", { method: "DELETE" }),
        { params: Promise.resolve({ id: "view-1" }) }
      );
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(404);
    });
  });

  describe("Set Default View", () => {
    it("sets a view as default", async () => {
      mocks.findUnique.mockResolvedValue(mockView);
      mocks.updateMany.mockResolvedValue({ count: 1 });
      mocks.update.mockResolvedValue({ ...mockView, isDefault: true });

      // Mock $transaction to handle array of Prisma operations
      mocks.$transaction.mockImplementation(async (operations: unknown[]) => {
        if (Array.isArray(operations)) {
          return Promise.all(operations as Promise<unknown>[]);
        }
        return Promise.resolve(operations);
      });

      await setDefaultView(
        new Request("http://localhost/api/views/view-1/set-default", { method: "POST" }),
        { params: Promise.resolve({ id: "view-1" }) }
      );
      const response = mocks.jsonMock.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(mocks.$transaction).toHaveBeenCalled();
    });
  });
});

