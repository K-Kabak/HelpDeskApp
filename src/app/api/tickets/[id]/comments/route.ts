import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { getServerSession } from "next-auth";
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
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logger = createRequestLogger({
    route: `/api/tickets/${params.id}/comments`,
    method: req.method,
    userId: session.user.id,
  });

  const rate = checkRateLimit(req, "comments:create", {
    logger,
    identifier: session.user.id,
  });
  if (!rate.allowed) return rate.response;

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
  });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ticket.organizationId !== session.user.organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isRequester = ticket.requesterId === session.user.id;
  const isAgent = session.user.role === "AGENT" || session.user.role === "ADMIN";
  if (parsed.data.isInternal && !isAgent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!parsed.data.isInternal && !isRequester && !isAgent) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment = await prisma.comment.create({
    data: {
      ticketId: ticket.id,
      authorId: session.user.id,
      isInternal: parsed.data.isInternal,
      bodyMd: parsed.data.bodyMd,
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
