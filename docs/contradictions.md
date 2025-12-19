# Contradictions

1. **docs/api-as-is.md › `/api/tickets/[id]/comments` section** — Describes a POST comment endpoint under `src/app/api/tickets/[id]/comments/route.ts` with auth/side effects, but no such route file exists (only `/api/auth`, `/api/tickets`, and `/api/tickets/[id]` are present, and searches for "comments" under `src/app/api` return nothing).【F:docs/api-as-is.md†L25-L30】【79078b†L1-L4】【f94be9†L1-L2】  
   **Fix:** Remove or mark this section as TODO until a real comments API is implemented.

2. **BLUEPRINT.md › Current State Analysis** — Claims API routes under `src/app/api` serve comments and lists a "Comment API" capability with citations to a non-existent `comments/route.ts`. Repo scan shows no comments endpoint files.【F:BLUEPRINT.md†L8-L25】【79078b†L1-L4】【f94be9†L1-L2】  
   **Fix:** Update the blueprint to note that comment APIs are absent and treat comment handling as a future gap.

3. **docs/known-issues.md › Items 2 & 5** — Cite behavior and validation of a `/api/tickets/[id]/comments` endpoint that is not present in the repository. The only API route files are `/api/auth`, `/api/tickets`, and `/api/tickets/[id]`; no `comments` subroute exists.【F:docs/known-issues.md†L7-L20】【79078b†L1-L4】【f94be9†L1-L2】  
   **Fix:** Remove or reframe these issues to note the missing endpoint instead of specific behaviors until the route is implemented.
