# Data Model (as implemented)

## Enums
- `Role`: REQUESTER, AGENT, ADMIN.【F:prisma/schema.prisma†L10-L14】
- `TicketStatus`: NOWE, W_TOKU, OCZEKUJE_NA_UZYTKOWNIKA, WSTRZYMANE, ROZWIAZANE, ZAMKNIETE, PONOWNIE_OTWARTE.【F:prisma/schema.prisma†L16-L24】
- `TicketPriority`: NISKI, SREDNI, WYSOKI, KRYTYCZNY.【F:prisma/schema.prisma†L26-L31】

## Core Models & Constraints
- **Organization**: `id` UUID PK; unique `name`; relations to users/teams/tickets/tags/SLA policies.【F:prisma/schema.prisma†L33-L44】
- **User**: UUID PK; unique `email`; required `name`, `passwordHash`, `role`, `organizationId`; relations to tickets (requester/assignee), comments, attachments, audit events, team memberships; NextAuth accounts/sessions.【F:prisma/schema.prisma†L46-L66】
- **Team**: UUID PK; required `name`, `organizationId`; unique composite `(organizationId, name)`; relations to memberships and tickets as assignee team.【F:prisma/schema.prisma†L68-L80】
- **TeamMembership**: composite PK `(userId, teamId)`; `assignedAt` default now; relations to user/team.【F:prisma/schema.prisma†L82-L92】
- **Ticket**: UUID PK with autoincrement `number`; required `title`, `descriptionMd`, `status` default NOWE, `priority` default SREDNI, `requesterId`, `organizationId`; optional `category`, `assigneeUserId`, `assigneeTeamId`, `resolvedAt`, `closedAt`, `firstResponseAt`, SLA due dates. Relations to requester, assignee user/team, organization, tags, comments, attachments, audit events.【F:prisma/schema.prisma†L94-L120】
- **Comment**: UUID PK; required `ticketId`, `authorId`, `bodyMd`; boolean `isInternal` default false; timestamps createdAt default now.【F:prisma/schema.prisma†L123-L132】
- **Attachment**: UUID PK; required `ticketId`, `uploaderId`, file metadata fields; createdAt default now.【F:prisma/schema.prisma†L134-L145】
- **Tag / TicketTag**: Tag UUID PK with unique `(organizationId, name)`; TicketTag composite PK `(ticketId, tagId)` linking tickets to tags.【F:prisma/schema.prisma†L147-L168】
- **AuditEvent**: UUID PK; required `ticketId`, `actorId`, `action`, optional `data` JSON; createdAt default now.【F:prisma/schema.prisma†L170-L179】
- **SlaPolicy**: UUID PK; unique `(organizationId, priority)`; stores first response/resolve hours per priority.【F:prisma/schema.prisma†L181-L192】
- **NextAuth Tables**: Account (unique provider/providerAccountId), Session (unique sessionToken), VerificationToken (unique token and composite identifier+token).【F:prisma/schema.prisma†L194-L230】

## Seed Data Highlights
- Demo organization "Demo" with admin/requester/agent users and hashed passwords; IT Support team with agent membership; tags (VPN, Laptop, Sieć); SLA policies for all priorities; sample ticket with tag and comment; audit event on demo ticket creation.【F:prisma/seed.js†L7-L99】
