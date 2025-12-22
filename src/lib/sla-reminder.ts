import { notificationService, NotificationService } from "@/lib/notification";
import type { SlaJobPayload } from "@/lib/sla-jobs";

export type SlaReminderResult = {
  skipped: boolean;
  reason?: string;
  notificationId?: string;
};

export async function handleSlaReminder(
  payload: SlaJobPayload,
  options: { notifier?: NotificationService } = {},
): Promise<SlaReminderResult> {
  if (payload.jobType !== "reminder") {
    return { skipped: true, reason: "not a reminder job" };
  }

  const notifier = options.notifier ?? notificationService;
  const metadata = payload.metadata ?? {};
  const recipient = typeof metadata.requesterId === "string" ? metadata.requesterId : null;
  if (!recipient) {
    return { skipped: true, reason: "no recipient" };
  }

  const reminderFor = typeof metadata.reminderFor === "string" ? metadata.reminderFor : "SLA";
  const notification = await notifier.send({
    channel: "inapp",
    to: recipient,
    subject: `SLA reminder (${reminderFor})`,
    body: `Ticket ${payload.ticketId} is approaching its ${reminderFor} due at ${payload.dueAt}.`,
    data: {
      ticketId: payload.ticketId,
      jobType: reminderFor,
      priority: payload.priority,
    },
    idempotencyKey: `sla-reminder-notif:${payload.ticketId}:${reminderFor}`,
    metadata: {
      notificationType: "ticketUpdate",
    },
  });

  return { skipped: false, notificationId: notification.id };
}
