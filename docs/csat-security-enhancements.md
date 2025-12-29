# CSAT Security Enhancements

## Overview
Implemented token-based security for CSAT (Customer Satisfaction) surveys to prevent gaming, ensure one-time use, and add expiry controls.

## Security Features Implemented

### 1. Signed Token Generation
- **Location**: `src/lib/csat-token.ts`
- **Method**: HMAC-SHA256 signed tokens
- **Format**: `base64url(ticketId:expiresAt:signature)`
- **Secret**: Uses `CSAT_SECRET` environment variable (falls back to `NEXTAUTH_SECRET`)
- **Expiry**: Configurable (default: 30 days)

### 2. Token Validation
- **Timing-safe comparison**: Prevents timing attacks
- **Expiry checking**: Tokens automatically expire after set duration
- **Signature verification**: Ensures token hasn't been tampered with
- **Ticket binding**: Tokens are bound to specific ticket IDs

### 3. Database Schema Updates
- **Migration**: `20251224000000_add_csat_token_security`
- **New fields on `CsatRequest`**:
  - `token` (TEXT, UNIQUE): Signed token for CSAT submission
  - `expiresAt` (TIMESTAMP): Token expiration time
- **Indexes**: Added for efficient token lookups and expiry checks

### 4. API Endpoint Security
- **Location**: `src/app/api/tickets/[id]/csat/route.ts`
- **Token-based authentication**: Primary method (no session required)
- **Session fallback**: Backward compatibility for authenticated users
- **Validation checks**:
  - Token signature verification
  - Token expiry validation
  - Ticket ID matching
  - Database token existence check
  - One-time use enforcement (prevents duplicate submissions)

### 5. CSAT Request Creation
- **Location**: `src/app/api/tickets/[id]/route.ts`
- **Token generation**: Automatically generates signed token when ticket is resolved/closed
- **Email integration**: Token included in notification data for email templates
- **Idempotency**: Prevents duplicate CSAT requests for same ticket

### 6. UI Updates
- **Location**: `src/app/app/tickets/[id]/csat/page.tsx`
- **Token support**: Extracts token from URL query parameters
- **Flexible submission**: Supports both token-based and session-based access

## Security Benefits

1. **Anti-Gaming**: Tokens are cryptographically signed and cannot be forged
2. **Expiry Control**: Tokens automatically expire after 30 days (configurable)
3. **One-Time Use**: Database-level enforcement prevents token reuse
4. **Ticket Binding**: Tokens are bound to specific ticket IDs
5. **Timing Attack Prevention**: Uses timing-safe comparison for signature verification
6. **No Session Required**: Requesters can submit CSAT without logging in (token-based)

## Usage

### Email Template
Email templates should include the CSAT link with token:
```
/app/tickets/{{ticketId}}/csat?token={{csatToken}}
```

### API Usage
```typescript
// Generate token
const token = generateCsatToken(ticketId, 30); // 30 days expiry

// Validate token
const result = validateCsatToken(token);
if (result) {
  console.log(`Token valid for ticket: ${result.ticketId}`);
  console.log(`Expires at: ${new Date(result.expiresAt)}`);
}
```

## Environment Variables

- `CSAT_SECRET`: Secret key for token signing (optional, defaults to `NEXTAUTH_SECRET`)
- `NEXTAUTH_SECRET`: Fallback secret if `CSAT_SECRET` not set

## Testing

Comprehensive security tests in `tests/csat-token-security.test.ts`:
- Token generation and validation
- Expiry handling
- Signature tampering detection
- Token binding verification
- Secret mismatch detection

## Migration Notes

- Existing `CsatRequest` records will have `NULL` tokens
- These will need to be regenerated when tickets are resolved/closed again
- Application gracefully handles `NULL` tokens (session-based fallback)

## Future Enhancements

- [ ] Rate limiting on token validation attempts
- [ ] Token revocation capability
- [ ] Audit logging for token usage
- [ ] Configurable expiry per organization
















