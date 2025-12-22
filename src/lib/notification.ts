import { randomUUID } from "crypto";
import { z } from "zod";

export type NotificationChannel = "email" | "inapp";

export type NotificationRequest = {
  channel: NotificationChannel;
  to: string;
  subject?: string;
  body?: string;
  templateId?: string;
  data?: Record<string, unknown>;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
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
  metadata: z.record(z.unknown()).optional(),
});

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

export function createNotificationService(): NotificationService {
  // Provider selection can be extended here (e.g., SES, SMTP, in-app).
  return new InMemoryNotificationService();
}

export const notificationService = createNotificationService();
