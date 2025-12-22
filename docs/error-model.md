# Error Model

Defines the shared error envelope and examples for REST APIs.

## AS-IS Behavior
- Handlers return `{ error: string | object }`.
- Common strings: `"Unauthorized"`, `"Forbidden"`, `"Not found"`, `"No changes"`, `"Status update required"`.
- Validation errors return Zod's `flatten()` output at `error`.

## Target Envelope
```json
{
  "error": {
    "code": "string",        // machine-readable code (e.g., AUTH_REQUIRED, VALIDATION_FAILED)
    "message": "string",     // human-readable summary
    "details": { },           // optional structured validation issues or field-level errors
    "traceId": "string"      // optional correlation ID for observability
  }
}
```

## Error Codes (target catalog)
- AUTH_REQUIRED
- FORBIDDEN
- NOT_FOUND
- VALIDATION_FAILED
- CONFLICT
- RATE_LIMITED
- INTERNAL_ERROR

## Examples

**Authentication required (AS-IS)**
```json
{
  "error": "Unauthorized"
}
```

**Validation error (AS-IS Zod flatten)**
```json
{
  "error": {
    "fieldErrors": {
      "title": ["String must contain at least 3 character(s)"]
    },
    "formErrors": []
  }
}
```

**Not found (AS-IS)**
```json
{
  "error": "Not found"
}
```

**Conflict (target format, when optimistic locking/idempotency is added)**
```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Idempotency key replayed with different payload"
  }
}
```

**Internal error (target format)**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Unexpected error",
    "traceId": "abc123"
  }
}
```
