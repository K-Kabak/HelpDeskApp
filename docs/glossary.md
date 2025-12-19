# Glossary (HelpDeskApp)

- **Requester** — End user who opens tickets; can view/close/reopen own tickets and add public comments.
- **Agent** — Support staff who works tickets; can update status/priority, assign, add public/internal comments.
- **Admin** — Org-level owner; manages users/teams/SLA/tags, runs reports, can act as agent with full scope.
- **Organization** — Tenant boundary; all tickets, users, teams, attachments, audits are scoped to an org.
- **Team** — Group of agents; tickets can be assigned to a team and/or individual agent.
- **Ticket** — Primary record for an issue; holds title, Markdown description, status, priority, assignees, tags, SLA timestamps.
- **Comment** — Markdown note on a ticket; may be public (visible to requester) or internal (agent/admin only).
- **Attachment** — File uploaded to a ticket; stored via object storage with signed URLs and size/mime validation.
- **SLA (Service Level Agreement)** — Policy defining response/resolution time targets per priority; tracked via firstResponseAt/resolveDue/breach flags.
- **Queue** — Filtered view of tickets (e.g., My Tickets, Unassigned, SLA Risk) with pagination and sorting.
- **Audit Event** — Immutable record of actions (create/update/comment/attachment/admin) storing actor, action, payload, timestamp.
- **Breach** — Condition where SLA due time is exceeded; triggers notifications/escalations.
- **Checkpoint (Stop/Go)** — Planned review gate to decide release progression based on metrics/tests.
- **Retention Policy** — Rules for how long comments/attachments/audits persist before purge/archive.
