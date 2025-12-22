-- Add attachment visibility enum and metadata field with safe defaults
CREATE TYPE "AttachmentVisibility" AS ENUM ('INTERNAL', 'PUBLIC');

ALTER TABLE "Attachment"
  ADD COLUMN "visibility" "AttachmentVisibility" NOT NULL DEFAULT 'INTERNAL',
  ADD COLUMN "metadata" JSONB;
