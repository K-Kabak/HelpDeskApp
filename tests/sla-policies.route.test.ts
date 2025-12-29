import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketPriority } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  jsonMock: vi.fn((body, init?: { status?: number; headers?: Record<string, string> }) =>
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    })
  ),
  requireAuth: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
  findCategory: vi.fn(),
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
    slaPolicy: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      create: mocks.create,
      findUnique: mocks.findUnique,
      update: mocks.update,
      delete: mocks.deleteMock,
    },
    category: {
      findUnique: mocks.findCategory,
    },
    adminAudit: {
      create: mocks.adminAuditCreate,
    },
  },
}));

import { POST, GET } from "@/app/api/admin/sla-policies/route";
import { PATCH, DELETE } from "@/app/api/admin/sla-policies/[id]/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAuth.mockResolvedValue({
    ok: true,
    user: { id: "admin-1", role: "ADMIN", organizationId: "org-1" },
  });
  mocks.adminAuditCreate.mockResolvedValue({ id: "admin-audit-1" });
});

describe("SLA policy admin API", () => {
  it("creates policy for org with category override", async () => {
    const categoryId = "11111111-1111-1111-1111-111111111111";
    mocks.findCategory.mockResolvedValue({ id: categoryId, organizationId: "org-1" });
    mocks.findFirst.mockResolvedValue(null);
    const created = {
      id: "policy-1",
      organizationId: "org-1",
      priority: TicketPriority.WYSOKI,
      categoryId,
      firstResponseHours: 2,
      resolveHours: 12,
      category: { id: categoryId, name: "Networking" },
    };
    mocks.create.mockResolvedValue(created);

    const req = new Request("http://localhost/api/admin/sla-policies", {
      method: "POST",
      body: JSON.stringify({
        priority: TicketPriority.WYSOKI,
        categoryId,
        firstResponseHours: 2,
        resolveHours: 12,
      }),
    });

    await POST(req);
    const lastCall = mocks.jsonMock.mock.calls.at(-1)!;
    if (lastCall[1]?.status !== 201) {
      throw new Error(`unexpected status ${lastCall[1]?.status}: ${JSON.stringify(lastCall[0])}`);
    }
    expect(lastCall[0]).toEqual({ policy: created });
    expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: "admin-1",
          organizationId: "org-1",
          resource: "SLA",
          resourceId: created.id,
          action: "CREATE",
          data: expect.objectContaining({
            priority: TicketPriority.WYSOKI,
            categoryId,
            firstResponseHours: 2,
            resolveHours: 12,
          }),
        }),
      }),
    );
  });

  it("rejects non-admin user", async () => {
    mocks.requireAuth.mockResolvedValue({
      ok: true,
      user: { id: "agent-1", role: "AGENT", organizationId: "org-1" },
    });

    const req = new Request("http://localhost/api/admin/sla-policies", {
      method: "POST",
      body: JSON.stringify({
        priority: TicketPriority.SREDNI,
        firstResponseHours: 4,
        resolveHours: 10,
      }),
    });

  const res = await POST(req);
  expect(res.status).toBe(403);
  expect(mocks.adminAuditCreate).not.toHaveBeenCalled();
});

  it("lists policies scoped to org", async () => {
    mocks.findMany.mockResolvedValue([{ id: "policy-1" }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.policies).toHaveLength(1);
    expect(mocks.adminAuditCreate).not.toHaveBeenCalled();
  });

  it("prevents updating policy from another org", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "policy-2",
      organizationId: "other-org",
      priority: TicketPriority.SREDNI,
      categoryId: null,
    });
    const req = new Request("http://localhost/api/admin/sla-policies/policy-2", {
      method: "PATCH",
      body: JSON.stringify({ resolveHours: 5 }),
    });

    const res = await PATCH(req, { params: { id: "policy-2" } });
    expect(res.status).toBe(404);
  });

  it("records audit when updating policy for org", async () => {
    const existing = {
      id: "policy-4",
      organizationId: "org-1",
      priority: TicketPriority.SREDNI,
      categoryId: null,
      firstResponseHours: 4,
      resolveHours: 24,
    };
    const updated = {
      id: "policy-4",
      organizationId: "org-1",
      priority: TicketPriority.SREDNI,
      categoryId: null,
      firstResponseHours: 4,
      resolveHours: 20,
      category: { id: null, name: null },
    };
    mocks.findUnique.mockResolvedValue(existing);
    mocks.findFirst.mockResolvedValue(null);
    mocks.update.mockResolvedValue(updated);

    const req = new Request("http://localhost/api/admin/sla-policies/policy-4", {
      method: "PATCH",
      body: JSON.stringify({ resolveHours: 20 }),
    });

    const res = await PATCH(req, { params: { id: "policy-4" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.policy).toEqual(updated);
    expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          resource: "SLA",
          resourceId: "policy-4",
          action: "UPDATE",
          data: expect.objectContaining({
            changes: expect.objectContaining({
              resolveHours: { from: 24, to: 20 },
            }),
            previous: expect.objectContaining({ resolveHours: 24 }),
            next: expect.objectContaining({ resolveHours: 20 }),
          }),
        }),
      }),
    );
  });

  it("deletes policy for admin org", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "policy-3",
      organizationId: "org-1",
      priority: TicketPriority.KRYTYCZNY,
      categoryId: "cat-1",
      firstResponseHours: 1,
      resolveHours: 8,
    });
    mocks.deleteMock.mockResolvedValue({});

    const res = await DELETE(new Request("http://localhost"), { params: { id: "policy-3" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
    expect(mocks.adminAuditCreate).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({
        resource: "SLA",
        resourceId: "policy-3",
        action: "DELETE",
        data: expect.objectContaining({
          priority: TicketPriority.KRYTYCZNY,
          categoryId: "cat-1",
          firstResponseHours: 1,
          resolveHours: 8,
        }),
      }),
    }),
    );
  });
});
