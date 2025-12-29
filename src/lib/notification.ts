import { randomUUID } from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { defaultNotificationPreferences } from "@/lib/notification-preferences";
import { emailAdapter as defaultEmailAdapter, EmailAdapter } from "@/lib/email-adapter";

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
  data: z.record(z.string(), z.unknown()).optional(),
  idempotencyKey: z.string().min(1).optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .and(
      z.object({
        notificationType: z.enum(["ticketUpdate", "commentUpdate"]).optional(),
      })
    )
    .optional(),
});

export type NotificationPayload = z.infer<typeof notificationSchema>;

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

class NotificationServiceImpl implements NotificationService {
  private sentByKey = new Map<string, NotificationResult>();
  private emailAdapter: EmailAdapter;

  constructor(emailAdapter: EmailAdapter) {
    this.emailAdapter = emailAdapter;
  }

  /**
   * Sends a notification via the specified channel (email or in-app).
   * 
   * Handles idempotency, user preference checks, and notification type detection.
   * For in-app notifications, stores notificationType in the data field for filtering.
   * 
   * @param request - Notification request with channel, recipient, content, and metadata
   * @returns Notification result with ID, status, and deduplication flag
   */
  async send(request: NotificationRequest): Promise<NotificationResult> {
    const payload: NotificationPayload = notificationSchema.parse(request);

    // Check idempotency: if we've already sent this notification, return cached result
    if (payload.idempotencyKey) {
      const existing = this.sentByKey.get(payload.idempotencyKey);
      if (existing) {
        return { ...existing, deduped: true };
      }
    }

    // Determine notification type from metadata or default to ticketUpdate
    const notificationType = payload.metadata?.notificationType ?? "ticketUpdate";

    // Resolve user ID from email or user ID string
    const userId = await resolveUserId(payload.to);
    if (userId) {
      // Check user's notification preferences before sending
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

    if (payload.channel === "email") {
      const emailResult = await this.emailAdapter.send({
        to: payload.to,
        subject: payload.subject ?? "",
        body: payload.body,
        templateId: payload.templateId,
        data: payload.data,
      });

      const result: NotificationResult = {
        id: emailResult.id,
        status: emailResult.status,
        deduped: false,
      };

      if (payload.idempotencyKey) {
        this.sentByKey.set(payload.idempotencyKey, result);
      }

      return result;
    } else {
      // in-app channel
      if (!userId) {
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

      // Determine more specific notification type for filtering
      // Store extended type in data field (not limited to NotificationType enum)
      let specificType: string = notificationType;
      if (payload.data) {
        const data = payload.data as Record<string, unknown>;
        // Check for SLA-related fields
        if (data.jobType || payload.subject?.toLowerCase().includes("sla")) {
          specificType = "slaBreach";
        }
        // Check for assignment (would need to be passed in metadata or inferred)
        // For now, we'll infer from subject in the API endpoint
      }

      // Store notificationType in data field for filtering
      const notificationData: Prisma.JsonObject = {
        ...((payload.data ?? {}) as Prisma.JsonObject),
        notificationType: specificType,
      };

      const notification = await prisma.inAppNotification.create({
        data: {
          userId,
          subject: payload.subject ?? undefined,
          body: payload.body ?? undefined,
          data: notificationData,
        },
      });

      const result: NotificationResult = {
        id: notification.id,
        status: "sent",
        deduped: false,
      };

      if (payload.idempotencyKey) {
        this.sentByKey.set(payload.idempotencyKey, result);
      }

      return result;
    }
  }
}

export function createNotificationService(
  emailAdapter?: EmailAdapter
): NotificationService {
  return new NotificationServiceImpl(emailAdapter ?? defaultEmailAdapter);
}

export const notificationService = createNotificationService();
