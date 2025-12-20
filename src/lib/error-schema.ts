import { z } from "zod";

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export function buildErrorResponse(error: string, code?: string, details?: unknown): ErrorResponse {
  return {
    error,
    ...(code ? { code } : {}),
    ...(details ? { details } : {}),
  };
}

export function validateErrorResponse(payload: unknown) {
  return errorResponseSchema.safeParse(payload);
}
