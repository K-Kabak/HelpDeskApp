# Worker Deployment Runbook (BullMQ)

This runbook covers restarting, draining, and rolling back the BullMQ queue worker tied to SLA and notification jobs. Commands assume PowerShell or Git Bash.

## Required Environment
- `DATABASE_URL` – Postgres target for job payloads (set in CI/CD secret store or deployment manifest).
- `REDIS_URL` – Redis connection string used by BullMQ (secret in infra helm/chart or GitHub Secrets).
- `BULLMQ_PREFIX` (optional) – Namespace for separation; default `bullmq`.
- `NOTIFICATION_DSN` / `EMAIL_API_KEY` – Worker uses mail/notification adapters; rotate via secret manager before restart if rotated.
- `NODE_ENV=production`, `WORKER_ROLE=notification` – ensures worker connects to correct queues.

Secrets live in the deployment pipeline (GitHub Actions or Kubernetes secrets). Confirm secrets match `staging`/`prod` environments before touching workers.

## Restart Procedure
1. Notify monitoring/ops (Slack channel) about planned restart window and expected downtime routing.
2. On the worker host or container orchestrator:
   ```powershell
   git pull origin main
   pnpm install --frozen-lockfile
   pnpm build
   pm2 reload worker --update-env
   ```
   Replace `pm2` with your process manager (systemd unit or container restart). Ensure `pm2` uses the same env vars listed above.
3. Validate connectivity by tailing logs:
   ```bash
   pm2 logs worker --lines 50
   ```
   Look for `worker:ready` or `BullMQ queue ready` messages in `src/lib/worker.ts` (or equivalent).
4. Confirm queue heartbeats (if metrics exported) and that no new errors appear in log stream before closing the window.

## Draining Queues
1. Pause incoming producers by toggling the `WORKER_ACCEPT_JOBS` feature flag (env or toggle in config service). If unavailable, scale down API deployments to zero briefly.
2. Execute drain logic:
   ```bash
   node scripts/drain-queues.mjs --queues sla --timeout 300
   ```
   (If script missing, use BullMQ `Queue#pause` + `Queue#getJobs` to manually move jobs to `waiting` and process until `active` empty.)
3. Monitor jobs:
   ```bash
   redis-cli -u "$env:REDIS_URL" LLEN bullmq:default:waiting
   ```
   Wait until `waiting`/`active` counts drop to zero before re-enabling producers.
4. Resume producers by resetting feature flag or scaling API back up.

## Rollback Strategy
1. If restart introduces failures, roll back by switching to the previously known-good release/tag:
   ```bash
   git checkout HEAD~1
   pnpm install
   pnpm build
   pm2 restart worker --env production
   ```
2. Check `pm2 status` or `kubectl rollout undo` output to confirm the old artifact is running.
3. If queue backlog cleared incorrectly, requeue in-flight jobs via backup queue table (see `Bullmq` retries) or run manual reprocess script:
   ```bash
   node scripts/reprocess-failed-attachments.js
   ```
4. Document the rollback in the incident tracker and reopen the restart window when the cause is identified.

## Failure Modes & Troubleshooting
- **Redis connection refused**: verify `REDIS_URL`, network ACLs, and Redis auth; restart worker after ensuring ACL.
- **Job handler errors**: inspect logs for stack trace pointing to `src/lib/queue.ts`; rerun failing job via dashboard or script.
- **SLA job stuck in `delayed`**: use `bullmq` CLI to inspect retries and move to `waiting`.
- **Duplicate notifications**: when rollback causes reprocessing, check `src/lib/notification.ts` idempotency tokens; prune duplicates via database `notification_token` table (if present).
- **Env drift**: compare live env (`printenv`) with git-tool `.env.example`; missing seals cause failures.

## Monitoring & Validation
- After restart/drain, confirm `BullMQ` dashboards show zero active jobs and `completed` metrics rising.
- Watch application logs for `worker:processed-sla-job` and ensure the SLA badge counts decrease.
- Validate SLA breach alerts (internal Slack/email) remain suppressed until new jobs processed.
