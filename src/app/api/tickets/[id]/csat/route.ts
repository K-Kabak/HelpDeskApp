import { prisma } from "@/lib/prisma";
import { createRequestLogger } from "@/lib/logger";
import { isSameOrganization, requireAuth } from "@/lib/authorization";
import { validateCsatToken } from "@/lib/csat-token";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  token: z.string().optional(), // Token can be provided in body or query param
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logger = createRequestLogger({
    route: `/api/tickets/${id}/csat`,
    method: req.method,
  });

  // Get token from query params or body
  const url = new URL(req.url);
  const tokenFromQuery = url.searchParams.get("token");
  
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const token = parsed.data.token || tokenFromQuery;
  
  // SECURITY: Token-based authentication (preferred) or session-based fallback
  if (token) {
    // Validate token
    const tokenData = validateCsatToken(token);
    if (!tokenData) {
      logger.warn("csat.token.invalid");
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // Verify token matches ticket ID
    if (tokenData.ticketId !== id) {
      logger.warn("csat.token.mismatch", { tokenTicketId: tokenData.ticketId, requestedTicketId: id });
      return NextResponse.json({ error: "Token does not match ticket" }, { status: 403 });
    }

    // Verify token exists in database and hasn't been used
    const csatRequest = await prisma.csatRequest.findUnique({
      where: { token },
      include: {
        ticket: {
          select: { id: true, requesterId: true, organizationId: true },
        },
      },
    });

    if (!csatRequest) {
      logger.warn("csat.request.not_found");
      return NextResponse.json({ error: "CSAT request not found" }, { status: 404 });
    }

    // Check if token has expired (double-check)
    if (csatRequest.expiresAt < new Date()) {
      logger.warn("csat.token.expired");
      return NextResponse.json({ error: "Token has expired" }, { status: 401 });
    }

    // Check if response already submitted
    const existingResponse = await prisma.csatResponse.findUnique({
      where: { ticketId: csatRequest.ticketId },
    });
    if (existingResponse) {
      return NextResponse.json({ error: "CSAT response already submitted" }, { status: 409 });
    }

    // Create response using token
    const response = await prisma.csatResponse.create({
      data: {
        ticketId: csatRequest.ticketId,
        score: parsed.data.score,
        comment: parsed.data.comment,
      },
    });

    logger.info("csat.response.created", { 
      ticketId: csatRequest.ticketId, 
      score: response.score,
      method: "token",
    });
    return NextResponse.json({ response });
  } else {
    // Fallback to session-based authentication (for backward compatibility)
    const auth = await requireAuth();
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

    const response = await prisma.csatResponse.create({
      data: {
        ticketId: ticket.id,
        score: parsed.data.score,
        comment: parsed.data.comment,
      },
    });

    logger.info("csat.response.created", { 
      ticketId: ticket.id, 
      score: response.score,
      method: "session",
    });
    return NextResponse.json({ response });
  }
}

