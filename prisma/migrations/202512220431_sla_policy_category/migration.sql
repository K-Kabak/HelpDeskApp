-- Add optional category override on SLA policies
ALTER TABLE "SlaPolicy"
  ADD COLUMN "categoryId" TEXT;

ALTER TABLE "SlaPolicy"
  ADD CONSTRAINT "SlaPolicy_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Replace old uniqueness with org + priority + category (note: nullable category still allows multiple NULLs; enforce via app logic)
DROP INDEX IF EXISTS "SlaPolicy_organizationId_priority_key";
CREATE UNIQUE INDEX "SlaPolicy_organizationId_priority_categoryId_key" ON "SlaPolicy"("organizationId", "priority", "categoryId");
