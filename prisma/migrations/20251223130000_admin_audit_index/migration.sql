-- Add index to AdminAudit for faster list ordering
CREATE INDEX "AdminAudit_organizationId_createdAt_idx" ON "AdminAudit"("organizationId", "createdAt" DESC);

