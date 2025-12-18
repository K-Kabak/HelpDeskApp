import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
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

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where =
    session.user.role === "REQUESTER"
      ? { requesterId: session.user.id }
      : { organizationId: session.user.organizationId };

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      requester: true,
      assigneeUser: true,
      assigneeTeam: true,
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sla = await prisma.slaPolicy.findFirst({
    where: {
      organizationId: session.user.organizationId,
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
      requesterId: session.user.id,
      organizationId: session.user.organizationId ?? "",
      firstResponseDue,
      resolveDue,
      auditEvents: {
        create: {
          actorId: session.user.id,
          action: "TICKET_CREATED",
          data: {
            status: TicketStatus.NOWE,
            priority: parsed.data.priority,
          },
        },
      },
    },
  });

  return NextResponse.json({ ticket });
}
