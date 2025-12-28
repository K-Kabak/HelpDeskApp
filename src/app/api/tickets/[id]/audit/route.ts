import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
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
    session.user.role === "REQUESTER" &&
    ticket.requesterId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check organization scope for agents/admins
  if (
    session.user.role !== "REQUESTER" &&
    ticket.organizationId !== session.user.organizationId
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auditEvents = await prisma.auditEvent.findMany({
    where: { ticketId: params.id },
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







