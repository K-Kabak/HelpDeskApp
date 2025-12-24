import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { sanitizeMarkdown } from "@/lib/sanitize";
import { getTicketPage } from "@/lib/ticket-list";
import { findSlaPolicyForTicket } from "@/lib/sla-policy";
import { computeSlaDueDates } from "@/lib/sla-preview";
import { scheduleSlaJobsForTicket } from "@/lib/sla-scheduler";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TicketPriority, TicketStatus } from "@prisma/client";

const createSchema = z.object({
  title: z.string().min(3),
  descriptionMd: z.string().min(3),
  priority: z.nativeEnum(TicketPriority),
  category: z.string().optional(),
});

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional(),
  cursor: z.string().optional(),
  direction: z.enum(["next", "prev"]).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  q: z.string().optional(),
});

/**
 * GET /api/tickets
 * 
 * Retrieves a paginated list of tickets with optional filtering.
 * 
 * Authorization:
 * - REQUESTER: Returns only tickets created by the user
 * - AGENT/ADMIN: Returns tickets within the user's organization
 * 
 * Supports cursor-based pagination and filtering by status, priority, and search query.
 */
export async function GET(req?: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/tickets",
    method: req?.method ?? "GET",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  const url = req ? new URL(req.url) : null;
  const parsedQuery = url
    ? querySchema.safeParse(Object.fromEntries(url.searchParams.entries()))
    : { success: true as const, data: {} };

  if (!parsedQuery.success) {
    return NextResponse.json({ error: parsedQuery.error.flatten() }, { status: 400 });
  }

  const { limit, cursor, direction, status, priority, q } = parsedQuery.data;

  const page = await getTicketPage(auth.user, {
    limit,
    cursor,
    direction,
    status,
    priority,
    search: q?.trim() || undefined,
  });

  logger.info("tickets.list.success", {
    count: page.tickets.length,
    role: auth.user.role,
  });

  return NextResponse.json(page);
}

/**
 * POST /api/tickets
 * 
 * Creates a new ticket with automatic SLA calculation and job scheduling.
 * 
 * Business logic:
 * - Sanitizes markdown content to prevent XSS
 * - Finds applicable SLA policy based on priority and category
 * - Calculates first response and resolution due dates
 * - Schedules SLA breach detection jobs
 * - Creates audit event for ticket creation
 * 
 * Requires: title (min 3 chars), descriptionMd (min 3 chars), priority.
 */
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

  const rate = checkRateLimit(req, "tickets:create", {
    logger,
    identifier: auth.ok ? auth.user.id : undefined,
  });
  if (!rate.allowed) return rate.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("tickets.create.validation_failed");
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sanitizedDescription = sanitizeMarkdown(parsed.data.descriptionMd);
  const sla = await findSlaPolicyForTicket(
    auth.user.organizationId ?? "",
    parsed.data.priority,
    parsed.data.category,
  );
  const { firstResponseDue, resolveDue } = computeSlaDueDates(sla);

  const ticket = await prisma.ticket.create({
    data: {
      title: parsed.data.title,
      descriptionMd: sanitizedDescription,
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

  await scheduleSlaJobsForTicket({
    id: ticket.id,
    organizationId: ticket.organizationId,
    priority: ticket.priority,
    requesterId: ticket.requesterId,
    firstResponseDue: ticket.firstResponseDue,
    resolveDue: ticket.resolveDue,
  });

  const { evaluateAutomationRules } = await import("@/lib/automation-rules");
  await evaluateAutomationRules({
    type: "ticketCreated",
    ticket,
  });

  return NextResponse.json({ ticket });
}
