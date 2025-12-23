import { prisma } from "@/lib/prisma";
import { createRequestLogger } from "@/lib/logger";
import { isSameOrganization, requireAuth } from "@/lib/authorization";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: `/api/tickets/${id}/csat`,
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true, requesterId: true, organizationId: true },
  });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isSameOrganization(auth.user, ticket.organizationId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (ticket.requesterId !== auth.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingResponse = await prisma.csatResponse.findUnique({
    where: { ticketId: ticket.id },
  });
  if (existingResponse) {
    return NextResponse.json({ error: "CSAT response already submitted" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const response = await prisma.csatResponse.create({
    data: {
      ticketId: ticket.id,
      score: parsed.data.score,
      comment: parsed.data.comment,
    },
  });

  logger.info("csat.response.created", { ticketId: ticket.id, score: response.score });
  return NextResponse.json({ response });
}

