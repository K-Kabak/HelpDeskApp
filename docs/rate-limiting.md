# Rate Limiting (skeleton)

## Status
- In-memory middleware guard, disabled by default.
- Runs for `/app/*` routes via `middleware.ts`; no external store required.

## Configuration (env)
- `RATE_LIMIT_ENABLED` (default: `false`) — toggle on/off.
- `RATE_LIMIT_MAX_REQUESTS` (default: `100`) — requests per window.
- `RATE_LIMIT_WINDOW_MS` (default: `60000`) — window duration in ms.
- `RATE_LIMIT_DISABLED_ROUTES` (default: empty) — comma-separated route ids to bypass (uses `"app"` for `/app/*`).

## Behavior / headers
- When enabled, excess requests return `429` with `Retry-After`, `X-RateLimit-Remaining: 0`, and `X-RateLimit-Reset` (epoch ms).
- Successful requests are unaffected; current implementation keeps counters in-memory (non-distributed).

## Where to change
- Middleware entry: `middleware.ts` (calls `checkRateLimit(req, "app")`).
- Guard logic: `src/lib/rate-limit.ts` (adjust defaults or identifiers as needed).
