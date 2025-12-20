# Repo Audit (post master-docs rescue)

## Checklist Results
- Conflict marker sweep: clean; `git grep -n` found no merge delimiters.【ef8bb4†L1-L2】
- Presence check: `docs/blueprint-master.md`, `docs/execution-plan-master.md`, `docs/openapi.yaml`, `docs/api-contracts-target.md`, and `docs/github-backlog.md` are all absent from the `docs/` directory listing.【b20582†L1-L3】
- Existing docs inventory: `docs/README.md`, `current-state.md`, `current-state-delta.md`, `api-as-is.md`, `data-as-is.md`, `gaps-core.md`, `known-issues.md`, `search-log.md`, `contradictions.md`, `unknowns-to-verify.md`, and this `repo-audit.md` are present.【b20582†L1-L3】
- Cross-link validation: because the blueprint/execution-plan/OpenAPI/API-contract/backlog files do not exist, no cross-links to them can be valid; any references would be unsupported until those artifacts are added.

## Contradictions
- Any claim that `docs/blueprint-master.md`, `docs/execution-plan-master.md`, `docs/openapi.yaml`, `docs/api-contracts-target.md`, or `docs/github-backlog.md` exist or are referenced is unsupported because these files are absent from `docs/`.【b20582†L1-L3】

## Present vs Missing
- Present: repo-truth documentation files listed in the inventory above.【b20582†L1-L3】
- Missing: `docs/blueprint-master.md`, `docs/execution-plan-master.md`, `docs/openapi.yaml`, `docs/api-contracts-target.md`, and `docs/github-backlog.md`.【b20582†L1-L3】

## Next 10 Actions
1. Create `docs/blueprint-master.md` and define section anchors for cross-linking.
2. Create `docs/execution-plan-master.md` aligned to the blueprint structure and date-stamped.
3. Draft `docs/openapi.yaml` from the implemented API routes under `src/app/api` and store it in `docs/`.
4. Produce `docs/api-contracts-target.md` that maps intended behaviors to the OpenAPI spec.
5. Add `docs/github-backlog.md` with dated backlog items tied to execution-plan milestones.
6. Update `docs/README.md` to index any newly added master/spec/backlog files.
7. Once the new artifacts exist, add explicit cross-links between blueprint, execution plan, OpenAPI, and API contracts.
8. Re-run the conflict-marker sweep after adding the missing artifacts to ensure the repo stays clean.
9. Re-audit documentation to remove unsupported-claim warnings once the missing files and links are in place.
10. Establish freshness checks (timestamps or commit refs) between blueprint, execution plan, backlog, and API contracts to detect staleness early.
