-- Add SLA escalation path levels for priority/category/team ordering.
CREATE TABLE "SlaEscalationLevel" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "priority" TEXT NOT NULL,
  "categoryId" UUID REFERENCES "Category"("id") ON DELETE SET NULL,
  "level" INTEGER NOT NULL,
  "teamId" UUID NOT NULL REFERENCES "Team"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "SlaEscalationLevel_org_priority_category_level_idx"
  ON "SlaEscalationLevel"("organizationId", "priority", "categoryId", "level");

CREATE UNIQUE INDEX "SlaEscalationLevel_org_priority_category_level_key"
  ON "SlaEscalationLevel"("organizationId", "priority", "categoryId", "level");
