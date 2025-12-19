# Error Model

Defines common error envelope for REST APIs. AS-IS handlers return `{ error: string | object }`; target contract standardizes shape.

## Standard Envelope (Target)
```json
{
  "error": {
    "code": "string",        // machine-readable error code (e.g., AUTH_REQUIRED, VALIDATION_FAILED)
    "message": "string",     // human-readable summary
    "details": { ... },       // optional structured validation issues or field-level errors
    "traceId": "string"      // optional correlation ID for observability
  }
}
```

## HTTP Status Mapping
- `400 Bad Request`: Validation failures, malformed JSON, missing required fields.
- `401 Unauthorized`: Missing/invalid session (AS-IS uses `{ error: "Unauthorized" }`).【F:src/app/api/tickets/route.ts†L16-L44】
- `403 Forbidden`: Authenticated but lacks permission (role/org mismatch, requester trying restricted update).【F:src/app/api/tickets/[id]/route.ts†L59-L116】【F:src/app/api/tickets/[id]/comments/route.ts†L32-L39】
- `404 Not Found`: Missing resource or wrong organization.【F:src/app/api/tickets/[id]/route.ts†L35-L41】【F:src/app/api/tickets/[id]/comments/route.ts†L21-L25】
- `409 Conflict`: Reserved for future concurrency/idempotency violations (target behavior).
- `429 Too Many Requests`: Reserved for future rate limiting (target behavior).
- `500 Internal Server Error`: Unexpected failures; include `traceId` when available.

## Validation Error Structure
- AS-IS: Zod `.flatten()` output returned directly under `error` key for create/update/comment endpoints.【F:src/app/api/tickets/route.ts†L46-L50】【F:src/app/api/tickets/[id]/comments/route.ts†L26-L30】
- Target: Normalize to `error.details.fieldErrors` and `error.details.formErrors` mirroring Zod format, with consistent codes `VALIDATION_FAILED`.

## Error Codes (Target Catalog)
- `AUTH_REQUIRED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_FAILED`
- `CONFLICT`
- `RATE_LIMITED`
- `INTERNAL_ERROR`
- `UNPROCESSABLE_ATTACHMENT` (upload/scan failures)

## Localization
- Messages may be localized client-side; server returns English base text by default.
