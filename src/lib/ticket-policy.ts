import { Role, TicketStatus } from "@prisma/client";

export type StatusPolicyInput = {
  role: Role;
  isOwner: boolean;
  currentStatus: TicketStatus;
};

/**
 * Returns the list of statuses the current user is allowed to set, including the current status for select defaults.
 */
export function getAllowedStatuses({
  role,
  isOwner,
  currentStatus,
}: StatusPolicyInput): TicketStatus[] {
  if (role === "AGENT" || role === "ADMIN") {
    return Object.values(TicketStatus);
  }

  if (role !== "REQUESTER" || !isOwner) {
    return [];
  }

  const options = new Set<TicketStatus>([currentStatus]);

  if (currentStatus !== TicketStatus.ZAMKNIETE) {
    options.add(TicketStatus.ZAMKNIETE);
  }
  if (
    currentStatus === TicketStatus.ZAMKNIETE ||
    currentStatus === TicketStatus.ROZWIAZANE
  ) {
    options.add(TicketStatus.PONOWNIE_OTWARTE);
  }

  return Array.from(options);
}

/**
 * Checks whether a transition is allowed for the given user/ticket state.
 */
export function canUpdateStatus(
  input: StatusPolicyInput,
  targetStatus: TicketStatus
): boolean {
  const allowed = getAllowedStatuses(input);
  return allowed.includes(targetStatus) && allowed.length > 0;
}
