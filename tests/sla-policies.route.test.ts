import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketPriority } from "@prisma/client";

const mocks = vi.hoisted(() => ({
  jsonMock: vi.fn((body, init?: { status?: number; headers?: Record<string, string> }) => ({
    status: init?.status ?? 200,
    body,
    headers: init?.headers,
  })),
  requireAuth: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  deleteMock: vi.fn(),
  findCategory: vi.fn(),
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

    const res = await POST(req);
    const lastCall = mocks.jsonMock.mock.calls.at(-1)!;
    if (lastCall[1]?.status !== 201) {
      throw new Error(`unexpected status ${lastCall[1]?.status}: ${JSON.stringify(lastCall[0])}`);
    }
    expect(lastCall[0]).toEqual({ policy: created });
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
  });

  it("lists policies scoped to org", async () => {
    mocks.findMany.mockResolvedValue([{ id: "policy-1" }]);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.body.policies).toHaveLength(1);
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

  it("deletes policy for admin org", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "policy-3",
      organizationId: "org-1",
    });
    mocks.deleteMock.mockResolvedValue({});

    const res = await DELETE(new Request("http://localhost"), { params: { id: "policy-3" } });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
