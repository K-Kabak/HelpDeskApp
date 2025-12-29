import { Ticket, TicketStatus } from "@prisma/client";

export type SlaPauseState = {
  slaPausedAt: Date | null | undefined;
  slaResumedAt: Date | null | undefined;
  slaPauseTotalSeconds: number;
};

export type SlaPauseTransitionUpdates = {
  slaPausedAt?: Date | null;
  slaResumedAt?: Date | null;
  slaPauseTotalSeconds?: number;
  firstResponseDue?: Date;
  resolveDue?: Date;
};

/**
 * Start an SLA pause (e.g., when waiting on requester). Does not persist; callers should write returned fields back to the Ticket.
 * This is called automatically via deriveSlaPauseUpdates when a ticket transitions to OCZEKUJE_NA_UZYTKOWNIKA status.
 */
export function startSlaPause(state: SlaPauseState, now = new Date()): SlaPauseState {
  if (state.slaPausedAt) {
    return state;
  }
  return {
    ...state,
    slaPausedAt: now,
    slaResumedAt: null,
  };
}

/**
 * Resume an SLA pause and accumulate paused seconds. Safe if pause was never started.
 * This is called automatically via deriveSlaPauseUpdates when a ticket transitions out of OCZEKUJE_NA_UZYTKOWNIKA status.
 */
export function resumeSlaPause(state: SlaPauseState, now = new Date()): SlaPauseState {
  if (!state.slaPausedAt) {
    return state;
  }
  const elapsedSeconds = Math.max(
    0,
    Math.floor((now.getTime() - state.slaPausedAt.getTime()) / 1000)
  );
  return {
    slaPausedAt: null,
    slaResumedAt: now,
    slaPauseTotalSeconds: state.slaPauseTotalSeconds + elapsedSeconds,
  };
}

/**
 * Determine SLA pause field updates when a ticket transitions into or out of the waiting-for-requester status.
 */
export function deriveSlaPauseUpdates(
  ticket: Pick<Ticket, "status" | "firstResponseDue" | "resolveDue" | "slaPausedAt" | "slaResumedAt" | "slaPauseTotalSeconds">,
  targetStatus: TicketStatus | undefined,
  now = new Date()
): SlaPauseTransitionUpdates {
  if (!targetStatus || targetStatus === ticket.status) {
    return {};
  }

  const updates: SlaPauseTransitionUpdates = {};
  const wasWaiting = ticket.status === TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA;
  const willWait = targetStatus === TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA;
  const baseState: SlaPauseState = {
    slaPausedAt: ticket.slaPausedAt ?? null,
    slaResumedAt: ticket.slaResumedAt ?? null,
    slaPauseTotalSeconds: ticket.slaPauseTotalSeconds ?? 0,
  };

  if (!wasWaiting && willWait) {
    const next = startSlaPause(baseState, now);
    updates.slaPausedAt = next.slaPausedAt;
    updates.slaResumedAt = next.slaResumedAt;
    updates.slaPauseTotalSeconds = next.slaPauseTotalSeconds;
    return updates;
  }

  if (wasWaiting && !willWait) {
    const pausedSecondsBefore = ticket.slaPauseTotalSeconds ?? 0;
    const next = resumeSlaPause(baseState, now);
    const addedSeconds = next.slaPauseTotalSeconds - pausedSecondsBefore;
    if (addedSeconds > 0) {
      const deltaMs = addedSeconds * 1000;
      if (ticket.firstResponseDue) {
        updates.firstResponseDue = new Date(ticket.firstResponseDue.getTime() + deltaMs);
      }
      if (ticket.resolveDue) {
        updates.resolveDue = new Date(ticket.resolveDue.getTime() + deltaMs);
      }
    }
    updates.slaPausedAt = next.slaPausedAt;
    updates.slaResumedAt = next.slaResumedAt;
    updates.slaPauseTotalSeconds = next.slaPauseTotalSeconds;
    return updates;
  }

  return updates;
}
