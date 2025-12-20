import { prisma } from "@/lib/prisma";
import { requireAuth, ticketScope } from "@/lib/authorization";
import { createRequestLogger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";
import { addHours } from "date-fns";

const createSchema = z.object({
  title: z.string().min(3),
  descriptionMd: z.string().min(3),
  priority: z.nativeEnum(TicketPriority),
  category: z.string().optional(),
});

export async function GET(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/tickets",
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  const where = ticketScope(auth.user);

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      requester: true,
      assigneeUser: true,
      assigneeTeam: true,
    },
  });

  logger.info("tickets.list.success", {
    count: tickets.length,
    role: auth.user.role,
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/tickets",
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("tickets.create.validation_failed");
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sla = await prisma.slaPolicy.findFirst({
    where: {
      organizationId: auth.user.organizationId ?? "",
      priority: parsed.data.priority,
    },
  });

  const firstResponseDue = sla
    ? addHours(new Date(), sla.firstResponseHours)
    : null;
  const resolveDue = sla ? addHours(new Date(), sla.resolveHours) : null;

  const ticket = await prisma.ticket.create({
    data: {
      title: parsed.data.title,
      descriptionMd: parsed.data.descriptionMd,
      priority: parsed.data.priority,
      category: parsed.data.category,
      status: TicketStatus.NOWE,
      requesterId: auth.user.id,
      organizationId: auth.user.organizationId ?? "",
      firstResponseDue,
      resolveDue,
      auditEvents: {
        create: {
          actorId: auth.user.id,
          action: "TICKET_CREATED",
          data: {
            status: TicketStatus.NOWE,
            priority: parsed.data.priority,
          },
        },
      },
    },
  });

  logger.info("tickets.create.success", {
    ticketId: ticket.id,
    priority: ticket.priority,
  });

  return NextResponse.json({ ticket });
}
