# Attachment upload API (skeleton)

Endpoint: `POST /api/tickets/{id}/attachments`

## Behavior
- Auth required; requester must own ticket, agents/admins must share organization.
- Validates `fileName`, `mimeType`, `sizeBytes`, optional `visibility` ("public"|"internal", default public).
- Enforces size limit and allowed mime types; rejects with `400` and `{ error }` when invalid.
- On success returns `201` with `{ attachment, uploadUrl }`; `filePath` encodes visibility + key.

## Configuration (env)
- `ATTACH_MAX_BYTES` (default `26214400` = 25 MB).
- `ATTACH_ALLOWED_MIME` (default `image/png,image/jpeg,application/pdf,text/plain`).
- `STORAGE_BASE_URL` (default `http://localhost:3000/uploads`).

## Storage utility
- Defined in `src/lib/storage.ts`; currently generates opaque path + presigned URL placeholder (no external storage required).
