import { Ticket, TicketStatus } from "@prisma/client";

export type SlaState = "breached" | "healthy";

export type SlaStatus = {
  state: SlaState;
  label: string;
};

const closedStatuses: TicketStatus[] = [TicketStatus.ROZWIAZANE, TicketStatus.ZAMKNIETE];

export function getSlaStatus(ticket: Pick<Ticket, "status" | "firstResponseAt" | "firstResponseDue" | "resolveDue" | "closedAt" | "resolvedAt">): SlaStatus {
  // If ticket is closed/resolved, SLA is considered satisfied.
  if (closedStatuses.includes(ticket.status) || ticket.resolvedAt || ticket.closedAt) {
    return { state: "healthy", label: "SLA met" };
  }

  const now = Date.now();

  // Breach if resolution due has passed
  if (ticket.resolveDue && now > ticket.resolveDue.getTime()) {
    return { state: "breached", label: "Past due (resolution)" };
  }

  // Breach if first response due has passed and no response timestamp yet
  if (ticket.firstResponseDue && !ticket.firstResponseAt && now > ticket.firstResponseDue.getTime()) {
    return { state: "breached", label: "Past due (first response)" };
  }

  const nextDue =
    ticket.firstResponseAt || !ticket.firstResponseDue
      ? ticket.resolveDue
      : ticket.firstResponseDue;

  if (nextDue) {
    const mins = Math.max(Math.round((nextDue.getTime() - now) / 60000), 0);
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const label =
      hours > 0
        ? `SLA za ${hours}h ${minutes}m`
        : `SLA za ${minutes}m`;
    return { state: "healthy", label };
  }

  return { state: "healthy", label: "SLA w toku" };
}
