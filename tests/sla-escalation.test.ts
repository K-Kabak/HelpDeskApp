import { describe, expect, it, vi } from "vitest";
import { deriveNextEscalation, nextEscalationLevel } from "@/lib/sla-escalation";
import { TicketPriority } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    slaEscalationLevel: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
const { slaEscalationLevel } = prisma;

describe("nextEscalationLevel", () => {
  it("returns null when path empty", () => {
    expect(nextEscalationLevel([], undefined)).toBeNull();
  });

  it("returns first level when no current level", () => {
    const levels = [
      { level: 1, teamId: "team-1" },
      { level: 2, teamId: "team-2" },
    ];
    expect(nextEscalationLevel(levels)).toEqual(levels[0]);
  });

  it("returns next level sequentially", () => {
    const levels = [
      { level: 1, teamId: "team-1" },
      { level: 2, teamId: "team-2" },
    ];
    expect(nextEscalationLevel(levels, 1)).toEqual(levels[1]);
    expect(nextEscalationLevel(levels, 2)).toBeNull();
  });
});

describe("deriveNextEscalation", () => {
  it("falls back to base path", async () => {
    slaEscalationLevel.findMany.mockResolvedValueOnce([]);
    slaEscalationLevel.findMany.mockResolvedValueOnce([
      { level: 1, teamId: "team-base" },
    ]);

    const next = await deriveNextEscalation({
      organizationId: "org",
      priority: TicketPriority.WYSOKI,
      categoryId: "cat",
    });

    expect(next).toEqual({ level: 1, teamId: "team-base" });
  });

  it("returns null when no levels at all", async () => {
    slaEscalationLevel.findMany.mockResolvedValue([]);
    const next = await deriveNextEscalation({
      organizationId: "org",
      priority: TicketPriority.SREDNI,
    });
    expect(next).toBeNull();
  });
});
