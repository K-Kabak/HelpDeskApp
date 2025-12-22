import { describe, expect, it, beforeEach, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  adminAuditCreate: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    adminAudit: {
      create: mocks.adminAuditCreate,
    },
  },
}));

import { recordAdminAudit } from "@/lib/admin-audit";

describe("recordAdminAudit", () => {
  beforeEach(() => {
    mocks.adminAuditCreate.mockReset();
  });

  it("persists SLA audit records", async () => {
    await recordAdminAudit({
      actorId: "admin-1",
      organizationId: "org-1",
      resource: "SLA",
      resourceId: "policy-1",
      action: "CREATE",
      data: { priority: "WYSOKI" },
    });

    expect(mocks.adminAuditCreate).toHaveBeenCalledWith({
      data: {
        actorId: "admin-1",
        organizationId: "org-1",
        resource: "SLA",
        resourceId: "policy-1",
        action: "CREATE",
        data: { priority: "WYSOKI" },
      },
    });
  });

  it("accepts other resource types and defaults missing data to null", async () => {
    await recordAdminAudit({
      actorId: "admin-2",
      organizationId: "org-1",
      resource: "USER",
      resourceId: "user-2",
      action: "DELETE",
    });

    expect(mocks.adminAuditCreate).toHaveBeenCalledWith({
      data: {
        actorId: "admin-2",
        organizationId: "org-1",
        resource: "USER",
        resourceId: "user-2",
        action: "DELETE",
        data: null,
      },
    });
  });
});
