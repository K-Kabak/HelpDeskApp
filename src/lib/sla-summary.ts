import { Ticket } from "@prisma/client";
import { closedStatuses, getSlaStatus, SlaState } from "./sla-status";

type TicketSlaFields = Pick<
  Ticket,
  "status" | "firstResponseAt" | "firstResponseDue" | "resolveDue" | "resolvedAt" | "closedAt"
>;

export type SlaStateCount = Record<SlaState, number>;

export function getOpenTicketSlaCounts(tickets: TicketSlaFields[]): SlaStateCount {
  return tickets.reduce<SlaStateCount>(
    (acc, ticket) => {
      if (closedStatuses.includes(ticket.status) || ticket.resolvedAt || ticket.closedAt) {
        return acc;
      }

      const { state } = getSlaStatus(ticket);
      acc[state] = (acc[state] ?? 0) + 1;
      return acc;
    },
    { breached: 0, healthy: 0 },
  );
}
