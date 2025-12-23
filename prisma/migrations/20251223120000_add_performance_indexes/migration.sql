-- Fix SlaEscalationLevel priority type to match enum
ALTER TABLE "SlaEscalationLevel" ALTER COLUMN "priority" TYPE "TicketPriority" USING "priority"::"TicketPriority";

-- Create indexes for performance
CREATE INDEX "Attachment_ticketId_idx" ON "Attachment"("ticketId");
CREATE INDEX "Attachment_uploaderId_idx" ON "Attachment"("uploaderId");
CREATE INDEX "AuditEvent_ticketId_createdAt_idx" ON "AuditEvent"("ticketId", "createdAt");
CREATE INDEX "Comment_ticketId_createdAt_idx" ON "Comment"("ticketId", "createdAt");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "Ticket_organizationId_createdAt_idx" ON "Ticket"("organizationId", "createdAt" DESC);
CREATE INDEX "Ticket_requesterId_createdAt_idx" ON "Ticket"("requesterId", "createdAt" DESC);
CREATE INDEX "Ticket_status_createdAt_idx" ON "Ticket"("status", "createdAt" DESC);
CREATE INDEX "Ticket_priority_createdAt_idx" ON "Ticket"("priority", "createdAt" DESC);
CREATE INDEX "Ticket_assigneeUserId_status_idx" ON "Ticket"("assigneeUserId", "status");
CREATE INDEX "Ticket_assigneeTeamId_status_idx" ON "Ticket"("assigneeTeamId", "status");

-- Fix missing Team unique index if not present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Team_organizationId_name_key') THEN
        CREATE UNIQUE INDEX "Team_organizationId_name_key" ON "Team"("organizationId", "name");
    END IF;
END $$;

