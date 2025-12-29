import { describe, expect, it, vi, beforeEach } from "vitest";
import { Role } from "@prisma/client";
import { GET, POST } from "@/app/api/admin/users/route";
import { PATCH, DELETE } from "@/app/api/admin/users/[id]/route";

const mocks = vi.hoisted(() => ({
  jsonMock: vi.fn((body, init?: { status?: number }) =>
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { "content-type": "application/json" },
    })
  ),
  requireAuth: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
  adminAuditCreate: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.jsonMock,
  },
}));

vi.mock("@/lib/authorization", () => ({
  requireAuth: () => mocks.requireAuth(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
      delete: mocks.deleteMock,
    },
    adminAudit: {
      create: mocks.adminAuditCreate,
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(async (password: string) => `hashed-${password}`),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAuth.mockResolvedValue({
    ok: true,
    user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
  });
  mocks.adminAuditCreate.mockResolvedValue({ id: "audit-1" });
});

describe("Admin Users API Integration", () => {
  describe("GET /api/admin/users", () => {
    it("lists users scoped to organization", async () => {
      const mockUsers = [
        {
          id: "user-1",
          email: "user1@example.com",
          name: "User One",
          role: Role.AGENT,
          emailVerified: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
          _count: { ticketsCreated: 2, ticketsOwned: 1 },
        },
        {
          id: "user-2",
          email: "user2@example.com",
          name: "User Two",
          role: Role.REQUESTER,
          emailVerified: new Date("2024-01-01"),
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-03"),
          _count: { ticketsCreated: 0, ticketsOwned: 0 },
        },
      ];

      mocks.findMany.mockResolvedValue(mockUsers);

      const res = await GET(new Request("http://localhost/api/admin/users"));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.users).toHaveLength(2);
      expect(body.users[0]).toMatchObject({
        id: "user-1",
        email: "user1@example.com",
        name: "User One",
        role: Role.AGENT,
        ticketCount: 2,
        activeTicketCount: 1,
      });
      expect(mocks.findMany).toHaveBeenCalledWith({
        where: { organizationId: "org-1" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              ticketsCreated: true,
              ticketsOwned: {
                where: {
                  status: {
                    notIn: ["ROZWIAZANE", "ZAMKNIETE"],
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("rejects non-admin users", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: true,
        user: { id: "agent-1", role: "AGENT", organizationId: "org-1" },
      });

      const res = await GET(new Request("http://localhost/api/admin/users"));
      expect(res.status).toBe(403);
      expect(mocks.findMany).not.toHaveBeenCalled();
    });

    it("returns 401 when not authenticated", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: false,
        response: { status: 401 },
      });

      const res = await GET(new Request("http://localhost/api/admin/users"));
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/admin/users", () => {
    it("creates user with valid data", async () => {
      mocks.findUnique.mockResolvedValueOnce(null); // Email check
      mocks.create.mockResolvedValue({
        id: "user-new",
        email: "newuser@example.com",
        name: "New User",
        role: Role.AGENT,
        emailVerified: new Date("2024-01-03"),
        createdAt: new Date("2024-01-03"),
        updatedAt: new Date("2024-01-03"),
      });

      const req = new Request("http://localhost/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: "newuser@example.com",
          name: "New User",
          role: Role.AGENT,
          password: "password123",
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.user).toMatchObject({
        id: "user-new",
        email: "newuser@example.com",
        name: "New User",
        role: Role.AGENT,
      });
      expect(mocks.create).toHaveBeenCalled();
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "USER",
            action: "CREATE",
            actorId: "admin-1",
            organizationId: "org-1",
          }),
        })
      );
    });

    it("rejects duplicate email", async () => {
      mocks.findUnique.mockResolvedValueOnce({
        id: "existing-user",
        email: "existing@example.com",
      });

      const req = new Request("http://localhost/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: "existing@example.com",
          name: "New User",
          role: Role.AGENT,
          password: "password123",
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toBe("Email already exists");
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("validates required fields", async () => {
      const req = new Request("http://localhost/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: "invalid-email",
          name: "",
          role: "INVALID_ROLE",
          password: "short",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(mocks.create).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/admin/users/[id]", () => {
    it("updates user successfully", async () => {
      const existingUser = {
        id: "user-1",
        email: "old@example.com",
        name: "Old Name",
        role: Role.AGENT,
        organizationId: "org-1",
      };

      mocks.findFirst.mockResolvedValueOnce(existingUser); // User lookup

      mocks.update.mockResolvedValue({
        id: "user-1",
        email: "new@example.com",
        name: "New Name",
        role: Role.AGENT,
        emailVerified: new Date("2024-01-01"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      });

      const req = new Request("http://localhost/api/admin/users/user-1", {
        method: "PATCH",
        body: JSON.stringify({
          email: "new@example.com",
          name: "New Name",
        }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "user-1" }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.user).toMatchObject({
        id: "user-1",
        email: "new@example.com",
        name: "New Name",
      });
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "USER",
            action: "UPDATE",
            resourceId: "user-1",
          }),
        })
      );
    });

    it("rejects update to user from different org", async () => {
      mocks.findFirst.mockResolvedValue({
        id: "user-other",
        email: "other@example.com",
        organizationId: "other-org",
      });

      const req = new Request("http://localhost/api/admin/users/user-other", {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "user-other" }) });
      expect(res.status).toBe(404);
      expect(mocks.update).not.toHaveBeenCalled();
    });

    it("rejects update with duplicate email", async () => {
      const existingUser = {
        id: "user-1",
        email: "old@example.com",
        name: "Old Name",
        role: Role.AGENT,
        organizationId: "org-1",
      };

      mocks.findFirst.mockResolvedValueOnce(existingUser);
      mocks.findUnique.mockResolvedValueOnce({ id: "other-user", email: "taken@example.com" });

      const req = new Request("http://localhost/api/admin/users/user-1", {
        method: "PATCH",
        body: JSON.stringify({ email: "taken@example.com" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "user-1" }) });
      expect(res.status).toBe(400);
      expect(mocks.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/users/[id]", () => {
    it("deletes user without active tickets", async () => {
      const user = {
        id: "user-1",
        email: "user@example.com",
        name: "User",
        role: Role.AGENT,
        organizationId: "org-1",
        _count: { ticketsOwned: 0 },
      };

      mocks.findFirst.mockResolvedValue(user);
      mocks.deleteMock.mockResolvedValue(user);

      const req = new Request("http://localhost/api/admin/users/user-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "user-1" }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "USER",
            action: "DELETE",
            resourceId: "user-1",
          }),
        })
      );
    });

    it("rejects deletion of user with active tickets", async () => {
      const user = {
        id: "user-1",
        email: "user@example.com",
        name: "User",
        role: Role.AGENT,
        organizationId: "org-1",
        _count: { ticketsOwned: 2 },
      };

      mocks.findFirst.mockResolvedValue(user);

      const req = new Request("http://localhost/api/admin/users/user-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "user-1" }) });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toContain("active ticket");
      expect(mocks.deleteMock).not.toHaveBeenCalled();
    });

    it("rejects deletion of user from different org", async () => {
      mocks.findFirst.mockResolvedValue({
        id: "user-other",
        email: "other@example.com",
        organizationId: "other-org",
      });

      const req = new Request("http://localhost/api/admin/users/user-other", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "user-other" }) });
      expect(res.status).toBe(404);
      expect(mocks.deleteMock).not.toHaveBeenCalled();
    });
  });
});

