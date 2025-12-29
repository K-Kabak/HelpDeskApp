# Contradictions

This document tracks contradictions between documentation and the actual codebase. As of the last review, all previously documented contradictions have been resolved.

## Resolved Contradictions

### 1. Comment API Endpoint (RESOLVED)

**Previous Issue**: Documentation described a POST comment endpoint at `/api/tickets/[id]/comments` that was claimed to not exist.

**Current Status**: ✅ **RESOLVED** - The comment endpoint now exists at `src/app/api/tickets/[id]/comments/route.ts` and is fully implemented with:
- Authentication and authorization checks
- Organization scoping enforcement (`isSameOrganization` check)
- Rate limiting and spam guard
- Support for public and internal comments
- Markdown sanitization
- First response timestamp tracking
- Audit logging

**Verification**: The endpoint is implemented and functional. See `src/app/api/tickets/[id]/comments/route.ts` for implementation details.

### 2. Dashboard Search Field (RESOLVED)

**Previous Issue**: Documentation mentioned that dashboard search queries a `description` field that doesn't exist (schema uses `descriptionMd`).

**Current Status**: ✅ **RESOLVED** - Review of `src/app/app/page.tsx` shows no references to a non-existent `description` field. The search functionality appears to have been fixed or refactored.

**Note**: If search functionality exists, it should use `descriptionMd` or implement full-text search as appropriate.

## Current State

As of the last review, no active contradictions exist between the documentation and the codebase. The following features are confirmed to be implemented:

- ✅ Comment API endpoint (`/api/tickets/[id]/comments`)
- ✅ Organization scoping on comments
- ✅ Internal comment visibility controls
- ✅ Authentication and authorization
- ✅ Rate limiting and spam protection

## Maintenance

This document should be reviewed periodically to ensure documentation remains consistent with the codebase. When new features are added or existing features are modified, verify that:

1. Documentation accurately reflects the implementation
2. API documentation matches actual endpoints
3. Feature lists in README and guides are current
4. Known issues are updated when bugs are fixed

If new contradictions are discovered, document them here with:
- Description of the contradiction
- Location in documentation and code
- Proposed fix
- Status (pending/resolved)
