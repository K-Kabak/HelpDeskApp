import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { defaultNotificationPreferences } from "@/lib/notification-preferences";
import { emailAdapter, EmailAdapter } from "@/lib/email-adapter";

export type NotificationChannel = "email" | "inapp";
export type NotificationType = "ticketUpdate" | "commentUpdate";

export type NotificationRequest = {
  channel: NotificationChannel;
  to: string;
  subject?: string;
  body?: string;
  templateId?: string;
  data?: Record<string, unknown>;
  idempotencyKey?: string;
  metadata?: Record<string, unknown> & {
    notificationType?: NotificationType;
  };
};

export type NotificationResult = {
  id: string;
  status: "queued" | "sent";
  deduped: boolean;
};

export interface NotificationService {
  /**
   * Sends or queues a notification. Implementations must be idempotent when an idempotencyKey is provided.
   */
  send(request: NotificationRequest): Promise<NotificationResult>;
}

const notificationSchema = z.object({
  channel: z.enum(["email", "inapp"]),
  to: z.string().min(1),
  subject: z.string().optional(),
  body: z.string().optional(),
  templateId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  idempotencyKey: z.string().min(1).optional(),
  metadata: z
    .record(z.unknown())
    .and(
      z.object({
        notificationType: z.enum(["ticketUpdate", "commentUpdate"]).optional(),
      })
    )
    .optional(),
});

async function resolveUserId(to: string): Promise<string | null> {
  if (to.includes("@")) {
    const user = await prisma.user.findUnique({
      where: { email: to },
      select: { id: true },
    });
    return user?.id ?? null;
  }
  const user = await prisma.user.findUnique({
    where: { id: to },
    select: { id: true },
  });
  return user?.id ?? null;
}

async function shouldSendNotification(
  userId: string,
  channel: NotificationChannel,
  notificationType: NotificationType
): Promise<boolean> {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  const settings = prefs
    ? {
        emailTicketUpdates: prefs.emailTicketUpdates,
        emailCommentUpdates: prefs.emailCommentUpdates,
        inAppTicketUpdates: prefs.inAppTicketUpdates,
        inAppCommentUpdates: prefs.inAppCommentUpdates,
      }
    : defaultNotificationPreferences();

  if (channel === "email") {
    return notificationType === "ticketUpdate"
      ? settings.emailTicketUpdates
      : settings.emailCommentUpdates;
  } else {
    return notificationType === "ticketUpdate"
      ? settings.inAppTicketUpdates
      : settings.inAppCommentUpdates;
  }
}

class InMemoryNotificationService implements NotificationService {
  private sentByKey = new Map<string, NotificationResult>();

  async send(request: NotificationRequest): Promise<NotificationResult> {
    const payload = notificationSchema.parse(request);

    if (payload.idempotencyKey) {
      const existing = this.sentByKey.get(payload.idempotencyKey);
      if (existing) {
        return { ...existing, deduped: true };
      }
    }

    const notificationType =
      (payload.metadata?.notificationType as NotificationType) ?? "ticketUpdate";

    const userId = await resolveUserId(payload.to);
    if (userId) {
      const allowed = await shouldSendNotification(
        userId,
        payload.channel,
        notificationType
      );
      if (!allowed) {
        const blockedResult: NotificationResult = {
          id: randomUUID(),
          status: "queued",
          deduped: false,
        };
        if (payload.idempotencyKey) {
          this.sentByKey.set(payload.idempotencyKey, blockedResult);
        }
        return blockedResult;
      }
    } else {
      const defaults = defaultNotificationPreferences();
      const allowed =
        payload.channel === "email"
          ? notificationType === "ticketUpdate"
            ? defaults.emailTicketUpdates
            : defaults.emailCommentUpdates
          : notificationType === "ticketUpdate"
            ? defaults.inAppTicketUpdates
            : defaults.inAppCommentUpdates;
      if (!allowed) {
        const blockedResult: NotificationResult = {
          id: randomUUID(),
          status: "queued",
          deduped: false,
        };
        if (payload.idempotencyKey) {
          this.sentByKey.set(payload.idempotencyKey, blockedResult);
        }
        return blockedResult;
      }
    }

    const result: NotificationResult = {
      id: randomUUID(),
      status: "queued",
      deduped: false,
    };

    if (payload.idempotencyKey) {
      this.sentByKey.set(payload.idempotencyKey, result);
    }

    return result;
  }
}

export function createNotificationService(
  emailAdapter?: EmailAdapter
): NotificationService {
  return new NotificationServiceImpl(emailAdapter ?? defaultEmailAdapter);
}

export const notificationService = createNotificationService();
