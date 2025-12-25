import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { createRequestLogger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TicketStatus, TicketPriority } from "@prisma/client";
import { Prisma } from "@prisma/client";

const filterSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

const createViewSchema = z.object({
  name: z.string().min(1).max(50),
  filters: filterSchema,
  isShared: z.boolean().optional().default(false),
});

const updateViewSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  filters: filterSchema.optional(),
  isShared: z.boolean().optional(),
});

/**
 * GET /api/views
 * 
 * Lists saved views for the authenticated user.
 * 
 * Authorization:
 * - Returns user's own views (and shared views if implemented)
 * - All views scoped to user's organization
 */
export async function GET() {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/views",
    method: "GET",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  if (!auth.user.organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 403 });
  }

  const views = await prisma.savedView.findMany({
    where: {
      userId: auth.user.id,
      organizationId: auth.user.organizationId,
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  logger.info("views.list.success", {
    count: views.length,
  });

  return NextResponse.json({ views });
}

/**
 * POST /api/views
 * 
 * Creates a new saved view for the authenticated user.
 * 
 * Authorization:
 * - User can only create views for themselves
 * - Views are scoped to user's organization
 * 
 * Validation:
 * - Name required (1-50 characters)
 * - Filters must be valid filter structure
 * - Prevents duplicate names per user
 */
export async function POST(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/views",
    method: "POST",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  if (!auth.user.organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createViewSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("views.create.validation_failed");
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Check for duplicate name
  const existing = await prisma.savedView.findUnique({
    where: {
      userId_name: {
        userId: auth.user.id,
        name: parsed.data.name,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A view with this name already exists" },
      { status: 400 }
    );
  }

  const view = await prisma.savedView.create({
    data: {
      userId: auth.user.id,
      organizationId: auth.user.organizationId,
      name: parsed.data.name,
      filters: parsed.data.filters as Prisma.InputJsonValue,
      isShared: parsed.data.isShared ?? false,
      isDefault: false,
    },
  });

  logger.info("views.create.success", {
    viewId: view.id,
    name: view.name,
  });

  return NextResponse.json({ view });
}

