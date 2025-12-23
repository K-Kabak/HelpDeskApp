import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/admin/teams/route";
import { PATCH, DELETE } from "@/app/api/admin/teams/[id]/route";

const mocks = vi.hoisted(() => ({
  jsonMock: vi.fn((body, init?: { status?: number }) => ({
    status: init?.status ?? 200,
    body,
  })),
  requireAuth: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
  count: vi.fn(),
  adminAuditCreate: vi.fn(),
  userFindMany: vi.fn(),
  teamMembershipDeleteMany: vi.fn(),
  teamMembershipCreateMany: vi.fn(),
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
    team: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
      delete: mocks.deleteMock,
    },
    ticket: {
      count: mocks.count,
    },
    user: {
      findMany: mocks.userFindMany,
    },
    teamMembership: {
      deleteMany: mocks.teamMembershipDeleteMany,
      createMany: mocks.teamMembershipCreateMany,
    },
    adminAudit: {
      create: mocks.adminAuditCreate,
    },
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

describe("Admin Teams API Integration", () => {
  describe("GET /api/admin/teams", () => {
    it("lists teams scoped to organization", async () => {
      const mockTeams = [
        {
          id: "team-1",
          name: "Support Team",
          createdAt: new Date("2024-01-01"),
          memberships: [
            {
              user: { id: "user-1", name: "User One", email: "user1@example.com" },
            },
          ],
          tickets: [{ id: "ticket-1" }],
        },
        {
          id: "team-2",
          name: "Sales Team",
          createdAt: new Date("2024-01-02"),
          memberships: [],
          tickets: [],
        },
      ];

      mocks.findMany.mockResolvedValue(mockTeams);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.teams).toHaveLength(2);
      expect(body.teams[0]).toMatchObject({
        id: "team-1",
        name: "Support Team",
        memberCount: 1,
        ticketCount: 1,
      });
      expect(mocks.findMany).toHaveBeenCalledWith({
        where: { organizationId: "org-1" },
        orderBy: { name: "asc" },
        select: expect.objectContaining({
          id: true,
          name: true,
        }),
      });
    });

    it("rejects non-admin users", async () => {
      mocks.requireAuth.mockResolvedValue({
        ok: true,
        user: { id: "agent-1", role: "AGENT", organizationId: "org-1" },
      });

      const res = await GET();
      expect(res.status).toBe(403);
      expect(mocks.findMany).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/admin/teams", () => {
    it("creates team with valid data", async () => {
      mocks.findUnique.mockResolvedValueOnce(null); // Name uniqueness check
      mocks.userFindMany.mockResolvedValue([{ id: "user-1" }, { id: "user-2" }]);
      mocks.create.mockResolvedValue({
        id: "team-new",
        name: "New Team",
        createdAt: new Date("2024-01-03"),
        memberships: [
          {
            user: { id: "user-1", name: "User One", email: "user1@example.com" },
          },
        ],
      });

      const req = new Request("http://localhost/api/admin/teams", {
        method: "POST",
        body: JSON.stringify({
          name: "New Team",
          memberIds: ["user-1", "user-2"],
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.team).toMatchObject({
        id: "team-new",
        name: "New Team",
      });
      expect(mocks.create).toHaveBeenCalled();
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "TEAM",
            action: "CREATE",
            actorId: "admin-1",
            organizationId: "org-1",
          }),
        })
      );
    });

    it("rejects duplicate team name", async () => {
      mocks.findUnique.mockResolvedValueOnce({
        id: "existing-team",
        name: "Existing Team",
        organizationId: "org-1",
      });

      const req = new Request("http://localhost/api/admin/teams", {
        method: "POST",
        body: JSON.stringify({
          name: "Existing Team",
          memberIds: [],
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.error).toBe("Team with this name already exists");
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("rejects invalid member IDs", async () => {
      mocks.findUnique.mockResolvedValueOnce(null);
      mocks.userFindMany.mockResolvedValue([]); // No users found

      const req = new Request("http://localhost/api/admin/teams", {
        method: "POST",
        body: JSON.stringify({
          name: "New Team",
          memberIds: ["invalid-user"],
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(404);
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("validates required fields", async () => {
      const req = new Request("http://localhost/api/admin/teams", {
        method: "POST",
        body: JSON.stringify({
          name: "",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(mocks.create).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/admin/teams/[id]", () => {
    it("updates team successfully", async () => {
      const existingTeam = {
        id: "team-1",
        name: "Old Name",
        organizationId: "org-1",
        memberships: [{ userId: "user-1" }],
      };

      mocks.findUnique
        .mockResolvedValueOnce(existingTeam) // Team lookup
        .mockResolvedValueOnce(null); // Name uniqueness check

      mocks.userFindMany.mockResolvedValue([{ id: "user-2" }]);
      mocks.update.mockResolvedValue({
        id: "team-1",
        name: "New Name",
        memberships: [
          {
            user: { id: "user-2", name: "User Two", email: "user2@example.com" },
          },
        ],
      });

      const req = new Request("http://localhost/api/admin/teams/team-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "New Name",
          memberIds: ["user-2"],
        }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "team-1" }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.team).toMatchObject({
        id: "team-1",
        name: "New Name",
      });
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "TEAM",
            action: "UPDATE",
            resourceId: "team-1",
          }),
        })
      );
    });

    it("rejects update to team from different org", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "team-other",
        name: "Other Team",
        organizationId: "other-org",
        memberships: [],
      });

      const req = new Request("http://localhost/api/admin/teams/team-other", {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "team-other" }) });
      expect(res.status).toBe(404);
      expect(mocks.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/teams/[id]", () => {
    it("deletes team without assigned tickets", async () => {
      const team = {
        id: "team-1",
        name: "Team One",
        organizationId: "org-1",
      };

      mocks.findUnique.mockResolvedValue(team);
      mocks.count.mockResolvedValue(0); // No assigned tickets
      mocks.deleteMock.mockResolvedValue(team);

      const req = new Request("http://localhost/api/admin/teams/team-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "team-1" }) });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "TEAM",
            action: "DELETE",
            resourceId: "team-1",
          }),
        })
      );
    });

    it("rejects deletion of team with assigned tickets", async () => {
      const team = {
        id: "team-1",
        name: "Team One",
        organizationId: "org-1",
      };

      mocks.findUnique.mockResolvedValue(team);
      mocks.count.mockResolvedValue(3); // Has assigned tickets

      const req = new Request("http://localhost/api/admin/teams/team-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "team-1" }) });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toContain("assigned ticket");
      expect(mocks.deleteMock).not.toHaveBeenCalled();
    });

    it("rejects deletion of team from different org", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "team-other",
        name: "Other Team",
        organizationId: "other-org",
      });

      const req = new Request("http://localhost/api/admin/teams/team-other", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "team-other" }) });
      expect(res.status).toBe(404);
      expect(mocks.deleteMock).not.toHaveBeenCalled();
    });
  });
});

