import { randomUUID } from "crypto";
import { z } from "zod";

export const slaJobTypeSchema = z.enum(["first-response", "resolve"]);

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
});

export type SlaJobPayload = z.infer<typeof slaJobPayloadSchema>;

export const slaJobResultSchema = z.object({
  jobId: z.string().uuid(),
  enqueued: z.boolean(),
  deduped: z.boolean(),
  jobType: slaJobTypeSchema,
});

export type SlaJobResult = z.infer<typeof slaJobResultSchema>;

export async function enqueueSlaJob(
  payload: SlaJobPayload
): Promise<SlaJobResult> {
  const parsed = slaJobPayloadSchema.parse(payload);
  // stub: future implementation will push into queue/storage.
  return {
    jobId: parsed.jobId,
    enqueued: true,
    deduped: false,
    jobType: parsed.jobType,
  };
}

export function createSlaJobPayload(init: {
  jobType: z.infer<typeof slaJobTypeSchema>;
  ticketId: string;
  organizationId: string;
  dueAt: string | Date;
  priority: string;
  categoryId?: string | null;
  metadata?: Record<string, unknown>;
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
  };

  slaJobPayloadSchema.parse(payload);
  return payload;
}
