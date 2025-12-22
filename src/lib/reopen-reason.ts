import { TicketStatus } from "@prisma/client";

export function needsReopenReason(status: TicketStatus) {
  return status === TicketStatus.PONOWNIE_OTWARTE;
}

export function validateReopenReason(reason: string) {
  const trimmed = reason.trim();
  if (!trimmed) {
    return {
      valid: false,
      message: "Podaj powód ponownego otwarcia zgłoszenia.",
    };
  }
  if (trimmed.length < 10) {
    return {
      valid: false,
      message: "Powód musi mieć przynajmniej 10 znaków.",
    };
  }
  if (trimmed.length > 500) {
    return {
      valid: false,
      message: "Powód nie może przekraczać 500 znaków.",
    };
  }
  return { valid: true, message: "" };
}
