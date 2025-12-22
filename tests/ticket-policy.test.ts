import { describe, expect, it } from "vitest";
import { Role, TicketStatus } from "@prisma/client";
import { canUpdateStatus, getAllowedStatuses } from "@/lib/ticket-policy";

describe("ticket-policy status rules", () => {
  it("allows requester owner to close their open ticket", () => {
    const allowed = getAllowedStatuses({
      role: Role.REQUESTER,
      isOwner: true,
      currentStatus: TicketStatus.NOWE,
    });
    expect(allowed).toContain(TicketStatus.ZAMKNIETE);
    expect(
      canUpdateStatus(
        { role: Role.REQUESTER, isOwner: true, currentStatus: TicketStatus.NOWE },
        TicketStatus.ZAMKNIETE
      )
    ).toBe(true);
  });

  it("allows requester owner to reopen when closed", () => {
    const allowed = getAllowedStatuses({
      role: Role.REQUESTER,
      isOwner: true,
      currentStatus: TicketStatus.ZAMKNIETE,
    });
    expect(allowed).toContain(TicketStatus.PONOWNIE_OTWARTE);
  });

  it("denies requester who is not owner", () => {
    const allowed = getAllowedStatuses({
      role: Role.REQUESTER,
      isOwner: false,
      currentStatus: TicketStatus.NOWE,
    });
    expect(allowed).toEqual([]);
    expect(
      canUpdateStatus(
        { role: Role.REQUESTER, isOwner: false, currentStatus: TicketStatus.NOWE },
        TicketStatus.ZAMKNIETE
      )
    ).toBe(false);
  });

  it("agents can choose any status", () => {
    const allowed = getAllowedStatuses({
      role: Role.AGENT,
      isOwner: false,
      currentStatus: TicketStatus.NOWE,
    });
    expect(allowed).toEqual(Object.values(TicketStatus));
  });
});
