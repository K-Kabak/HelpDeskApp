import { requireAuth } from "@/lib/authorization";
import { findSlaPolicyForTicket } from "@/lib/sla-policy";
import { computeSlaDueDates, toIsoDueDates } from "@/lib/sla-preview";
import { TicketPriority } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  priority: z.nativeEnum(TicketPriority),
  category: z.string().optional(),
});

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const policy = await findSlaPolicyForTicket(
    auth.user.organizationId ?? "",
    parsed.data.priority,
    parsed.data.category,
  );
  const dueDates = computeSlaDueDates(policy);
  const preview = toIsoDueDates(dueDates);

  return NextResponse.json({
    preview,
    policy: policy
      ? {
          priority: policy.priority,
          category: policy.category ?? null,
          firstResponseHours: policy.firstResponseHours,
          resolveHours: policy.resolveHours,
        }
      : null,
  });
}
