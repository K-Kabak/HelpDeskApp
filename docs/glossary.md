<<<<<<< ours
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
=======
# Glossary

- **Requester**: End user creating tickets; can view and act only on own tickets and post public comments.
- **Agent**: Support staff handling tickets within an organization; can post internal/public comments, change status/priority, and manage assignments.
- **Admin**: Organization administrator with agent rights plus management of users, teams, tags, SLA policies, and configurations.
- **Team Lead**: Future role for queue oversight and approvals; subset of admin for specific teams.
- **Ticket**: Work item representing a support request, with status, priority, category, SLA timers, and audit trail.
- **Comment (Public/Internal)**: Discussion entry on a ticket; internal comments are hidden from requesters.
- **Attachment (Public/Internal)**: File linked to a ticket with visibility tied to audience; subject to AV scanning and size/type limits.
- **SLA (Service Level Agreement)**: Time targets for first response and resolution per priority/category; tracked via due timestamps and breach alerts.
- **SLA Pause/Resume**: Mechanism to stop SLA clocks when waiting on requester or during agreed maintenance windows.
- **Queue**: Filtered view of tickets by status/priority/team/assignee; used for triage and load balancing.
- **Automation Rule**: Configurable trigger-action rule (e.g., auto-assign, escalate on breach, send notification).
- **Audit Event**: Immutable record of significant actions (creation, status/priority changes, assignment, admin edits).
- **Kanban View**: Board view showing tickets grouped by status or team for drag-and-drop triage.
- **CSAT**: Customer satisfaction feedback gathered post-resolution or closure.
- **First Response**: Time until first public agent reply on a ticket; captured when public agent comment is posted.
- **Resolve Due / First Response Due**: Target timestamps for SLA compliance; derived from SLA policy at creation and updated on SLA pause/resume.
- **Org Isolation**: Data partitioning by `organizationId`; queries and APIs must scope to the current user’s organization.
- **Presigned URL**: Time-bound URL granting limited access to upload or download attachments from object storage.
- **Background Worker**: Queue-driven process (e.g., BullMQ) handling SLA timers, notifications, and heavy tasks outside request lifecycle.
- **Stop/Go Checkpoint**: Planned review to decide continuation after a task tranche based on quality and risk outcomes.
>>>>>>> theirs
