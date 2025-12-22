# Attachment picker UI (Issue #29)

## Manual checklist
- Login as requester and agent/admin.
- Open `/app/tickets/{id}` and verify attachments section renders.
- Upload a small file (PNG/txt) as public: see progress, success toast, and new row in list.
- Upload as internal (agent/admin): row shows "Wewnętrzny"; requester view does **not** show it.
- Try disallowed mime/size (if configured) to confirm server error surfaces.
- Simulate upload failure (e.g., disconnect) to see error + cleanup message.

## E2E outline
1. Authenticate as agent.
2. Navigate to ticket detail.
3. Upload public file, wait for completion, assert list row with filename and "Publiczny" badge.
4. Switch visibility to internal, upload second file, assert badge.
5. Reopen page as requester; verify only public file is listed.

## Notes
- Feature flag: set `NEXT_PUBLIC_ATTACHMENTS_ENABLED=false` to hide upload controls (readonly list remains).
- API contract: `POST /api/tickets/{id}/attachments` returns `{ attachment, uploadUrl }`; UI uploads via `PUT` to `uploadUrl`, then refreshes ticket data.
