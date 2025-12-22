-- SLA pause/resume tracking fields with safe defaults
ALTER TABLE "Ticket"
  ADD COLUMN "slaPausedAt" TIMESTAMP(3),
  ADD COLUMN "slaResumedAt" TIMESTAMP(3),
  ADD COLUMN "slaPauseTotalSeconds" INTEGER NOT NULL DEFAULT 0;
