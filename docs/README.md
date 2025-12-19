# Documentation Index

## Owned deliverables (UI/UX Spec - Agent 2)
- `docs/screen-map.md`: Persona-based route map with purpose, entry, required data, and primary actions.
- `docs/ui-ux-spec.md`: End-to-end journeys, list/detail behaviors, admin/reporting proposals, state handling, and UX risks.
- `docs/ux-acceptance.md`: Role-based acceptance criteria covering current and proposed flows.

## Owned deliverables (Security/Ops/QA - Agent 3)
- `docs/threat-model.md`: Trust boundaries, assets, and the top production risks with mitigations and verification steps.
- `docs/security-ops.md`: Security baseline checklist, upload policy, rate limiting, and logging/audit integrity guidance.
- `docs/testing-ci.md`: Unit/integration/e2e strategy aligned to repo tooling with CI gate expectations.
- `docs/runbooks.md`: Environment/secrets, migrations and rollback, background jobs, observability, release, and incident runbooks.

## Owned deliverables (Orchestrator / Editor-in-Chief)
- `docs/blueprint-master.md`: Consolidated blueprint with current-state evidence, target spec, architecture, risks, and testing strategy.
- `docs/execution-plan-master.md`: Dependency-ordered plan (120+ tasks) across phases with acceptance/test/rollback notes.
- `docs/decision-log.md`: Recorded decisions, assumptions, and checkpoint rationale.
- `docs/glossary.md`: Shared terminology for roles, workflows, and platform concepts.
# Documentation Index (Repo Truth)

This repository contains evidence-backed documentation owned by Agent 1 (Repo Truth + Core Backend specialist). Each file summarizes current state findings without forward-looking design.

## Files
- `docs/current-state.md` – Stack overview, repository map, auth/scoping, capabilities, and quality-gated claims.
- `docs/api-as-is.md` – Inventory of live API routes, methods, auth/authZ, validation, side effects, and failure modes.
- `docs/data-as-is.md` – Prisma data model enums, relations, constraints, and seed highlights.
- `docs/gaps-core.md` – Prioritized gaps from current implementation to a solid helpdesk baseline.
- `docs/known-issues.md` – Concrete bugs and risky patterns with evidence and minimal fix notes.
- `docs/search-log.md` – Trace of search keywords and inspected paths/commands during analysis.
- `docs/current-state-delta.md` – Delta notes since last scan, highlighting what changed (or remained absent) with evidence.
- `docs/contradictions.md` – Contradictions between documentation and repository truth with pointers to fixes.
- `docs/unknowns-to-verify.md` – Open unknowns plus step-by-step verification guidance.

Last updated: 2025-12-19
