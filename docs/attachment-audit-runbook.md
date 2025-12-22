# Attachment Audit Runbook

## Scope
- AuditEvent records for attachment operations on tickets.
- Actions used:
  - `ATTACHMENT_UPLOADED`
  - `ATTACHMENT_DELETED`
- Schema: `AuditEvent` table (JSON `data.attachment` payload with `attachmentId`, `fileName`, `mimeType`, `sizeBytes`, `visibility`, `storagePath`).
- No additional migrations required (uses existing `AuditEvent`).

## Redaction rules
- Never store or export presigned URLs; only persist `storagePath` (key) and metadata.
- When exporting, drop or hash `fileName` if sharing outside the tenant/security team.
- Do not expose `storagePath` to requesters outside their org; scope queries by `organizationId` via the joined ticket.
- When attaching logs to incidents, scrub any PII in `fileName`.

## Runbook: investigate attachment activity
1) Set context variables:
   ```sql
   -- required: ticket id and org id
   \set ticket_id 'TICKET_UUID'
   \set org_id 'ORG_UUID'
   ```
2) Recent attachment events for a ticket:
   ```sql
   SELECT ae.action,
          ae."createdAt",
          a."fileName",
          a."mimeType",
          a."sizeBytes",
          a."visibility",
          (ae.data -> 'attachment' ->> 'storagePath') AS storage_path,
          u.email AS actor_email
   FROM "AuditEvent" ae
   JOIN "User" u ON ae."actorId" = u.id
   JOIN "Ticket" t ON ae."ticketId" = t.id
   LEFT JOIN "Attachment" a ON (ae.data -> 'attachment' ->> 'attachmentId') = a.id
   WHERE ae."ticketId" = :'ticket_id'
     AND t."organizationId" = :'org_id'
     AND ae.action IN ('ATTACHMENT_UPLOADED', 'ATTACHMENT_DELETED')
   ORDER BY ae."createdAt" DESC;
   ```
3) Count uploads/deletes per actor (org-scoped):
   ```sql
   SELECT u.email,
          ae.action,
          COUNT(*) AS events
   FROM "AuditEvent" ae
   JOIN "User" u ON ae."actorId" = u.id
   JOIN "Ticket" t ON ae."ticketId" = t.id
   WHERE t."organizationId" = :'org_id'
     AND ae.action IN ('ATTACHMENT_UPLOADED', 'ATTACHMENT_DELETED')
   GROUP BY u.email, ae.action
   ORDER BY events DESC;
   ```
4) Export for forensics (redacted filename):
   ```sql
   SELECT ae."createdAt",
          ae.action,
          digest(ae.data -> 'attachment' ->> 'fileName', 'sha256') AS file_hash,
          ae.data -> 'attachment' ->> 'storagePath' AS storage_path,
          ae.data -> 'attachment' ->> 'mimeType' AS mime_type,
          ae.data -> 'attachment' ->> 'visibility' AS visibility,
          u.email AS actor_email
   FROM "AuditEvent" ae
   JOIN "Ticket" t ON ae."ticketId" = t.id
   JOIN "User" u ON ae."actorId" = u.id
   WHERE t."organizationId" = :'org_id'
     AND ae.action IN ('ATTACHMENT_UPLOADED', 'ATTACHMENT_DELETED');
   ```

## Operational notes
- Deletion currently removes the DB record; storage cleanup is out-of-scope and should be handled by a separate job before enabling hard deletes.
- Ensure rate limiting middleware remains enabled on attachment routes to cap audit noise.
- If audit insertion fails, treat the request as failed; rerun after fixing the database or schema drift.
