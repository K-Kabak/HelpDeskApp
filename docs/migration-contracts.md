# Migration Plan (Contracts)

Guidance to move from AS-IS to Target contracts with minimal disruption.

## Phased Steps
1. **Stabilize errors**: Introduce standardized error envelope while keeping `{ error }` fallback. Provide feature flag to opt-in per route. Update clients to handle new structure.
2. **Pagination rollout**: Add optional `limit/offset` to GET `/api/tickets`; default to 20 after telemetry confirms client readiness. Update dashboard queries accordingly.
3. **Search fix**: Replace `description` filter with `descriptionMd` in dashboard/API; ship as bugfix (no version bump).【F:src/app/app/page.tsx†L52-L66】
4. **Org check for comments**: Enforce organization match on comment creation; release with clear changelog; add monitoring for 404 spikes.【F:src/app/api/tickets/[id]/comments/route.ts†L21-L39】
5. **Idempotency keys**: Accept `Idempotency-Key` headers on POSTs (tickets/comments/attachments); log duplicate attempts; later require header after client adoption.
6. **ETag/If-Match**: Add `etag` to ticket responses and optional `If-Match` handling; shift to required after two releases.
7. **Attachment endpoints**: Introduce upload/download APIs with AV scanning and signed URLs; mark as beta and block downloads until scan complete.
8. **Audit list endpoint**: Expose `/api/tickets/{id}/audit-events` with pagination; keep internal to agents/admins initially.
9. **Rate limiting**: Implement per-user rate limits with 429 response; begin with generous thresholds and tighten gradually.
10. **Deprecations**: Document retirement dates for legacy behaviors (unpaged lists, lack of org check on comments) and add `Warning` headers during transition.

## Client Updates
- Update dashboard queries to include pagination/search parameters and handle new page metadata.
- Handle standardized error envelope and new status codes (412, 409, 429).
- Send `Idempotency-Key` for all POSTs; include `If-Match` for ticket updates once etags exposed.
- Adjust comment submission to respect org scope errors (404/403).
- Integrate attachment upload using signed URLs and scan status polling.

## Data Migration Notes
- Add attachment visibility/metadata columns via `prisma migrate dev --name attach_visibility_metadata` (applies migration `202512220156_attach_visibility_metadata`). Defaults are safe (`visibility` defaults to `INTERNAL`, `metadata` nullable).
- Add category taxonomy table via `prisma migrate dev --name category_taxonomy` (migration `202512220309_category_taxonomy`). Seeds add Networking/Hardware/Software to the Demo org; rerun `pnpm prisma:seed` to populate.
- Add SLA pause/resume tracking columns via `prisma migrate dev --name sla_pause_resume` (migration `202512220418_sla_pause_resume`). Fields: `slaPausedAt` (current pause start), `slaResumedAt` (last resume), `slaPauseTotalSeconds` (accumulated paused seconds, default 0).
- Add notification preferences via `prisma migrate dev --name notification_preferences` (migration `202512221521_notification_preferences`). Default toggles are all `true` for email/in-app ticket/comment updates; seed populates preferences for demo users.
- Verify with `\d "Attachment"` or `SELECT visibility, metadata FROM "Attachment" LIMIT 5;`, `SELECT name FROM "Category" LIMIT 5;`, `SELECT slaPausedAt, slaResumedAt, slaPauseTotalSeconds FROM "Ticket" LIMIT 5;`, and `SELECT emailTicketUpdates, inAppTicketUpdates FROM "NotificationPreference" LIMIT 5;` after migration.
- SLA recalculations may need backfill for existing tickets once logic added.

## Observability & Rollout
- Add logging for idempotency dedup hits, pagination adoption (presence of params), and org check failures.
- Feature-flag new behaviors; enable per environment before global rollout.
