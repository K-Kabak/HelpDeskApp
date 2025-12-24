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

const updateViewSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  filters: filterSchema.optional(),
  isShared: z.boolean().optional(),
});

/**
 * PATCH /api/views/[id]
 * 
 * Updates a saved view.
 * 
 * Authorization:
 * - User can only update their own views
 * - Views are scoped to user's organization
 * 
 * Validation:
 * - Name must be 1-50 characters if provided
 * - Filters must be valid filter structure if provided
 * - Prevents duplicate names per user
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/views/[id]",
    method: "PATCH",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  if (!auth.user.organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 403 });
  }

  // Fetch view and verify ownership
  const view = await prisma.savedView.findUnique({
    where: { id },
  });

  if (!view || view.userId !== auth.user.id || view.organizationId !== auth.user.organizationId) {
    return NextResponse.json({ error: "View not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateViewSchema.safeParse(body);
  if (!parsed.success) {
    logger.warn("views.update.validation_failed");
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Check for duplicate name if name is being updated
  if (parsed.data.name && parsed.data.name !== view.name) {
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
  }

  const updateData: Prisma.SavedViewUpdateInput = {};
  if (parsed.data.name !== undefined) {
    updateData.name = parsed.data.name;
  }
  if (parsed.data.filters !== undefined) {
    updateData.filters = parsed.data.filters as Prisma.InputJsonValue;
  }
  if (parsed.data.isShared !== undefined) {
    updateData.isShared = parsed.data.isShared;
  }

  const updatedView = await prisma.savedView.update({
    where: { id },
    data: updateData,
  });

  logger.info("views.update.success", {
    viewId: updatedView.id,
  });

  return NextResponse.json({ view: updatedView });
}

/**
 * DELETE /api/views/[id]
 * 
 * Deletes a saved view.
 * 
 * Authorization:
 * - User can only delete their own views
 * - Views are scoped to user's organization
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/views/[id]",
    method: "DELETE",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  if (!auth.user.organizationId) {
    return NextResponse.json({ error: "User has no organization" }, { status: 403 });
  }

  // Fetch view and verify ownership
  const view = await prisma.savedView.findUnique({
    where: { id },
  });

  if (!view || view.userId !== auth.user.id || view.organizationId !== auth.user.organizationId) {
    return NextResponse.json({ error: "View not found" }, { status: 404 });
  }

  await prisma.savedView.delete({
    where: { id },
  });

  logger.info("views.delete.success", {
    viewId: id,
  });

  return NextResponse.json({ success: true });
}

