import { z } from "zod";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const errorResponseSchema = z.object({
  error: z.union([
    z.string(),
    z.object({
      fieldErrors: z.record(z.array(z.string())).optional(),
      formErrors: z.array(z.string()).optional(),
    }),
  ]),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Builds a standardized error response object.
 * 
 * @param error - Error message string or Zod validation error flattened object
 * @param code - Optional machine-readable error code (e.g., "AUTH_REQUIRED", "VALIDATION_FAILED")
 * @param details - Optional additional error details
 * @returns Standardized error response object
 */
export function buildErrorResponse(
  error: string | ReturnType<ZodError["flatten"]>,
  code?: string,
  details?: unknown
): ErrorResponse {
  return {
    error: error as string | { fieldErrors?: Record<string, string[]>; formErrors?: string[] },
    ...(code ? { code } : {}),
    ...(details ? { details } : {}),
  };
}

/**
 * Validates that a payload matches the error response schema.
 */
export function validateErrorResponse(payload: unknown) {
  return errorResponseSchema.safeParse(payload);
}

/**
 * Error codes following the target error model (see docs/error-model.md)
 */
export const ErrorCodes = {
  AUTH_REQUIRED: "AUTH_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * Creates a NextResponse with standardized error format.
 * 
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @param code - Optional machine-readable error code
 * @param details - Optional additional error details
 * @returns NextResponse with error JSON
 */
export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    buildErrorResponse(message, code, details),
    { status }
  );
}

/**
 * Creates a validation error response from a Zod error.
 * 
 * @param error - Zod validation error
 * @param status - HTTP status code (default: 400)
 * @returns NextResponse with validation error JSON
 */
export function validationErrorResponse(error: ZodError, status: number = 400): NextResponse {
  const flattened = error.flatten();
  return NextResponse.json(
    buildErrorResponse(flattened, ErrorCodes.VALIDATION_FAILED),
    { status }
  );
}

/**
 * Common error response helpers for standard HTTP status codes.
 */
export const ErrorResponses = {
  unauthorized: (message: string = "Unauthorized") =>
    errorResponse(message, 401, ErrorCodes.AUTH_REQUIRED),
  
  forbidden: (message: string = "Forbidden") =>
    errorResponse(message, 403, ErrorCodes.FORBIDDEN),
  
  notFound: (message: string = "Not found") =>
    errorResponse(message, 404, ErrorCodes.NOT_FOUND),
  
  conflict: (message: string = "Conflict") =>
    errorResponse(message, 409, ErrorCodes.CONFLICT),
  
  rateLimited: (message: string = "Rate limit exceeded", retryAfter?: number) =>
    NextResponse.json(
      buildErrorResponse(message, ErrorCodes.RATE_LIMITED),
      {
        status: 429,
        headers: retryAfter ? { "Retry-After": `${retryAfter}` } : undefined,
      }
    ),
  
  internalError: (message: string = "Internal server error") =>
    errorResponse(message, 500, ErrorCodes.INTERNAL_ERROR),
};
