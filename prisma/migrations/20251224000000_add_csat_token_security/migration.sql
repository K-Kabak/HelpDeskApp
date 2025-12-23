-- AlterTable
ALTER TABLE "CsatRequest" ADD COLUMN "token" TEXT;
ALTER TABLE "CsatRequest" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "CsatRequest_token_key" ON "CsatRequest"("token");
CREATE INDEX "CsatRequest_expiresAt_idx" ON "CsatRequest"("expiresAt");

-- Note: Existing CSAT requests will have NULL tokens.
-- These will need to be regenerated when tickets are resolved/closed again.
-- The application code handles NULL tokens gracefully (session-based fallback).

