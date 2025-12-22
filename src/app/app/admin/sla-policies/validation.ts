import { TicketPriority } from "@prisma/client";
import { z } from "zod";

export const slaPolicySchema = z.object({
  priority: z.nativeEnum(TicketPriority, {
    required_error: "Priorytet jest wymagany",
  }),
  categoryId: z.string().trim().min(1).optional().nullable(),
  firstResponseHours: z.coerce.number().int().positive({
    message: "Czas pierwszej reakcji musi być większy od 0",
  }),
  resolveHours: z.coerce.number().int().positive({
    message: "Czas rozwiązania musi być większy od 0",
  }),
});

export type SlaPolicyInput = z.infer<typeof slaPolicySchema>;

export function validateSlaInput(input: Partial<SlaPolicyInput>) {
  return slaPolicySchema.safeParse(input);
}
