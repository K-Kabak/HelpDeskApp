import { describe, expect, it } from "vitest";
import { TicketStatus } from "@prisma/client";

import { deriveSlaPauseUpdates } from "@/lib/sla-pause";

describe("deriveSlaPauseUpdates", () => {
  const baseTicket = {
    status: TicketStatus.W_TOKU,
    firstResponseDue: new Date("2025-12-22T10:00:00.000Z"),
    resolveDue: new Date("2025-12-22T14:00:00.000Z"),
    slaPausedAt: null,
    slaResumedAt: null,
    slaPauseTotalSeconds: 0,
  };

  it("starts a pause when transitioning into waiting on requester", () => {
    const now = new Date("2025-12-22T11:00:00.000Z");
    const updates = deriveSlaPauseUpdates(baseTicket, TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA, now);

    expect(updates.slaPausedAt).toEqual(now);
    expect(updates.slaResumedAt).toBeNull();
    expect(updates.slaPauseTotalSeconds).toBe(0);
  });

  it("resumes a pause and shifts due dates when leaving waiting status", () => {
    const pausedTicket = {
      status: TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA,
      firstResponseDue: new Date("2025-12-22T11:00:00.000Z"),
      resolveDue: new Date("2025-12-22T15:00:00.000Z"),
      slaPausedAt: new Date("2025-12-22T10:00:00.000Z"),
      slaResumedAt: null,
      slaPauseTotalSeconds: 0,
    };
    const resumeTime = new Date("2025-12-22T11:05:30.000Z");
    const updates = deriveSlaPauseUpdates(pausedTicket, TicketStatus.W_TOKU, resumeTime);

    const expectedSeconds = Math.floor(
      (resumeTime.getTime() - pausedTicket.slaPausedAt.getTime()) / 1000
    );

    expect(updates.slaPausedAt).toBeNull();
    expect(updates.slaResumedAt).toEqual(resumeTime);
    expect(updates.slaPauseTotalSeconds).toBe(expectedSeconds);
    expect(updates.firstResponseDue?.getTime()).toBe(
      pausedTicket.firstResponseDue.getTime() + expectedSeconds * 1000
    );
    expect(updates.resolveDue?.getTime()).toBe(
      pausedTicket.resolveDue.getTime() + expectedSeconds * 1000
    );
  });
});
