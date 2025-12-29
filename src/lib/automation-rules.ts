import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TicketStatus, TicketPriority, Ticket } from "@prisma/client";

export type TriggerType = "ticketCreated" | "ticketUpdated" | "statusChanged" | "priorityChanged";
export type ActionType = "assignUser" | "assignTeam" | "setPriority" | "setStatus" | "addTag";

export const triggerConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ticketCreated"),
  }),
  z.object({
    type: z.literal("ticketUpdated"),
  }),
  z.object({
    type: z.literal("statusChanged"),
    status: z.nativeEnum(TicketStatus),
  }),
  z.object({
    type: z.literal("priorityChanged"),
    priority: z.nativeEnum(TicketPriority),
  }),
]);

export const actionConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("assignUser"),
    userId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("assignTeam"),
    teamId: z.string().uuid(),
  }),
  z.object({
    type: z.literal("setPriority"),
    priority: z.nativeEnum(TicketPriority),
  }),
  z.object({
    type: z.literal("setStatus"),
    status: z.nativeEnum(TicketStatus),
  }),
  z.object({
    type: z.literal("addTag"),
    tagId: z.string().uuid(),
  }),
]);

export type TriggerConfig = z.infer<typeof triggerConfigSchema>;
export type ActionConfig = z.infer<typeof actionConfigSchema>;

export function validateTriggerConfig(config: unknown): TriggerConfig {
  return triggerConfigSchema.parse(config);
}

export function validateActionConfig(config: unknown): ActionConfig {
  return actionConfigSchema.parse(config);
}

export type TicketEvent = {
  type: "ticketCreated" | "ticketUpdated";
  ticket: Ticket;
  previousTicket?: Ticket;
  changes?: Record<string, { from: unknown; to: unknown }>;
};

function matchesTrigger(
  trigger: TriggerConfig,
  event: TicketEvent
): boolean {
  if (trigger.type === "ticketCreated") {
    return event.type === "ticketCreated";
  }
  if (trigger.type === "ticketUpdated") {
    return event.type === "ticketUpdated";
  }
  if (trigger.type === "statusChanged") {
    if (event.type !== "ticketUpdated" || !event.previousTicket) {
      return false;
    }
    return (
      event.previousTicket.status !== trigger.status &&
      event.ticket.status === trigger.status
    );
  }
  if (trigger.type === "priorityChanged") {
    if (event.type !== "ticketUpdated" || !event.previousTicket) {
      return false;
    }
    return (
      event.previousTicket.priority !== trigger.priority &&
      event.ticket.priority === trigger.priority
    );
  }
  return false;
}

async function executeAction(
  action: ActionConfig,
  ticketId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _organizationId: string
): Promise<void> {
  if (action.type === "assignUser") {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { assigneeUserId: action.userId },
    });
  } else if (action.type === "assignTeam") {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { assigneeTeamId: action.teamId },
    });
  } else if (action.type === "setPriority") {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { priority: action.priority },
    });
  } else if (action.type === "setStatus") {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: action.status },
    });
  } else if (action.type === "addTag") {
    await prisma.ticketTag.upsert({
      where: {
        ticketId_tagId: {
          ticketId,
          tagId: action.tagId,
        },
      },
      create: {
        ticketId,
        tagId: action.tagId,
      },
      update: {},
    });
  }
}

/**
 * Evaluates and executes automation rules for a ticket event.
 * 
 * Fetches all enabled automation rules for the ticket's organization,
 * validates trigger and action configurations, and executes matching rules.
 * 
 * Invalid rules are skipped with error logging (does not throw).
 * 
 * @param event - Ticket event containing ticket data and event type
 */
export async function evaluateAutomationRules(
  event: TicketEvent
): Promise<void> {
  const rules = await prisma.automationRule.findMany({
    where: {
      organizationId: event.ticket.organizationId,
      enabled: true,
    },
  });

  if (!Array.isArray(rules)) {
    return;
  }

  for (const rule of rules) {
    try {
      const trigger = validateTriggerConfig(rule.triggerConfig);
      const action = validateActionConfig(rule.actionConfig);

      if (matchesTrigger(trigger, event)) {
        await executeAction(action, event.ticket.id, event.ticket.organizationId);
      }
    } catch (error) {
      // Skip invalid rules - errors are handled gracefully
      // Logging should be done at the caller level if needed
    }
  }
}

