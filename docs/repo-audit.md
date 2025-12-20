# Repo Audit (2025-12-20)

## Conflict marker sweep
- `git grep -n "[<=>]\{7\}" -- .` -> no matches.

## Master artifact presence
- Present under `docs/`: `current-state.md`, `blueprint-master.md`, `execution-plan-master.md`, `github-backlog.md`, `openapi.yaml`, `openapi-validation.md`, `repo-audit.md`. Missing: none detected.

## Contradictions / duplications (evidence-backed)
- `docs/blueprint-master.md:5`, `docs/blueprint-master.md:12`, and `docs/blueprint-master.md:13` claim the comments API/endpoint is missing, but `POST /api/tickets/{id}/comments` exists and is the live path (see `src/app/api/tickets/[id]/comments/route.ts:12`). Risk register repeats the "missing comments API" claim (`docs/blueprint-master.md:149`), conflicting with the implemented handler and OpenAPI's documented `Create comment` operation (`docs/openapi.yaml:554`).
- `docs/execution-plan-master.md:137` duplicates the Definitions of Done summary already restated at `docs/execution-plan-master.md:139`, creating conflicting single-source ownership for milestones.
- `docs/github-backlog.md:6` and `docs/github-backlog.md:8` restate milestone checkpoint targets already spelled out in `docs/execution-plan-master.md:137` and `docs/execution-plan-master.md:139`, so milestone updates must currently be applied in two places.

## Next 10 actions
1. Update `docs/blueprint-master.md` to reflect the existing comments API and remove "missing endpoint" wording.
2. Revise blueprint risk R1 to the actual gap (comment org-scope enforcement) and align linked tasks.
3. Note in blueprint/API section that `POST /api/tickets/{id}/comments` exists while listing/edit flows remain future work.
4. Deduplicate `docs/execution-plan-master.md` by deleting the extra Definitions of Done block at line 137.
5. Normalize checkpoint ranges in `docs/github-backlog.md` (e.g., "checkpoints 1-2") and reference the execution plan as the single milestone source.
6. Add a backlog/plan task to enforce organization checks on the comments handler to close the gap called out in `openapi-validation.md`.
7. Decide whether `GET /api/tickets/{id}` stays in OpenAPI as a target or is deferred; update spec/backlog accordingly.
8. Cross-link `docs/current-state.md` to `docs/openapi-validation.md` so evidence of idempotency/org-scope gaps stays discoverable.
9. Document in backlog that execution plan is canonical to avoid double maintenance of milestones/tasks.
10. Keep running the conflict-marker sweep locally and via CI guardrail before merges.

## Unknowns / verification steps
- Source of truth for milestone summaries (execution plan vs backlog) is unclear; choose owner and remove duplication.
- Whether comment listing/editing is in scope near-term; confirm with product/plan owners and update OpenAPI/backlog.
- Confirm if optimistic locking/idempotency headers in OpenAPI remain target requirements; align contract-conventions and handlers accordingly.
- Verify attachment schema fields (`status`, `url`) vs Prisma model before extending spec; refresh `openapi-validation.md` after the decision.
