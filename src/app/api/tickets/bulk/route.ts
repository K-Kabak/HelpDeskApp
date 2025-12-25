import { prisma } from "@/lib/prisma";
import { requireAuth, isAgentOrAdmin } from "@/lib/authorization";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TicketStatus, Prisma } from "@prisma/client";
import { deriveSlaPauseUpdates } from "@/lib/sla-pause";
import { scheduleSlaJobsForTicket } from "@/lib/sla-scheduler";
import { evaluateAutomationRules } from "@/lib/automation-rules";

const bulkActionSchema = z.object({
  ticketIds: z.array(z.string().uuid()).min(1).max(100), // Limit to 100 tickets per request
  action: z.enum(["assign", "status"]),
  value: z.string(),
});

type BulkActionResult = {
  success: number;
  failed: number;
  errors: Array<{ ticketId: string; error: string }>;
import { createRequestLogger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TicketStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { deriveSlaPauseUpdates } from "@/lib/sla-pause";
import { scheduleSlaJobsForTicket } from "@/lib/sla-scheduler";

const bulkUpdateSchema = z.object({
  ticketIds: z.array(z.string().uuid()).min(1).max(100),
  status: z.nativeEnum(TicketStatus).optional(),
  assigneeUserId: z.string().uuid().nullable().optional(),
  assigneeTeamId: z.string().uuid().nullable().optional(),
});

type BulkUpdateResult = {
  updated: number;
  errors?: Array<{ ticketId: string; error: string }>;
};

/**
 * PATCH /api/tickets/bulk
 * 
 * Performs bulk operations on multiple tickets (assign or status change).
 * 
 * Authorization:
 * - AGENT/ADMIN only
 * - All tickets must belong to user's organization
 * 
 * Business logic:
 * - Validates all ticket IDs exist and belong to organization
 * - For 'assign': validates assigneeUserId exists and is AGENT/ADMIN in org
 * - For 'status': validates status enum value
 * - Processes each ticket individually, tracking successes/failures
 * - Creates audit events for successful updates
 * - Reschedules SLA jobs for updated tickets
 * - Triggers automation rules for status/assignment changes
 * 
 * Returns partial success results if some tickets fail.
 * Performs bulk updates on multiple tickets in a single request.
 * 
 * Authorization:
 * - Only AGENT/ADMIN can use bulk actions
 * - All tickets must belong to user's organization
 * 
 * Business logic:
 * - Validates all ticket IDs belong to user's organization
 * - Validates assignee/team exist and are in same organization
 * - Updates tickets in transaction
 * - Creates audit events for each ticket update
 * - Reschedules SLA jobs if status changes
 * 
 * Returns partial success - some tickets may fail while others succeed.
 */
export async function PATCH(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/tickets/bulk",
    method: req.method,
    method: "PATCH",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  // Only AGENT/ADMIN can perform bulk actions
  if (!isAgentOrAdmin(auth.user)) {
    logger.warn("bulk.actions.forbidden", { role: auth.user.role });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Rate limiting
  const rate = checkRateLimit(req, "tickets:bulk", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  const body = await req.json();
  const parsed = bulkActionSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("bulk.actions.validation_failed");
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ticketIds, action, value } = parsed.data;
  const result: BulkActionResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  // Validate all tickets exist and belong to organization
  const tickets = await prisma.ticket.findMany({
    where: {
      id: { in: ticketIds },
      organizationId: auth.user.organizationId ?? undefined,
    },
    include: {
      requester: true,
      assigneeUser: true,
      assigneeTeam: true,
    },
  });

  // Check for tickets that don't exist or don't belong to org
  const foundTicketIds = new Set(tickets.map((t) => t.id));
  for (const ticketId of ticketIds) {
    if (!foundTicketIds.has(ticketId)) {
      result.failed++;
      result.errors.push({
        ticketId,
        error: "Ticket not found or access denied",
      });
    }
  }

  // Validate action-specific values
  if (action === "assign") {
    if (!value) {
      // Allow clearing assignment with empty string
      // value can be empty string or UUID
    } else {
      const assignee = await prisma.user.findFirst({
        where: {
          id: value,
          organizationId: auth.user.organizationId ?? undefined,
          role: { in: ["AGENT", "ADMIN"] },
        },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: "Invalid assignee. Must be AGENT or ADMIN in your organization." },
          { status: 400 }
        );
      }
    }
  } else if (action === "status") {
    // Validate status enum value
    if (!Object.values(TicketStatus).includes(value as TicketStatus)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${Object.values(TicketStatus).join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Process each ticket
  const now = new Date();
  for (const ticket of tickets) {
    try {
      const updates: Prisma.TicketUpdateInput = {};
      const changes: Record<string, { from: unknown; to: unknown }> = {};

      if (action === "assign") {
        // Bulk assign: set assigneeUserId
        const newAssigneeId = value || null;
        if (newAssigneeId !== ticket.assigneeUserId) {
          updates.assigneeUser = newAssigneeId
            ? { connect: { id: newAssigneeId } }
            : { disconnect: true };
          changes.assigneeUserId = {
            from: ticket.assigneeUserId,
            to: newAssigneeId,
          };
        }
      } else if (action === "status") {
        // Bulk status change
        const newStatus = value as TicketStatus;
        if (newStatus !== ticket.status) {
          updates.status = newStatus;
          changes.status = { from: ticket.status, to: newStatus };

          // Handle status-specific fields
          if (newStatus === TicketStatus.ROZWIAZANE) {
            updates.resolvedAt = now;
            updates.closedAt = null;
          } else if (newStatus === TicketStatus.ZAMKNIETE) {
            updates.closedAt = now;
          } else if (newStatus === TicketStatus.PONOWNIE_OTWARTE) {
            updates.lastReopenedAt = now;
            updates.resolvedAt = null;
            updates.closedAt = null;
          } else {
            updates.resolvedAt = null;
            updates.closedAt = null;
          }

          // Update SLA pause state
          const slaPauseUpdates = deriveSlaPauseUpdates(ticket, newStatus, now);
          if (Object.keys(slaPauseUpdates).length > 0) {
            Object.assign(updates, slaPauseUpdates);
            for (const [key, val] of Object.entries(slaPauseUpdates)) {
              if (val === undefined) continue;
              changes[key] = {
                from: (ticket as Record<string, unknown>)[key],
                to: val,
              };
            }
          }
        }
      }

      // Skip if no changes
      if (Object.keys(changes).length === 0) {
        result.success++;
        continue;
      }

      // Execute update with audit event in transaction
      const auditData: Record<string, unknown> = { changes };
      const auditDataJson = auditData as Prisma.InputJsonValue;

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
            actorId: auth.user.id,
            action: "TICKET_UPDATED",
            data: auditDataJson,
          },
        }),
      ]);

      // Reschedule SLA jobs if needed
      await scheduleSlaJobsForTicket({
        id: updatedTicket.id,
        organizationId: updatedTicket.organizationId,
        priority: updatedTicket.priority,
        requesterId: updatedTicket.requesterId,
        firstResponseDue: updatedTicket.firstResponseDue,
        resolveDue: updatedTicket.resolveDue,
      });

      // Trigger automation rules
      await evaluateAutomationRules({
        type: "ticketUpdated",
        ticket: updatedTicket,
        previousTicket: ticket,
        changes,
      });

      result.success++;
    } catch (error) {
      result.failed++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      result.errors.push({
        ticketId: ticket.id,
        error: errorMessage,
      });
      logger.warn("bulk.actions.ticket_failed", {
        ticketId: ticket.id,
        error: errorMessage,
      });
    }
  }

  logger.info("bulk.actions.completed", {
    action,
    total: ticketIds.length,
    success: result.success,
    failed: result.failed,
  // Only AGENT/ADMIN can use bulk actions
  if (!isAgentOrAdmin(auth.user)) {
    logger.warn("bulk.forbidden", { role: auth.user.role });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Validate organization
  if (!auth.user.organizationId) {
    logger.warn("bulk.no_organization");
    return NextResponse.json({ error: "User has no organization" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = bulkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("bulk.validation_failed");
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ticketIds, status, assigneeUserId, assigneeTeamId } = parsed.data;

  // Validate at least one update field is provided
  if (status === undefined && assigneeUserId === undefined && assigneeTeamId === undefined) {
    return NextResponse.json(
      { error: "At least one update field (status, assigneeUserId, assigneeTeamId) must be provided" },
      { status: 400 }
    );
  }

  // Validate assignee if provided
  if (assigneeUserId !== undefined && assigneeUserId !== null) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: assigneeUserId,
        organizationId: auth.user.organizationId,
        role: { in: ["AGENT", "ADMIN"] },
      },
    });

    if (!assignee) {
      return NextResponse.json({ error: "Invalid assignee" }, { status: 400 });
    }
  }

  // Validate team if provided
  if (assigneeTeamId !== undefined && assigneeTeamId !== null) {
    const team = await prisma.team.findFirst({
      where: {
        id: assigneeTeamId,
        organizationId: auth.user.organizationId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Invalid team" }, { status: 400 });
    }
  }

  // Fetch all tickets and verify they belong to user's organization
  const tickets = await prisma.ticket.findMany({
    where: {
      id: { in: ticketIds },
      organizationId: auth.user.organizationId,
    },
    select: {
      id: true,
      status: true,
      assigneeUserId: true,
      assigneeTeamId: true,
      priority: true,
      organizationId: true,
      requesterId: true,
      firstResponseDue: true,
      resolveDue: true,
      resolvedAt: true,
      closedAt: true,
      lastReopenedAt: true,
    },
  });

  // Check if all requested tickets were found
  const foundTicketIds = new Set(tickets.map((t) => t.id));
  const missingTicketIds = ticketIds.filter((id) => !foundTicketIds.has(id));

  const result: BulkUpdateResult = {
    updated: 0,
    errors: [],
  };

  // Add errors for missing tickets
  for (const ticketId of missingTicketIds) {
    result.errors?.push({
      ticketId,
      error: "Ticket not found or access denied",
    });
  }

  const now = new Date();
  const updatePromises: Promise<void>[] = [];

  // Process each ticket
  for (const ticket of tickets) {
    updatePromises.push(
      (async () => {
        try {
          const updates: Prisma.TicketUpdateInput = {};
          const changes: Record<string, { from: unknown; to: unknown }> = {};

          // Handle status update
          if (status !== undefined && status !== ticket.status) {
            updates.status = status;
            changes.status = { from: ticket.status, to: status };

            // Handle status-specific fields
            if (status === TicketStatus.ROZWIAZANE) {
              updates.resolvedAt = now;
              updates.closedAt = null;
            } else if (status === TicketStatus.ZAMKNIETE) {
              updates.closedAt = now;
            } else if (status === TicketStatus.PONOWNIE_OTWARTE) {
              updates.lastReopenedAt = now;
              updates.resolvedAt = null;
              updates.closedAt = null;
            } else {
              updates.resolvedAt = null;
              updates.closedAt = null;
            }

            // Handle SLA pause updates
            const slaPauseUpdates = deriveSlaPauseUpdates(ticket, status, now);
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

          // Handle assignee update
          if (assigneeUserId !== undefined && assigneeUserId !== ticket.assigneeUserId) {
            updates.assigneeUser = assigneeUserId
              ? { connect: { id: assigneeUserId } }
              : { disconnect: true };
            changes.assigneeUserId = {
              from: ticket.assigneeUserId,
              to: assigneeUserId,
            };
          }

          // Handle team update
          if (assigneeTeamId !== undefined && assigneeTeamId !== ticket.assigneeTeamId) {
            updates.assigneeTeam = assigneeTeamId
              ? { connect: { id: assigneeTeamId } }
              : { disconnect: true };
            changes.assigneeTeamId = {
              from: ticket.assigneeTeamId,
              to: assigneeTeamId,
            };
          }

          // Skip if no changes
          if (Object.keys(changes).length === 0) {
            return;
          }

          const auditData: Record<string, unknown> = {
            changes,
            bulkUpdate: true,
          };

          // Update ticket and create audit event in transaction
          const [updatedTicket] = await prisma.$transaction([
            prisma.ticket.update({
              where: { id: ticket.id },
              data: updates,
            }),
            prisma.auditEvent.create({
              data: {
                ticketId: ticket.id,
                actorId: auth.user.id,
                action: "TICKET_UPDATED",
                data: auditData as Prisma.InputJsonValue,
              },
            }),
          ]);

          // Reschedule SLA jobs if status changed
          if (status !== undefined && status !== ticket.status) {
            await scheduleSlaJobsForTicket({
              id: updatedTicket.id,
              organizationId: updatedTicket.organizationId,
              priority: updatedTicket.priority,
              requesterId: updatedTicket.requesterId,
              firstResponseDue: updatedTicket.firstResponseDue,
              resolveDue: updatedTicket.resolveDue,
            });
          }

          result.updated++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          result.errors?.push({
            ticketId: ticket.id,
            error: errorMessage,
          });
          logger.error("bulk.update.failed", {
            ticketId: ticket.id,
            error: errorMessage,
          });
        }
      })()
    );
  }

  // Wait for all updates to complete
  await Promise.all(updatePromises);

  logger.info("bulk.update.complete", {
    requested: ticketIds.length,
    updated: result.updated,
    errors: result.errors?.length ?? 0,
  });

  return NextResponse.json(result);
}


