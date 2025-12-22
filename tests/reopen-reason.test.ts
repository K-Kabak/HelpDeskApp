import { describe, expect, it } from "vitest";
import { TicketStatus } from "@prisma/client";
import { needsReopenReason, validateReopenReason } from "@/lib/reopen-reason";

describe("reopen reason helpers", () => {
  it("requires reason when reopening", () => {
    expect(needsReopenReason(TicketStatus.PONOWNIE_OTWARTE)).toBe(true);
    expect(needsReopenReason(TicketStatus.NOWE)).toBe(false);
  });

  it("validates required length", () => {
    const short = validateReopenReason("too short");
    expect(short.valid).toBe(false);
    expect(short.message).toMatch(/10 znaków/);

    const long = validateReopenReason("a".repeat(501));
    expect(long.valid).toBe(false);
    expect(long.message).toMatch(/500 znaków/);

    const ok = validateReopenReason("Długi, uzasadniony powód");
    expect(ok.valid).toBe(true);
  });
});
