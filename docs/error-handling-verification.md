# Error Handling Verification Report

**Date:** 2025-01-27  
**Status:** ✅ Verified with recommendations

## Summary

This document verifies the consistency of error handling across all API endpoints, including status codes, error format, and retry logic.

## Error Response Format

### Current State (AS-IS)

The application uses two error response formats:

1. **Simple string errors**: `{ error: "Error message" }`
   - Used for: 401, 403, 404, 500 errors
   - Examples: "Unauthorized", "Forbidden", "Not found", "Internal server error"

2. **Zod validation errors**: `{ error: { fieldErrors: {...}, formErrors: [...] } }`
   - Used for: 400 validation errors from Zod schemas
   - Format matches Zod's `flatten()` output

### Target State

According to `docs/error-model.md`, the target format should be:
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {},
    "traceId": "string"
  }
}
```

**Note:** The current implementation is acceptable for production, but migration to the target format is planned for future iterations.

## Status Code Consistency

### Verified Status Codes

All endpoints consistently use the following status codes:

- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but insufficient permissions
- **404 Not Found**: Resource not found or access denied (for security)
- **409 Conflict**: Resource conflicts (e.g., duplicate email, CSAT already submitted)
- **429 Too Many Requests**: Rate limiting (with Retry-After header)
- **500 Internal Server Error**: Unexpected server errors

### Status Code Usage by Endpoint Type

| Endpoint Type | Common Status Codes |
|--------------|---------------------|
| Authentication | 401 |
| Authorization | 401, 403 |
| Resource Access | 404 (when not found or wrong org) |
| Validation | 400 |
| Rate Limiting | 429 |
| Server Errors | 500 |

## Error Response Patterns

### Pattern 1: Authentication Errors
```typescript
NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```
**Used in:** All endpoints via `requireAuth()` helper

### Pattern 2: Authorization Errors
```typescript
NextResponse.json({ error: "Forbidden" }, { status: 403 })
```
**Used in:** Role-based access checks, organization scoping

### Pattern 3: Not Found Errors
```typescript
NextResponse.json({ error: "Not found" }, { status: 404 })
```
**Used in:** Resource lookup failures, cross-organization access attempts

### Pattern 4: Validation Errors
```typescript
NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
```
**Used in:** Zod schema validation failures

### Pattern 5: Rate Limiting
```typescript
NextResponse.json(
  { error: "Rate limit exceeded" },
  { status: 429, headers: { "Retry-After": "60" } }
)
```
**Used in:** Rate limit middleware

## Retry Logic

### Client-Side Retry

**Current State:** No explicit client-side retry logic implemented in the frontend.

**Recommendation:** 
- Implement retry logic for transient failures (5xx errors, network errors)
- Use exponential backoff for retries
- Do not retry 4xx errors (except 429 with Retry-After)

### Server-Side Retry

**Worker Retry Policy:** Implemented in `src/worker/retry-policy.ts`

- **Max Attempts**: Configurable via `WORKER_MAX_ATTEMPTS` (default: 3)
- **Backoff**: Configurable via `WORKER_BACKOFF_MS` (default: 5000ms)
- **Dead Letter Queue**: Enabled by default via `WORKER_DLQ_ENABLED`

**Retry Decision Logic:**
- Retries until `maxAttempts - 1` is reached
- Sends to DLQ when attempts exhausted
- Drops job if `maxAttempts` is 0

### Rate Limiting Retry

**Retry-After Header:** Implemented for:
- Rate limit violations (429)
- Reopen cooldown (429)

Clients should respect the `Retry-After` header value (in seconds).

## Error Handling Utilities

### Created Utilities

A new error handling utility module (`src/lib/error-schema.ts`) provides:

1. **`errorResponse()`**: Creates standardized error responses
2. **`validationErrorResponse()`**: Handles Zod validation errors
3. **`ErrorResponses`**: Pre-built helpers for common errors (unauthorized, forbidden, notFound, etc.)
4. **`ErrorCodes`**: Machine-readable error codes following target model

### Migration Path

To standardize error handling across all endpoints:

1. Replace direct `NextResponse.json({ error: ... })` calls with utility functions
2. Gradually migrate to include error codes
3. Add trace IDs for production observability

## Verification Checklist

- ✅ Status codes are consistent across all endpoints
- ✅ Error format is consistent within each error type
- ✅ Validation errors use Zod's flatten format
- ✅ Authentication errors use "Unauthorized" message
- ✅ Authorization errors use "Forbidden" message
- ✅ Not found errors use "Not found" message
- ✅ Rate limiting includes Retry-After header
- ✅ Worker retry policy is implemented
- ⚠️ Client-side retry logic not implemented (recommended for future)
- ⚠️ Error codes not yet standardized (planned migration)

## Recommendations

1. **Short-term (Before Production):**
   - ✅ Error handling utilities created
   - Consider adding client-side retry logic for 5xx errors
   - Document error codes in API documentation

2. **Medium-term:**
   - Migrate to target error format with codes and trace IDs
   - Add error tracking/monitoring integration
   - Implement retry logic in API client

3. **Long-term:**
   - Full migration to structured error format
   - Error analytics and alerting
   - Automated error response testing

## Files Verified

- `src/app/api/**/*.ts` - All API route handlers
- `src/lib/authorization.ts` - Auth error responses
- `src/lib/rate-limit.ts` - Rate limit error responses
- `src/worker/retry-policy.ts` - Worker retry logic
- `src/lib/error-schema.ts` - Error response utilities

## Conclusion

Error handling is **consistent and production-ready** with the following characteristics:

- ✅ Consistent status code usage
- ✅ Predictable error message format
- ✅ Proper validation error handling
- ✅ Rate limiting with retry guidance
- ✅ Worker retry policy implemented
- ⚠️ Client-side retry recommended for resilience

The current implementation follows best practices and is suitable for production deployment. Future enhancements can be made incrementally without breaking changes.

