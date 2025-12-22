import { randomUUID } from "crypto";
import { z } from "zod";

export const slaJobTypeSchema = z.enum(["first-response", "resolve", "reminder"]);

export const slaJobPayloadSchema = z.object({
  jobId: z.string().uuid(),
  jobType: slaJobTypeSchema,
  ticketId: z.string().uuid(),
  organizationId: z.string(),
  dueAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "dueAt must be a valid ISO date string",
  }),
  priority: z.string(),
  categoryId: z.string().uuid().nullable(),
  metadata: z.record(z.unknown()).optional(),
  idempotencyKey: z.string().min(1).optional(),
});

export type SlaJobPayload = z.infer<typeof slaJobPayloadSchema>;

export const slaJobResultSchema = z.object({
  jobId: z.string().uuid(),
  enqueued: z.boolean(),
  deduped: z.boolean(),
  jobType: slaJobTypeSchema,
});

export type SlaJobResult = z.infer<typeof slaJobResultSchema>;

const jobDedupe = new Map<string, SlaJobResult>();

export async function enqueueSlaJob(
  payload: SlaJobPayload
): Promise<SlaJobResult> {
  if (payload.idempotencyKey) {
    const cached = jobDedupe.get(payload.idempotencyKey);
    if (cached) {
      return { ...cached, deduped: true };
    }
  }

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
