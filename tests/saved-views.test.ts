import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/views/route";
import { PATCH, DELETE } from "@/app/api/views/[id]/route";
import { POST as setDefault } from "@/app/api/views/[id]/set-default/route";
import { Role } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  jsonMock: vi.fn((body, init?: { status?: number }) => ({
    status: init?.status ?? 200,
    json: async () => body,
  })),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.jsonMock,
  },
}));

vi.mock("@/lib/authorization", () => ({
  requireAuth: () => mocks.requireAuth(),
}));

const mockTransaction = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    savedView: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
      updateMany: vi.fn(),
      delete: mocks.delete,
    },
    $transaction: mockTransaction,
  },
}));

vi.mock("@/lib/logger", () => ({
  createRequestLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe("Saved Views API", () => {
  const mockUser = {
    id: "user-1",
    role: "AGENT" as Role,
    organizationId: "org-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({
      ok: true,
      user: mockUser,
    });
  });

  describe("GET /api/views", () => {
    it("lists user's saved views", async () => {
      const mockViews = [
        {
          id: "view-1",
          userId: "user-1",
          organizationId: "org-1",
          name: "My Queue",
          filters: { status: "NOWE", priority: "WYSOKI" },
          isDefault: true,
          isShared: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "view-2",
          userId: "user-1",
          organizationId: "org-1",
          name: "In Progress",
          filters: { status: "W_TOKU" },
          isDefault: false,
          isShared: false,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
      ];

      mocks.findMany.mockResolvedValue(mockViews);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.views).toHaveLength(2);
      expect(body.views[0]).toMatchObject({
        id: "view-1",
        name: "My Queue",
        isDefault: true,
      });
      expect(mocks.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          organizationId: "org-1",
        },
        orderBy: [
          { isDefault: "desc" },
          { createdAt: "desc" },
        ],
      });
    });

    it("returns empty array when no views exist", async () => {
      mocks.findMany.mockResolvedValue([]);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.views).toEqual([]);
    });

    it("rejects unauthenticated requests", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: false,
        response: { status: 401, json: async () => ({ error: "Unauthorized" }) },
      });

      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("rejects users without organization", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: true,
        user: { ...mockUser, organizationId: null },
      });

      const res = await GET();
      expect(res.status).toBe(403);
    });
  });

  describe("POST /api/views", () => {
    it("creates new saved view", async () => {
      const newView = {
        id: "view-1",
        userId: "user-1",
        organizationId: "org-1",
        name: "My Queue",
        filters: { status: "NOWE", priority: "WYSOKI" },
        isDefault: false,
        isShared: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      mocks.findUnique.mockResolvedValue(null); // No duplicate
      mocks.create.mockResolvedValue(newView);

      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "My Queue",
          filters: { status: "NOWE", priority: "WYSOKI" },
          isShared: false,
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.view).toMatchObject({
        id: "view-1",
        name: "My Queue",
        filters: { status: "NOWE", priority: "WYSOKI" },
      });
      expect(mocks.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          organizationId: "org-1",
          name: "My Queue",
          filters: { status: "NOWE", priority: "WYSOKI" },
          isShared: false,
          isDefault: false,
        },
      });
    });

    it("prevents duplicate view names", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "existing-view",
        name: "My Queue",
      });

      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "My Queue",
          filters: { status: "NOWE" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("validates view name length", async () => {
      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "",
          filters: { status: "NOWE" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("validates view name max length", async () => {
      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "a".repeat(51),
          filters: { status: "NOWE" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("validates filter structure", async () => {
      const req = new Request("http://localhost/api/views", {
        method: "POST",
        body: JSON.stringify({
          name: "My View",
          filters: { invalidField: "value" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /api/views/[id]", () => {
    it("updates view name", async () => {
      const existingView = {
        id: "view-1",
        userId: "user-1",
        organizationId: "org-1",
        name: "Old Name",
        filters: { status: "NOWE" },
        isDefault: false,
        isShared: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      mocks.findUnique.mockResolvedValue(existingView);
      mocks.update.mockResolvedValue({
        ...existingView,
        name: "New Name",
      });

      const req = new Request("http://localhost/api/views/view-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "New Name",
        }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "view-1" }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.view.name).toBe("New Name");
      expect(mocks.update).toHaveBeenCalledWith({
        where: { id: "view-1" },
        data: { name: "New Name" },
      });
    });

    it("updates view filters", async () => {
      const existingView = {
        id: "view-1",
        userId: "user-1",
        organizationId: "org-1",
        name: "My View",
        filters: { status: "NOWE" },
        isDefault: false,
        isShared: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      mocks.findUnique.mockResolvedValue(existingView);
      mocks.update.mockResolvedValue({
        ...existingView,
        filters: { status: "W_TOKU", priority: "WYSOKI" },
      });

      const req = new Request("http://localhost/api/views/view-1", {
        method: "PATCH",
        body: JSON.stringify({
          filters: { status: "W_TOKU", priority: "WYSOKI" },
        }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "view-1" }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.view.filters).toEqual({ status: "W_TOKU", priority: "WYSOKI" });
    });

    it("rejects updates to other users' views", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "view-1",
        userId: "other-user",
        organizationId: "org-1",
      });

      const req = new Request("http://localhost/api/views/view-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "New Name",
        }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(404);
    });

    it("returns 404 for non-existent view", async () => {
      mocks.findUnique.mockResolvedValue(null);

      const req = new Request("http://localhost/api/views/view-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "New Name",
        }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/views/[id]", () => {
    it("deletes user's own view", async () => {
      const existingView = {
        id: "view-1",
        userId: "user-1",
        organizationId: "org-1",
        name: "My View",
        filters: { status: "NOWE" },
        isDefault: false,
        isShared: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      mocks.findUnique.mockResolvedValue(existingView);
      mocks.delete.mockResolvedValue(existingView);

      const req = new Request("http://localhost/api/views/view-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(200);

      expect(mocks.delete).toHaveBeenCalledWith({
        where: { id: "view-1" },
      });
    });

    it("rejects deletion of other users' views", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "view-1",
        userId: "other-user",
        organizationId: "org-1",
      });

      const req = new Request("http://localhost/api/views/view-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(404);
    });

    it("returns 404 for non-existent view", async () => {
      mocks.findUnique.mockResolvedValue(null);

      const req = new Request("http://localhost/api/views/view-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/views/[id]/set-default", () => {
    it("sets view as default", async () => {
      const existingView = {
        id: "view-1",
        userId: "user-1",
        organizationId: "org-1",
        name: "My View",
        filters: { status: "NOWE" },
        isDefault: false,
        isShared: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };

      mocks.findUnique.mockResolvedValue(existingView);
      mockTransaction.mockResolvedValue([
        { count: 1 }, // updateMany result
        { id: "view-1", isDefault: true }, // update result
      ]);

      const req = new Request("http://localhost/api/views/view-1/set-default", {
        method: "POST",
      });

      const res = await setDefault(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(200);
      expect(mockTransaction).toHaveBeenCalled();
    });

    it("rejects setting other users' views as default", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "view-1",
        userId: "other-user",
        organizationId: "org-1",
      });

      const req = new Request("http://localhost/api/views/view-1/set-default", {
        method: "POST",
      });

      const res = await setDefault(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(404);
    });

    it("returns 404 for non-existent view", async () => {
      mocks.findUnique.mockResolvedValue(null);

      const req = new Request("http://localhost/api/views/view-1/set-default", {
        method: "POST",
      });

      const res = await setDefault(req, { params: Promise.resolve({ id: "view-1" }) });
      expect(res.status).toBe(404);
    });
  });

  describe("Organization Scoping", () => {
    it("only returns views from user's organization", async () => {
      mocks.findMany.mockResolvedValue([
        {
          id: "view-1",
          userId: "user-1",
          organizationId: "org-1",
          name: "My View",
          filters: {},
          isDefault: false,
          isShared: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ]);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(mocks.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          organizationId: "org-1",
        },
        orderBy: expect.any(Array),
      });
      expect(body.views[0].organizationId).toBe("org-1");
    });
  });
});

