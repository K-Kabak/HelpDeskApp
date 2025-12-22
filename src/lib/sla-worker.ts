import { TicketStatus } from "@prisma/client";

import { notificationService, NotificationService } from "@/lib/notification";
import { prisma } from "@/lib/prisma";
import { slaJobPayloadSchema, type SlaJobPayload } from "@/lib/sla-jobs";

type SlaClient = Pick<typeof prisma, "ticket" | "auditEvent">;

type WorkerOptions = {
  client?: SlaClient;
  notifier?: NotificationService;
  now?: Date;
};

export type SlaWorkerResult = {
  skipped: boolean;
  reason?: string;
  notificationId?: string;
  auditId?: string;
};

const closedStatuses: TicketStatus[] = [TicketStatus.ZAMKNIETE, TicketStatus.ROZWIAZANE];

export async function handleSlaJob(payload: SlaJobPayload, options: WorkerOptions = {}): Promise<SlaWorkerResult> {
  const parsed = slaJobPayloadSchema.parse(payload);
  const client = options.client ?? prisma;
  const notifier = options.notifier ?? notificationService;
  const now = options.now?.getTime() ?? Date.now();

  const ticket = await client.ticket.findUnique({
    where: { id: parsed.ticketId },
    select: {
      id: true,
      number: true,
      requesterId: true,
      assigneeUserId: true,
      status: true,
      firstResponseAt: true,
      firstResponseDue: true,
      resolveDue: true,
      resolvedAt: true,
      closedAt: true,
      organizationId: true,
    },
  });

  if (!ticket) {
    return { skipped: true, reason: "ticket not found" };
  }

  const dueMs = Date.parse(parsed.dueAt);
  if (Number.isNaN(dueMs)) {
    return { skipped: true, reason: "invalid due date" };
  }

  if (closedStatuses.includes(ticket.status) || ticket.closedAt || ticket.resolvedAt) {
    return { skipped: true, reason: "ticket closed/resolved" };
  }

  if (ticket.status === TicketStatus.OCZEKUJE_NA_UZYTKOWNIKA) {
    return { skipped: true, reason: "waiting on requester" };
  }

  const targetDueDate =
    parsed.jobType === "first-response" ? ticket.firstResponseDue : ticket.resolveDue;
  const targetDueMs = targetDueDate ? targetDueDate.getTime() : null;
  if (!targetDueMs) {
    return { skipped: true, reason: "no active due date" };
  }

  if (targetDueMs !== dueMs) {
    return { skipped: true, reason: "due rescheduled" };
  }

  if (dueMs > now) {
    return { skipped: true, reason: "due date not reached" };
  }

  if (parsed.jobType === "first-response" && ticket.firstResponseAt) {
    return { skipped: true, reason: "first response already recorded" };
  }

  if (parsed.jobType === "resolve" && ticket.resolvedAt) {
    return { skipped: true, reason: "already resolved" };
  }

  const actorId = ticket.assigneeUserId ?? ticket.requesterId;
  const audit = await client.auditEvent.create({
    data: {
      ticketId: ticket.id,
      actorId,
      action: "SLA_BREACHED",
      data: {
        jobType: parsed.jobType,
        dueAt: parsed.dueAt,
        priority: parsed.priority,
      },
    },
  });

  const notification = await notifier.send({
    channel: "inapp",
    to: ticket.requesterId,
    subject: `SLA ${parsed.jobType === "first-response" ? "response" : "resolution"} breached`,
    body: `Ticket #${ticket.number} missed its ${parsed.jobType} target scheduled for ${parsed.dueAt}.`,
    data: {
      ticketId: ticket.id,
      jobType: parsed.jobType,
      dueAt: parsed.dueAt,
    },
    idempotencyKey: `sla-breach:${ticket.id}:${parsed.jobType}`,
  });

  return {
    skipped: false,
    auditId: audit.id,
    notificationId: notification.id,
  };
}
