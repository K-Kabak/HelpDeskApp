-- CreateIndex
CREATE INDEX "Ticket_search_idx" ON "Ticket"("organizationId","title","descriptionMd","category");
