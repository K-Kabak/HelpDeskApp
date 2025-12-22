import { enqueueSlaJob, createSlaJobPayload, SlaJobResult } from "@/lib/sla-jobs";

type DueField = {
  jobType: "first-response" | "resolve";
  dueAt: string | Date | null | undefined;
};

export type TicketSlaSchedule = {
  id: string;
  organizationId: string;
  priority: string;
  categoryId?: string | null;
  firstResponseDue?: string | Date | null;
  resolveDue?: string | Date | null;
};

function toIso(value: string | Date | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.toISOString();
}

export async function scheduleSlaJobsForTicket(ticket: TicketSlaSchedule): Promise<SlaJobResult[]> {
  const dueFields: DueField[] = [
    { jobType: "first-response", dueAt: ticket.firstResponseDue },
    { jobType: "resolve", dueAt: ticket.resolveDue },
  ];

  const now = Date.now();
  const results: SlaJobResult[] = [];

  for (const field of dueFields) {
    const dueIso = toIso(field.dueAt);
    if (!dueIso) continue;
    if (Date.parse(dueIso) <= now) continue;

    const idempotencyKey = `sla:${ticket.id}:${field.jobType}:${dueIso}`;
    const payload = createSlaJobPayload({
      jobType: field.jobType,
      ticketId: ticket.id,
      organizationId: ticket.organizationId,
      dueAt: dueIso,
      priority: ticket.priority,
      categoryId: ticket.categoryId ?? null,
      metadata: { ticketId: ticket.id, jobType: field.jobType },
      idempotencyKey,
    });

    const result = await enqueueSlaJob(payload);
    results.push(result);
  }

  return results;
}
