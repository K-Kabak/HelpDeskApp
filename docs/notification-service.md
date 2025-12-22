# Notification service interface (skeleton)

## Status
- Provider-agnostic stub with in-memory idempotency cache.
- Extendable to email/in-app providers without breaking callers.

## API surface
- `NotificationRequest`: `channel` (`email`|`inapp`), `to`, optional `subject/body/templateId/data`, optional `idempotencyKey`, `metadata`.
- `NotificationResult`: `{ id, status: "queued" | "sent", deduped }`.
- `NotificationService.send(request)`: validates payload, returns result; idempotent when `idempotencyKey` provided.

## Usage
- Import the singleton `notificationService` from `src/lib/notification.ts`.
- For custom providers, wire `createNotificationService` to choose implementation (e.g., SES/SMTP/in-app feed).

## Extension notes
- Add a provider that implements `NotificationService` (e.g., queues email jobs).
- Preserve idempotency by honoring `idempotencyKey` and reusing the same delivery id.
- Map provider responses to `NotificationResult` and avoid leaking PII in logs/metadata.
