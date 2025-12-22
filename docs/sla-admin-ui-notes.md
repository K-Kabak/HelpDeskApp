# SLA admin UI (Issue #63)

## Manual checklist
- Sign in as admin; open `/app/admin/sla-policies`.
- Ensure list renders existing policies (from seed) with priority, category (or "Wszystkie kategorie"), and hour values.
- Create policy with valid data and optional category; see success toast and list update.
- Attempt invalid input (empty priority or 0 hours) and see validation error (inline/toast).
- Edit an existing policy: change hours, save, see row update.
- Delete a policy and confirm it disappears from the list.
- Confirm non-admin user is redirected away from the page.

## Test notes
- Client validation mirrored with `slaPolicySchema`; unit test `tests/sla-admin-validation.test.ts` covers happy + invalid numeric path.
- API wiring uses `/api/admin/sla-policies` and `/api/admin/sla-policies/{id}` (must be available from #62).
