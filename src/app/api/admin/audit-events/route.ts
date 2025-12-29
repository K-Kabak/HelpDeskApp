import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  resourceId: z.string().optional(),
  actorId: z.string().optional(),
});

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

async function assertAdmin() {
  const auth = await requireAuth();
  if (!auth.ok) return auth;
  if (auth.user.role !== "ADMIN") {
    return { ok: false as const, response: forbidden() };
  }
  return auth;
}

export async function GET(req: Request) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const parsedQuery = querySchema.safeParse(Object.fromEntries(url.searchParams.entries()));

  if (!parsedQuery.success) {
    return NextResponse.json({ error: parsedQuery.error.flatten() }, { status: 400 });
  }

  const { limit, offset, resourceId, actorId } = parsedQuery.data;
  const organizationId = auth.user.organizationId ?? "";

  const where = {
    organizationId,
    ...(resourceId ? { resourceId } : {}),
    ...(actorId ? { actorId } : {}),
  };

  const [events, total] = await Promise.all([
    prisma.adminAudit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.adminAudit.count({ where }),
  ]);

  return NextResponse.json({
    items: events.map((e) => ({
      id: e.id,
      action: e.action,
      resource: e.resource,
      resourceId: e.resourceId,
      actorId: e.actorId,
      actor: e.actor,
      data: e.data,
      createdAt: e.createdAt.toISOString(),
    })),
    page: {
      limit,
      offset,
      total,
    },
  });
}

