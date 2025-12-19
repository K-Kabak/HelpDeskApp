# Repo Audit (post-master fix)

## Checklist Results
- Conflict markers: none found via `git grep` sweep.【dccc92†L1-L2】
- Docs duplication: `docs/current-state.md` headings are unique; `docs/blueprint-master.md` and `docs/execution-plan-master.md` are absent (cannot check duplication).【8bf71c†L1-L9】【ac2db6†L1-L2】
- Referenced specs: `openapi.yaml` and `api-contracts-target.md` not present in repo (cannot cross-check API contracts).【6aa3f6†L1-L2】【51c6e6†L1-L2】
- Security/test/runbooks references: no `security-ops*`, `testing-ci*`, or `runbooks*` docs found under `docs/`.【89e87e†L1-L3】

## Contradictions / Unsupported Claims
- Blueprint / execution plan references: Tasks mention `docs/blueprint-master.md` and `docs/execution-plan-master.md`, but these files are missing, so any references to them are unsupported. Proposed fix: add the referenced master documents or remove/retarget references in other docs to existing files.【ac2db6†L1-L2】
- API contract alignment: Without `openapi.yaml` or `api-contracts-target.md`, any claimed contract alignment is unverifiable. Proposed fix: generate or restore these specs, then cross-check against `docs/api-as-is.md` and route handlers.【6aa3f6†L1-L2】【51c6e6†L1-L2】
- Security/runbook linkage: References to security-ops/testing-ci/runbooks cannot be validated because no such docs exist. Proposed fix: create these documents or update dependent docs to remove the references.【89e87e†L1-L3】

## Missing References / Links
- Missing master docs: `docs/blueprint-master.md`, `docs/execution-plan-master.md`.
- Missing API specs: `openapi.yaml`, `api-contracts-target.md`.
- Missing operational guides: security-ops*, testing-ci*, runbooks* under `docs/`.

## Next 10 Actions
1. Restore or author `docs/blueprint-master.md` to match current repository scope and ensure section uniqueness.
2. Restore or author `docs/execution-plan-master.md` aligned with the blueprint and current code.
3. Produce `openapi.yaml` reflecting implemented API routes (`src/app/api/...`) and link it from docs.
4. Create `api-contracts-target.md` summarizing target contracts and map them to the OpenAPI spec for traceability.
5. Add `docs/security-ops.md` covering authn/z posture, secrets handling, and operational safeguards referenced elsewhere.
6. Add `docs/testing-ci.md` describing CI checks, required test suites, and how to run them locally.
7. Add `docs/runbooks.md` for common operational tasks (migration, recovery) and link from other docs.
8. Update existing docs to replace or validate any references to missing files once created.
9. Re-run a conflict marker sweep after adding/restoring files to keep zero conflicts.
10. Re-audit for contradictions after new docs and specs are added, ensuring cross-references are live and evidenced.
