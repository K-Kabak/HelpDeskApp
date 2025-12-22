import { TicketPriority } from "@prisma/client";
import { addHours } from "date-fns";

export type SlaPolicyShape = {
  priority: TicketPriority;
  firstResponseHours: number | null;
  resolveHours: number | null;
  category?: { id: string; name: string } | null;
};

export type SlaDueDates = {
  firstResponseDue: Date | null;
  resolveDue: Date | null;
};

export function computeSlaDueDates(policy: SlaPolicyShape | null, now = new Date()): SlaDueDates {
  if (!policy) {
    return { firstResponseDue: null, resolveDue: null };
  }

  const firstResponseDue =
    typeof policy.firstResponseHours === "number" ? addHours(now, policy.firstResponseHours) : null;
  const resolveDue = typeof policy.resolveHours === "number" ? addHours(now, policy.resolveHours) : null;

  return { firstResponseDue, resolveDue };
}

export function toIsoDueDates(dates: SlaDueDates) {
  return {
    firstResponseDue: dates.firstResponseDue ? dates.firstResponseDue.toISOString() : null,
    resolveDue: dates.resolveDue ? dates.resolveDue.toISOString() : null,
  };
}
