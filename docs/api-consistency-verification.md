# API Consistency Verification Report

This document verifies the consistency of response formats, error handling, and pagination across all API endpoints.

## Response Format Consistency

### Success Responses

#### List Endpoints
- **Tickets**: `{ items: Ticket[], nextCursor?: string, prevCursor?: string }` ✅
- **Users**: `{ users: User[] }` ⚠️ (inconsistent - should use `items` or document difference)
- **Teams**: `{ teams: Team[] }` ⚠️ (inconsistent)
- **Categories**: `{ categories: Category[] }` ⚠️ (inconsistent)
- **Tags**: `{ tags: Tag[] }` ⚠️ (inconsistent)
- **Views**: `{ views: View[] }` ⚠️ (inconsistent)
- **Notifications**: `{ notifications: Notification[] }` ⚠️ (inconsistent)
- **Audit Events**: `{ events: AuditEvent[], page?: { limit, offset, total } }` ⚠️ (uses offset pagination)

#### Single Resource Endpoints
- **Ticket**: `{ ticket: Ticket }` ✅
- **User**: `{ user: User }` ✅
- **Team**: `{ team: Team }` ✅
- **Attachment**: `{ attachment: Attachment, uploadUrl?: string, downloadUrl?: string }` ✅
- **CSAT Response**: `{ response: CsatResponse }` ✅

#### Action Endpoints
- **Bulk Update**: `{ success: number, failed: number, errors: [] }` ✅
- **Delete**: `{ success: true }` or `{ ok: true }` ⚠️ (inconsistent - some use `success`, some use `ok`)

### Error Responses

All endpoints consistently use:
```json
{
  "error": "string" | { "fieldErrors": {}, "formErrors": [] }
}
```

**Status Codes:**
- `400`: Validation errors (Zod flatten format)
- `401`: Unauthorized (missing/invalid session)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `409`: Conflict (e.g., duplicate CSAT submission)
- `500`: Internal server error

**Consistency:** ✅ All error responses follow the same format.

## Pagination Consistency

### Cursor-based Pagination
- **Tickets**: Uses `nextCursor` and `prevCursor` ✅
- **Comments**: Uses cursor pagination ✅

### Offset-based Pagination
- **Admin Audit Events**: Uses `{ page: { limit, offset, total } }` ⚠️ (different from tickets)

**Recommendation:** Standardize on cursor-based pagination for all list endpoints, or document the difference clearly.

## Response Property Naming

### Inconsistencies Found:
1. **List responses**: Some use `items`, others use pluralized names (`users`, `teams`, etc.)
2. **Delete responses**: Some use `success: true`, others use `ok: true`
3. **Pagination**: Mix of cursor-based and offset-based

### Recommendations:
1. **Standardize list responses** to use `items` for consistency, OR document that different resources use their pluralized name
2. **Standardize delete responses** to use `{ success: true }`
3. **Document pagination strategy** - cursor-based for tickets/comments, offset-based for audit events

## Timestamp Format

All timestamps are consistently in ISO 8601 format (UTC): ✅

```json
"createdAt": "2024-01-15T10:00:00Z"
```

## Enum Values

All enum values are consistently uppercase strings matching Prisma enums: ✅

- Status: `NOWE`, `W_TOKU`, `ROZWIAZANE`, `ZAMKNIETE`, etc.
- Priority: `NISKI`, `SREDNI`, `WYSOKI`, `KRYTYCZNY`
- Role: `REQUESTER`, `AGENT`, `ADMIN`

## Summary

### ✅ Consistent:
- Error response format
- Timestamp format (ISO 8601)
- Enum value format
- Single resource response format (`{ resource: Resource }`)

### ⚠️ Inconsistencies:
- List response property names (`items` vs pluralized names)
- Delete response format (`success` vs `ok`)
- Pagination strategy (cursor vs offset)

### 📝 Action Items:
1. Document the intentional differences in list response naming (or standardize)
2. Standardize delete response format
3. Document pagination strategy per endpoint type
4. Consider adding response schema validation in contract tests

