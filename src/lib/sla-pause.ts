export type SlaPauseState = {
  slaPausedAt: Date | null | undefined;
  slaResumedAt: Date | null | undefined;
  slaPauseTotalSeconds: number;
};

/**
 * Start an SLA pause (e.g., when waiting on requester). Does not persist; callers should write returned fields back to the Ticket.
 * TODO: wire to status transitions once pause rules are finalized.
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
 * TODO: call from ticket status/assignment changes when SLA resume triggers are defined.
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
