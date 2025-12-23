import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, TicketPriority, TicketStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { deriveSlaPauseUpdates } from "@/lib/sla-pause";
import { scheduleSlaJobsForTicket } from "@/lib/sla-scheduler";
import { notificationService } from "@/lib/notification";

const updateSchema = z
  .object({
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    assigneeUserId: z.string().uuid().nullable().optional(),
    assigneeTeamId: z.string().uuid().nullable().optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.priority !== undefined ||
      data.assigneeUserId !== undefined ||
      data.assigneeTeamId !== undefined,
    {
      message: "No updates provided",
    }
  );

async function updateTicket(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
  });

  if (!ticket || ticket.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAgent =
    session.user.role === "AGENT" || session.user.role === "ADMIN";
  const isRequester = session.user.role === "REQUESTER";

  if (isRequester && ticket.requesterId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const payload = parsed.data;
  const now = new Date();

  // Check reopen cooldown if attempting to reopen
  if (payload.status === TicketStatus.PONOWNIE_OTWARTE && ticket.status !== TicketStatus.PONOWNIE_OTWARTE) {
    const cooldownEnabled = process.env.REOPEN_COOLDOWN_ENABLED !== "false";
    const cooldownMs = Number.parseInt(process.env.REOPEN_COOLDOWN_MS ?? "600000", 10); // Default 10 minutes

    if (cooldownEnabled && ticket.lastReopenedAt) {
      const timeSinceLastReopen = now.getTime() - ticket.lastReopenedAt.getTime();
      if (timeSinceLastReopen < cooldownMs) {
        const retryAfterSeconds = Math.max(1, Math.ceil((cooldownMs - timeSinceLastReopen) / 1000));
        return NextResponse.json(
          { error: "Reopen cooldown active" },
          {
            status: 429,
            headers: {
              "Retry-After": `${retryAfterSeconds}`,
            },
          }
        );
      }
    }
  }

  if (isRequester) {
    if (payload.priority !== undefined || payload.assigneeUserId !== undefined || payload.assigneeTeamId !== undefined) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!payload.status) {
      return NextResponse.json({ error: "Status update required" }, { status: 400 });
    }

    const requesterAllowedStatuses: TicketStatus[] = [];
    if (ticket.status !== TicketStatus.ZAMKNIETE) {
      requesterAllowedStatuses.push(TicketStatus.ZAMKNIETE);
    }
    if (
      ticket.status === TicketStatus.ZAMKNIETE ||
      ticket.status === TicketStatus.ROZWIAZANE
    ) {
      requesterAllowedStatuses.push(TicketStatus.PONOWNIE_OTWARTE);
    }

    if (!requesterAllowedStatuses.includes(payload.status)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updates: Prisma.TicketUpdateInput = {};
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  if (payload.status && payload.status !== ticket.status) {
    updates.status = payload.status;
    changes.status = { from: ticket.status, to: payload.status };

    if (payload.status === TicketStatus.ROZWIAZANE) {
      updates.resolvedAt = now;
      updates.closedAt = null;
    } else if (payload.status === TicketStatus.ZAMKNIETE) {
      updates.closedAt = now;
    } else if (payload.status === TicketStatus.PONOWNIE_OTWARTE) {
      updates.lastReopenedAt = now;
      updates.resolvedAt = null;
      updates.closedAt = null;
    } else {
      updates.resolvedAt = null;
      updates.closedAt = null;
    }

    const slaPauseUpdates = deriveSlaPauseUpdates(ticket, payload.status, now);
    if (Object.keys(slaPauseUpdates).length > 0) {
      Object.assign(updates, slaPauseUpdates);
      for (const [key, value] of Object.entries(slaPauseUpdates)) {
        if (value === undefined) continue;
        changes[key] = {
          from: (ticket as Record<string, unknown>)[key],
          to: value,
        };
      }
    }
  }

  if (payload.priority !== undefined) {
    if (!isAgent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payload.priority !== ticket.priority) {
      updates.priority = payload.priority;
      changes.priority = { from: ticket.priority, to: payload.priority };
    }
  }

  if (payload.assigneeUserId !== undefined) {
    if (!isAgent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payload.assigneeUserId) {
      const user = await prisma.user.findFirst({
        where: {
          id: payload.assigneeUserId,
          organizationId: session.user.organizationId,
          role: { in: ["AGENT", "ADMIN"] },
        },
      });

      if (!user) {
        return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
      }
    }

    if (payload.assigneeUserId !== ticket.assigneeUserId) {
      updates.assigneeUserId = payload.assigneeUserId;
      changes.assigneeUserId = {
        from: ticket.assigneeUserId,
        to: payload.assigneeUserId,
      };
    }
  }

  if (payload.assigneeTeamId !== undefined) {
    if (!isAgent) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payload.assigneeTeamId) {
      const team = await prisma.team.findFirst({
        where: {
          id: payload.assigneeTeamId,
          organizationId: session.user.organizationId,
        },
      });

      if (!team) {
        return NextResponse.json({ error: "Invalid team" }, { status: 400 });
      }
    }

    if (payload.assigneeTeamId !== ticket.assigneeTeamId) {
      updates.assigneeTeamId = payload.assigneeTeamId;
      changes.assigneeTeamId = {
        from: ticket.assigneeTeamId,
        to: payload.assigneeTeamId,
      };
    }
  }

  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const auditData = {
    changes,
  };

  const [updatedTicket] = await prisma.$transaction([
    prisma.ticket.update({
      where: { id: ticket.id },
      data: updates,
      include: {
        requester: true,
        assigneeUser: true,
        assigneeTeam: true,
      },
    }),
    prisma.auditEvent.create({
      data: {
        ticketId: ticket.id,
        actorId: session.user.id,
        action: "TICKET_UPDATED",
        data: auditData,
      },
    }),
  ]);

  await scheduleSlaJobsForTicket({
    id: updatedTicket.id,
    organizationId: updatedTicket.organizationId,
    priority: updatedTicket.priority,
    requesterId: updatedTicket.requesterId,
    firstResponseDue: updatedTicket.firstResponseDue,
    resolveDue: updatedTicket.resolveDue,
  });

  const { evaluateAutomationRules } = await import("@/lib/automation-rules");
  await evaluateAutomationRules({
    type: "ticketUpdated",
    ticket: updatedTicket,
    previousTicket: ticket,
    changes,
  });

  // Trigger CSAT request on resolution/closure (idempotent)
  const finalStatuses: TicketStatus[] = [TicketStatus.ROZWIAZANE, TicketStatus.ZAMKNIETE];
  if (payload.status && finalStatuses.includes(payload.status) && payload.status !== ticket.status) {
    const existingCsat = await prisma.csatRequest.findUnique({
      where: { ticketId: updatedTicket.id },
    });

    if (!existingCsat) {
      await prisma.csatRequest.create({
        data: {
          ticketId: updatedTicket.id,
        },
      });

      await notificationService.send({
        channel: "email",
        to: updatedTicket.requester.email,
        subject: "Prosimy o opinię - Zgłoszenie #" + updatedTicket.number,
        templateId: "csat-request",
        idempotencyKey: `csat-${updatedTicket.id}`,
        data: {
          ticketId: updatedTicket.id,
          ticketNumber: updatedTicket.number,
        },
        metadata: {
          notificationType: "ticketUpdate",
        },
      });
    }
  }

  return NextResponse.json({ ticket: updatedTicket });
}

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  return updateTicket(req, context);
}

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  return updateTicket(req, context);
}
