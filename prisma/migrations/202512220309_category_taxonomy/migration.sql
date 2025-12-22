-- Ensure UUID generation is available without external extensions being pre-installed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Category taxonomy table for ticket classification
CREATE TABLE "Category" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE "Category"
  ADD CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Category_organizationId_name_key" ON "Category"("organizationId", "name");

CREATE OR REPLACE FUNCTION set_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER category_set_updated_at
BEFORE UPDATE ON "Category"
FOR EACH ROW
EXECUTE PROCEDURE set_category_updated_at();
