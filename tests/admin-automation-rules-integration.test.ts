import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { GET, POST } from "@/app/api/admin/automation-rules/route";
import { PATCH, DELETE } from "@/app/api/admin/automation-rules/[id]/route";

const mocks = vi.hoisted(() => ({
  jsonMock: vi.fn((body, init?: { status?: number }) => ({
    status: init?.status ?? 200,
    body,
  })),
  requireAuth: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
  adminAuditCreate: vi.fn(),
  validateTriggerConfig: vi.fn(),
  validateActionConfig: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: mocks.jsonMock,
  },
}));

vi.mock("@/lib/authorization", () => ({
  requireAuth: () => mocks.requireAuth(),
}));

vi.mock("@/lib/automation-rules", () => ({
  validateTriggerConfig: mocks.validateTriggerConfig,
  validateActionConfig: mocks.validateActionConfig,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    automationRule: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      create: mocks.create,
      update: mocks.update,
      delete: mocks.deleteMock,
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
  mocks.validateTriggerConfig.mockReturnValue(undefined);
  mocks.validateActionConfig.mockReturnValue(undefined);
});

describe("Admin Automation Rules API Integration", () => {
  describe("GET /api/admin/automation-rules", () => {
    it("lists automation rules scoped to organization", async () => {
      const mockRules = [
        {
          id: "rule-1",
          name: "Auto-assign High Priority",
          enabled: true,
          organizationId: "org-1",
          triggerConfig: { type: "priorityChanged", priority: TicketPriority.WYSOKI },
          actionConfig: { type: "assignTeam", teamId: "team-1" },
          createdAt: new Date("2024-01-01"),
        },
        {
          id: "rule-2",
          name: "Close Resolved Tickets",
          enabled: false,
          organizationId: "org-1",
          triggerConfig: { type: "statusChanged", status: TicketStatus.ROZWIAZANE },
          actionConfig: { type: "setStatus", status: TicketStatus.ZAMKNIETE },
          createdAt: new Date("2024-01-02"),
        },
      ];

      mocks.findMany.mockResolvedValue(mockRules);

      const res = await GET();
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.rules).toHaveLength(2);
      expect(body.rules[0]).toMatchObject({
        id: "rule-1",
        name: "Auto-assign High Priority",
        enabled: true,
      });
      expect(mocks.findMany).toHaveBeenCalledWith({
        where: { organizationId: "org-1" },
        orderBy: { createdAt: "desc" },
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

  describe("POST /api/admin/automation-rules", () => {
    it("creates automation rule with valid config", async () => {
      const triggerConfig = { type: "priorityChanged" as const, priority: TicketPriority.WYSOKI };
      const actionConfig = { type: "assignTeam" as const, teamId: "team-1" };

      mocks.create.mockResolvedValue({
        id: "rule-new",
        name: "New Rule",
        enabled: true,
        organizationId: "org-1",
        triggerConfig,
        actionConfig,
        createdAt: new Date("2024-01-03"),
      });

      const req = new Request("http://localhost/api/admin/automation-rules", {
        method: "POST",
        body: JSON.stringify({
          name: "New Rule",
          triggerConfig,
          actionConfig,
        }),
      });

      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.rule).toMatchObject({
        id: "rule-new",
        name: "New Rule",
        enabled: true,
      });
      expect(mocks.validateTriggerConfig).toHaveBeenCalledWith(triggerConfig);
      expect(mocks.validateActionConfig).toHaveBeenCalledWith(actionConfig);
      expect(mocks.create).toHaveBeenCalled();
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "AUTOMATION_RULE",
            action: "CREATE",
            actorId: "admin-1",
            organizationId: "org-1",
          }),
        })
      );
    });

    it("rejects invalid trigger config", async () => {
      mocks.validateTriggerConfig.mockImplementation(() => {
        throw new Error("Invalid trigger config");
      });

      const req = new Request("http://localhost/api/admin/automation-rules", {
        method: "POST",
        body: JSON.stringify({
          name: "Invalid Rule",
          triggerConfig: { type: "invalid" },
          actionConfig: { type: "assignTeam", teamId: "team-1" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("rejects invalid action config", async () => {
      mocks.validateActionConfig.mockImplementation(() => {
        throw new Error("Invalid action config");
      });

      const req = new Request("http://localhost/api/admin/automation-rules", {
        method: "POST",
        body: JSON.stringify({
          name: "Invalid Rule",
          triggerConfig: { type: "ticketCreated" },
          actionConfig: { type: "invalid" },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("validates required fields", async () => {
      const req = new Request("http://localhost/api/admin/automation-rules", {
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

  describe("PATCH /api/admin/automation-rules/[id]", () => {
    it("updates automation rule successfully", async () => {
      const existingRule = {
        id: "rule-1",
        name: "Old Rule",
        enabled: true,
        organizationId: "org-1",
        triggerConfig: { type: "ticketCreated" as const },
        actionConfig: { type: "assignUser" as const, userId: "user-1" },
      };

      mocks.findFirst.mockResolvedValue(existingRule);
      mocks.update.mockResolvedValue({
        ...existingRule,
        name: "Updated Rule",
        enabled: false,
      });

      const req = new Request("http://localhost/api/admin/automation-rules/rule-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Updated Rule",
          enabled: false,
        }),
      });

      const res = await PATCH(req, { params: { id: "rule-1" } });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.rule).toMatchObject({
        id: "rule-1",
        name: "Updated Rule",
        enabled: false,
      });
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "AUTOMATION_RULE",
            action: "UPDATE",
            resourceId: "rule-1",
          }),
        })
      );
    });

    it("validates trigger config when updating", async () => {
      const existingRule = {
        id: "rule-1",
        name: "Rule",
        enabled: true,
        organizationId: "org-1",
        triggerConfig: { type: "ticketCreated" as const },
        actionConfig: { type: "assignUser" as const, userId: "user-1" },
      };

      mocks.findFirst.mockResolvedValue(existingRule);
      mocks.validateTriggerConfig.mockImplementation(() => {
        throw new Error("Invalid trigger");
      });

      const req = new Request("http://localhost/api/admin/automation-rules/rule-1", {
        method: "PATCH",
        body: JSON.stringify({
          triggerConfig: { type: "invalid" },
        }),
      });

      const res = await PATCH(req, { params: { id: "rule-1" } });
      expect(res.status).toBe(400);
      expect(mocks.update).not.toHaveBeenCalled();
    });

    it("rejects update to rule from different org", async () => {
      mocks.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/admin/automation-rules/rule-other", {
        method: "PATCH",
        body: JSON.stringify({ name: "New Name" }),
      });

      const res = await PATCH(req, { params: { id: "rule-other" } });
      expect(res.status).toBe(404);
      expect(mocks.update).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /api/admin/automation-rules/[id]", () => {
    it("deletes automation rule successfully", async () => {
      const rule = {
        id: "rule-1",
        name: "Rule to Delete",
        enabled: true,
        organizationId: "org-1",
        triggerConfig: { type: "ticketCreated" as const },
        actionConfig: { type: "assignUser" as const, userId: "user-1" },
      };

      mocks.findFirst.mockResolvedValue(rule);
      mocks.deleteMock.mockResolvedValue(rule);

      const req = new Request("http://localhost/api/admin/automation-rules/rule-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: { id: "rule-1" } });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(mocks.deleteMock).toHaveBeenCalled();
      expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            resource: "AUTOMATION_RULE",
            action: "DELETE",
            resourceId: "rule-1",
          }),
        })
      );
    });

    it("rejects deletion of rule from different org", async () => {
      mocks.findFirst.mockResolvedValue(null);

      const req = new Request("http://localhost/api/admin/automation-rules/rule-other", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: { id: "rule-other" } });
      expect(res.status).toBe(404);
      expect(mocks.deleteMock).not.toHaveBeenCalled();
    });
  });
});

