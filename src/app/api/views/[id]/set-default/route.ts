import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { createRequestLogger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * POST /api/views/[id]/set-default
 * 
 * Sets a saved view as the default view for the user.
 * 
 * Authorization:
 * - User can only set their own views as default
 * - Views are scoped to user's organization
 * 
 * Business logic:
 * - Unsets all other default views for the user
 * - Sets the specified view as default
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/views/[id]/set-default",
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

  // Fetch view and verify ownership
  const view = await prisma.savedView.findUnique({
    where: { id },
  });

  if (!view || view.userId !== auth.user.id || view.organizationId !== auth.user.organizationId) {
    return NextResponse.json({ error: "View not found" }, { status: 404 });
  }

  // Unset all default views for the user, then set this one as default
  await prisma.$transaction([
    prisma.savedView.updateMany({
      where: {
        userId: auth.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    }),
    prisma.savedView.update({
      where: { id },
      data: {
        isDefault: true,
      },
    }),
  ]);

  logger.info("views.set_default.success", {
    viewId: id,
  });

  return NextResponse.json({ success: true });
}

