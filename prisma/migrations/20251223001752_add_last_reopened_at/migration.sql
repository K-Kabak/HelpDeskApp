-- Add lastReopenedAt field to track reopen cooldown
ALTER TABLE "Ticket"
  ADD COLUMN "lastReopenedAt" TIMESTAMP(3);

