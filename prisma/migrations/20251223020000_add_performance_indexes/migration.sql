-- Add performance indexes for better query performance
-- Ticket table indexes
CREATE INDEX CONCURRENTLY "Ticket_organizationId_idx" ON "Ticket"("organizationId");
CREATE INDEX CONCURRENTLY "Ticket_status_idx" ON "Ticket"("status");
CREATE INDEX CONCURRENTLY "Ticket_priority_idx" ON "Ticket"("priority");
CREATE INDEX CONCURRENTLY "Ticket_assigneeUserId_idx" ON "Ticket"("assigneeUserId");
CREATE INDEX CONCURRENTLY "Ticket_assigneeTeamId_idx" ON "Ticket"("assigneeTeamId");
CREATE INDEX CONCURRENTLY "Ticket_createdAt_idx" ON "Ticket"("createdAt");
CREATE INDEX CONCURRENTLY "Ticket_updatedAt_idx" ON "Ticket"("updatedAt");

-- Comment table indexes
CREATE INDEX CONCURRENTLY "Comment_ticketId_idx" ON "Comment"("ticketId");
CREATE INDEX CONCURRENTLY "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX CONCURRENTLY "Comment_createdAt_idx" ON "Comment"("createdAt");

-- Attachment table indexes
CREATE INDEX CONCURRENTLY "Attachment_ticketId_idx" ON "Attachment"("ticketId");
CREATE INDEX CONCURRENTLY "Attachment_uploaderId_idx" ON "Attachment"("uploaderId");

-- AuditEvent table indexes
CREATE INDEX CONCURRENTLY "AuditEvent_ticketId_idx" ON "AuditEvent"("ticketId");
CREATE INDEX CONCURRENTLY "AuditEvent_actorId_idx" ON "AuditEvent"("actorId");
CREATE INDEX CONCURRENTLY "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- User table indexes
CREATE INDEX CONCURRENTLY "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX CONCURRENTLY "User_role_idx" ON "User"("role");

-- Team table indexes
CREATE INDEX CONCURRENTLY "Team_organizationId_idx" ON "Team"("organizationId");

-- Tag table indexes
CREATE INDEX CONCURRENTLY "Tag_organizationId_idx" ON "Tag"("organizationId");

-- Category table indexes
CREATE INDEX CONCURRENTLY "Category_organizationId_idx" ON "Category"("organizationId");
