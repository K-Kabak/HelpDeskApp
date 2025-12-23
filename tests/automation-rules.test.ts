import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  validateTriggerConfig,
  validateActionConfig,
  evaluateAutomationRules,
  type TicketEvent,
} from "@/lib/automation-rules";
import { TicketStatus, TicketPriority } from "@prisma/client";

const mockPrisma = vi.hoisted(() => ({
  automationRule: {
    findMany: vi.fn(),
  },
  ticket: {
    update: vi.fn(),
  },
  ticketTag: {
    upsert: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

describe("automation rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateTriggerConfig", () => {
    it("validates ticketCreated trigger", () => {
      const config = { type: "ticketCreated" };
      expect(validateTriggerConfig(config)).toEqual(config);
    });

    it("validates ticketUpdated trigger", () => {
      const config = { type: "ticketUpdated" };
      expect(validateTriggerConfig(config)).toEqual(config);
    });

    it("validates statusChanged trigger", () => {
      const config = { type: "statusChanged", status: TicketStatus.ROZWIAZANE };
      expect(validateTriggerConfig(config)).toEqual(config);
    });

    it("validates priorityChanged trigger", () => {
      const config = { type: "priorityChanged", priority: TicketPriority.WYSOKI };
      expect(validateTriggerConfig(config)).toEqual(config);
    });

    it("rejects invalid trigger type", () => {
      expect(() => validateTriggerConfig({ type: "invalid" })).toThrow();
    });

    it("rejects statusChanged without status", () => {
      expect(() => validateTriggerConfig({ type: "statusChanged" })).toThrow();
    });

    it("rejects priorityChanged without priority", () => {
      expect(() => validateTriggerConfig({ type: "priorityChanged" })).toThrow();
    });
  });

  describe("validateActionConfig", () => {
    it("validates assignUser action", () => {
      const config = { type: "assignUser", userId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(validateActionConfig(config)).toEqual(config);
    });

    it("validates assignTeam action", () => {
      const config = { type: "assignTeam", teamId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(validateActionConfig(config)).toEqual(config);
    });

    it("validates setPriority action", () => {
      const config = { type: "setPriority", priority: TicketPriority.KRYTYCZNY };
      expect(validateActionConfig(config)).toEqual(config);
    });

    it("validates setStatus action", () => {
      const config = { type: "setStatus", status: TicketStatus.W_TOKU };
      expect(validateActionConfig(config)).toEqual(config);
    });

    it("validates addTag action", () => {
      const config = { type: "addTag", tagId: "123e4567-e89b-12d3-a456-426614174000" };
      expect(validateActionConfig(config)).toEqual(config);
    });

    it("rejects invalid action type", () => {
      expect(() => validateActionConfig({ type: "invalid" })).toThrow();
    });

    it("rejects assignUser without userId", () => {
      expect(() => validateActionConfig({ type: "assignUser" })).toThrow();
    });

    it("rejects invalid UUID", () => {
      expect(() => validateActionConfig({ type: "assignUser", userId: "not-uuid" })).toThrow();
    });
  });

  describe("evaluateAutomationRules", () => {
    const baseTicket = {
      id: "ticket-1",
      number: 1,
      title: "Test",
      descriptionMd: "Test",
      status: TicketStatus.NOWE,
      priority: TicketPriority.SREDNI,
      category: null,
      requesterId: "user-1",
      assigneeUserId: null,
      assigneeTeamId: null,
      organizationId: "org-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      resolvedAt: null,
      closedAt: null,
      firstResponseAt: null,
      firstResponseDue: null,
      resolveDue: null,
      slaPausedAt: null,
      slaResumedAt: null,
      slaPauseTotalSeconds: 0,
      lastReopenedAt: null,
    };

    it("executes rule on ticketCreated event", async () => {
      mockPrisma.automationRule.findMany.mockResolvedValue([
        {
          id: "rule-1",
          triggerConfig: { type: "ticketCreated" },
          actionConfig: { type: "setPriority", priority: TicketPriority.WYSOKI },
        },
      ]);
      mockPrisma.ticket.update.mockResolvedValue(baseTicket);

      const event: TicketEvent = {
        type: "ticketCreated",
        ticket: baseTicket,
      };

      await evaluateAutomationRules(event);

      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: "ticket-1" },
        data: { priority: TicketPriority.WYSOKI },
      });
    });

    it("executes rule on statusChanged trigger", async () => {
      const previousTicket = { ...baseTicket, status: TicketStatus.NOWE };
      const updatedTicket = { ...baseTicket, status: TicketStatus.ROZWIAZANE };

      mockPrisma.automationRule.findMany.mockResolvedValue([
        {
          id: "rule-1",
          triggerConfig: { type: "statusChanged", status: TicketStatus.ROZWIAZANE },
          actionConfig: { type: "assignUser", userId: "user-2" },
        },
      ]);
      mockPrisma.ticket.update.mockResolvedValue(updatedTicket);

      const event: TicketEvent = {
        type: "ticketUpdated",
        ticket: updatedTicket,
        previousTicket,
      };

      await evaluateAutomationRules(event);

      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: "ticket-1" },
        data: { assigneeUserId: "user-2" },
      });
    });

    it("does not execute rule when trigger does not match", async () => {
      mockPrisma.automationRule.findMany.mockResolvedValue([
        {
          id: "rule-1",
          triggerConfig: { type: "statusChanged", status: TicketStatus.ZAMKNIETE },
          actionConfig: { type: "setPriority", priority: TicketPriority.WYSOKI },
        },
      ]);

      const event: TicketEvent = {
        type: "ticketCreated",
        ticket: baseTicket,
      };

      await evaluateAutomationRules(event);

      expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
    });

    it("skips disabled rules", async () => {
      mockPrisma.automationRule.findMany.mockResolvedValue([]);

      const event: TicketEvent = {
        type: "ticketCreated",
        ticket: baseTicket,
      };

      await evaluateAutomationRules(event);

      expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
    });

    it("skips invalid rule configs", async () => {
      mockPrisma.automationRule.findMany.mockResolvedValue([
        {
          id: "rule-1",
          triggerConfig: { type: "invalid" },
          actionConfig: { type: "setPriority", priority: TicketPriority.WYSOKI },
        },
      ]);

      const event: TicketEvent = {
        type: "ticketCreated",
        ticket: baseTicket,
      };

      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await evaluateAutomationRules(event);

      expect(mockPrisma.ticket.update).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("executes addTag action", async () => {
      mockPrisma.automationRule.findMany.mockResolvedValue([
        {
          id: "rule-1",
          triggerConfig: { type: "ticketCreated" },
          actionConfig: { type: "addTag", tagId: "tag-1" },
        },
      ]);
      mockPrisma.ticketTag.upsert.mockResolvedValue({
        ticketId: "ticket-1",
        tagId: "tag-1",
      });

      const event: TicketEvent = {
        type: "ticketCreated",
        ticket: baseTicket,
      };

      await evaluateAutomationRules(event);

      expect(mockPrisma.ticketTag.upsert).toHaveBeenCalledWith({
        where: {
          ticketId_tagId: {
            ticketId: "ticket-1",
            tagId: "tag-1",
          },
        },
        create: {
          ticketId: "ticket-1",
          tagId: "tag-1",
        },
        update: {},
      });
    });
  });
});

