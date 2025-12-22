-- CreateTable
CREATE TABLE "CsatRequest" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "ticketId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "CsatRequest_ticketId_key" ON "CsatRequest"("ticketId");

-- AddForeignKey
ALTER TABLE "CsatRequest" ADD CONSTRAINT "CsatRequest_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

