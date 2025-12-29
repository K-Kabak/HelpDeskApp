import { prisma } from "@/lib/prisma";
import { requireAuth, isSameOrganization } from "@/lib/authorization";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: `/api/tickets/${id}/audit`,
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  const rate = checkRateLimit(req, "tickets:audit", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: {
      id: true,
      organizationId: true,
      requesterId: true,
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Check permissions: requester can only see their own tickets
  if (
    auth.user.role === "REQUESTER" &&
    ticket.requesterId !== auth.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check organization scope for agents/admins
  if (
    auth.user.role !== "REQUESTER" &&
    !isSameOrganization(auth.user, ticket.organizationId)
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auditEvents = await prisma.auditEvent.findMany({
    where: { ticketId: id },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    auditEvents: auditEvents.map((event) => ({
      id: event.id,
      action: event.action,
      actorId: event.actorId,
      actor: event.actor,
      data: event.data,
      createdAt: event.createdAt.toISOString(),
    })),
  });
}







