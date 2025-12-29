import { randomUUID } from "crypto";
import { z } from "zod";
import { Queue } from "bullmq";

export const slaJobTypeSchema = z.enum(["first-response", "resolve", "reminder"]);

export const slaJobPayloadSchema = z.object({
  jobId: z.string().min(1),
  jobType: slaJobTypeSchema,
  ticketId: z.string().min(1),
  organizationId: z.string(),
  dueAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "dueAt must be a valid ISO date string",
  }),
  priority: z.string(),
  categoryId: z.string().min(1).nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  idempotencyKey: z.string().min(1).optional(),
});

export type SlaJobPayload = z.infer<typeof slaJobPayloadSchema>;

export const slaJobResultSchema = z.object({
  jobId: z.string().min(1),
  enqueued: z.boolean(),
  deduped: z.boolean(),
  jobType: slaJobTypeSchema,
});

export type SlaJobResult = z.infer<typeof slaJobResultSchema>;

const jobDedupe = new Map<string, SlaJobResult>();

// Lazy initialization of Queue to avoid creating it in environments without Redis
let queueInstance: Queue | null = null;

function getQueue(): Queue | null {
  if (queueInstance) {
    return queueInstance;
  }

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    // In environments without Redis, return null (jobs will be skipped)
    return null;
  }

  const queueName = process.env.BULLMQ_QUEUE ?? "helpdesk-default";
  const prefix = process.env.BULLMQ_PREFIX ?? "helpdesk";
  const connection = {
    host: new URL(redisUrl).hostname,
    port: Number.parseInt(new URL(redisUrl).port || "6379", 10),
  };

  queueInstance = new Queue(queueName, { connection, prefix });
  return queueInstance;
}

export async function enqueueSlaJob(
  payload: SlaJobPayload
): Promise<SlaJobResult> {
  // Check for deduplication first
  if (payload.idempotencyKey) {
    const cached = jobDedupe.get(payload.idempotencyKey);
    if (cached) {
      return { ...cached, deduped: true };
    }
  }

  const queue = getQueue();
  if (!queue) {
    // If no queue available (e.g., in test/dev without Redis), return success but mark as not enqueued
    const result: SlaJobResult = {
      jobId: payload.jobId,
      enqueued: false,
      deduped: false,
      jobType: payload.jobType,
    };
    return result;
  }

  try {
    // Calculate delay until the due date
    const dueMs = Date.parse(payload.dueAt);
    const now = Date.now();
    const delay = Math.max(0, dueMs - now);

    // Enqueue job with delay
    await queue.add(
      payload.jobType, // Job name matches the jobType
      payload, // Job data
      {
        jobId: payload.jobId,
        delay, // Schedule job to run at the due date
        removeOnComplete: true,
        removeOnFail: false, // Keep failed jobs for debugging
      }
    );

    const result: SlaJobResult = {
      jobId: payload.jobId,
      enqueued: true,
      deduped: false,
      jobType: payload.jobType,
    };

    if (payload.idempotencyKey) {
      jobDedupe.set(payload.idempotencyKey, result);
    }

    return result;
  } catch (error) {
    // If enqueue fails, return error result
    return {
      jobId: payload.jobId,
      enqueued: false,
      deduped: false,
      jobType: payload.jobType,
    };
  }
}

export function resetSlaJobDedupe() {
  jobDedupe.clear();
}

export function createSlaJobPayload(init: {
  jobType: z.infer<typeof slaJobTypeSchema>;
  ticketId: string;
  organizationId: string;
  dueAt: string | Date;
  priority: string;
  categoryId?: string | null;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}): SlaJobPayload {
  const payload: SlaJobPayload = {
    jobId: randomUUID(),
    jobType: init.jobType,
    ticketId: init.ticketId,
    organizationId: init.organizationId,
    dueAt: typeof init.dueAt === "string" ? init.dueAt : init.dueAt.toISOString(),
    priority: init.priority,
    categoryId: init.categoryId ?? null,
    metadata: init.metadata,
    idempotencyKey: init.idempotencyKey,
  };

  return payload;
}
