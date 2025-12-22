import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { sanitizeMarkdown } from "@/lib/sanitize";
import {
  isAgentOrAdmin,
  isSameOrganization,
  requireAuth,
} from "@/lib/authorization";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  bodyMd: z.string().min(1),
  isInternal: z.boolean().default(false),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: `/api/tickets/${params.id}/comments`,
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  const rate = checkRateLimit(req, "comments:create", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    select: { id: true, requesterId: true, organizationId: true, firstResponseAt: true },
  });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isSameOrganization(auth.user, ticket.organizationId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isRequester = ticket.requesterId === auth.user.id;
  const isAgent = isAgentOrAdmin(auth.user);
  if (parsed.data.isInternal && !isAgent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!parsed.data.isInternal && !isRequester && !isAgent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sanitizedBody = sanitizeMarkdown(parsed.data.bodyMd);

  const comment = await prisma.comment.create({
    data: {
      ticketId: ticket.id,
      authorId: auth.user.id,
      isInternal: parsed.data.isInternal,
      bodyMd: sanitizedBody,
    },
  });

  // mark first response if from agent and not internal? Use public
  if (!ticket.firstResponseAt && !parsed.data.isInternal && isAgent) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { firstResponseAt: new Date() },
    });
  }

  return NextResponse.json({ comment });
}
