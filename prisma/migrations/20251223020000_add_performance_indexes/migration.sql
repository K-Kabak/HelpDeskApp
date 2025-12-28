-- Add performance indexes for better query performance
-- Ticket table indexes
CREATE INDEX IF NOT EXISTS "Ticket_organizationId_idx" ON "Ticket"("organizationId");
CREATE INDEX IF NOT EXISTS "Ticket_status_idx" ON "Ticket"("status");
CREATE INDEX IF NOT EXISTS "Ticket_priority_idx" ON "Ticket"("priority");
CREATE INDEX IF NOT EXISTS "Ticket_assigneeUserId_idx" ON "Ticket"("assigneeUserId");
CREATE INDEX IF NOT EXISTS "Ticket_assigneeTeamId_idx" ON "Ticket"("assigneeTeamId");
CREATE INDEX IF NOT EXISTS "Ticket_createdAt_idx" ON "Ticket"("createdAt");
CREATE INDEX IF NOT EXISTS "Ticket_updatedAt_idx" ON "Ticket"("updatedAt");

-- Comment table indexes
CREATE INDEX IF NOT EXISTS "Comment_ticketId_idx" ON "Comment"("ticketId");
CREATE INDEX IF NOT EXISTS "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt");

-- Attachment table indexes
CREATE INDEX IF NOT EXISTS "Attachment_ticketId_idx" ON "Attachment"("ticketId");
CREATE INDEX IF NOT EXISTS "Attachment_uploaderId_idx" ON "Attachment"("uploaderId");

-- AuditEvent table indexes
CREATE INDEX IF NOT EXISTS "AuditEvent_ticketId_idx" ON "AuditEvent"("ticketId");
CREATE INDEX IF NOT EXISTS "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");
CREATE INDEX IF NOT EXISTS "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- User table indexes
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");

-- Team table indexes
CREATE INDEX IF NOT EXISTS "Team_organizationId_idx" ON "Team"("organizationId");

-- Tag table indexes
CREATE INDEX IF NOT EXISTS "Tag_organizationId_idx" ON "Tag"("organizationId");

-- Category table indexes
CREATE INDEX IF NOT EXISTS "Category_organizationId_idx" ON "Category"("organizationId");
