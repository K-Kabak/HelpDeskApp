import { enqueueSlaJob, createSlaJobPayload, SlaJobResult } from "@/lib/sla-jobs";

type DueField = {
  jobType: "first-response" | "resolve";
  dueAt: string | Date | null | undefined;
};

const getReminderLeadMs = () =>
  Math.max(0, Number(process.env.SLA_REMINDER_LEAD_MINUTES ?? 30)) * 60_000;

export type TicketSlaSchedule = {
  id: string;
  organizationId: string;
  priority: string;
  categoryId?: string | null;
  requesterId: string;
  firstResponseDue?: string | Date | null;
  resolveDue?: string | Date | null;
};

function toIso(value: string | Date | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.toISOString();
}

/**
 * Schedules SLA breach detection jobs for a ticket.
 * 
 * Creates background jobs to check for SLA breaches at the ticket's due dates.
 * Schedules jobs for both first response and resolution deadlines.
 * Also schedules reminder jobs if configured.
 * 
 * Only schedules jobs for future due dates (skips past dates).
 * 
 * @param ticket - Ticket with SLA due dates and metadata
 * @returns Array of job scheduling results (one per due date)
 */
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

  await scheduleSlaReminderForTicket(ticket);
  return results;
}

/**
 * Schedules SLA reminder jobs for a ticket.
 * 
 * Creates reminder notifications before SLA deadlines to alert agents.
 * Reminder timing is controlled by SLA_REMINDER_LEAD_MINUTES env var (default: 30 minutes).
 * 
 * Schedules reminders for both first response and resolution deadlines.
 * Only schedules if reminder time is in the future.
 * 
 * @param ticket - Ticket with SLA due dates and metadata
 * @returns Array of reminder job scheduling results (one per due date)
 */
export async function scheduleSlaReminderForTicket(ticket: TicketSlaSchedule): Promise<SlaJobResult[]> {
  const reminderLeadMs = getReminderLeadMs();
  if (reminderLeadMs <= 0) {
    return [];
  }

  const dueFields: DueField[] = [
    { jobType: "first-response", dueAt: ticket.firstResponseDue },
    { jobType: "resolve", dueAt: ticket.resolveDue },
  ];

  const now = Date.now();
  const reminderResults: SlaJobResult[] = [];

  for (const field of dueFields) {
    const dueIso = toIso(field.dueAt);
    if (!dueIso) continue;
    const dueMs = Date.parse(dueIso);
    if (Number.isNaN(dueMs)) continue;

    const reminderTime = dueMs - reminderLeadMs;
    if (reminderTime <= now) continue;

    const payload = createSlaJobPayload({
      jobType: "reminder",
      ticketId: ticket.id,
      organizationId: ticket.organizationId,
      dueAt: new Date(reminderTime).toISOString(),
      priority: ticket.priority,
      categoryId: ticket.categoryId ?? null,
      metadata: { reminderFor: field.jobType, requesterId: ticket.requesterId },
      idempotencyKey: `sla-reminder:${ticket.id}:${field.jobType}`,
    });

    reminderResults.push(await enqueueSlaJob(payload));
  }

  return reminderResults;
}
