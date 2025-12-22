import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { TicketPriority, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z
  .object({
    priority: z.nativeEnum(TicketPriority).optional(),
    categoryId: z.string().trim().min(1).nullable().optional(),
    firstResponseHours: z.coerce.number().int().positive().optional(),
    resolveHours: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) =>
      data.priority !== undefined ||
      data.categoryId !== undefined ||
      data.firstResponseHours !== undefined ||
      data.resolveHours !== undefined,
    { message: "No updates provided" }
  );

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

async function validateCategory(categoryId: string | null | undefined, organizationId: string) {
  if (categoryId === undefined) return { ok: true as const, categoryId: undefined };
  if (categoryId === null) return { ok: true as const, categoryId: null };

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, organizationId: true },
  });

  if (!category || category.organizationId !== organizationId) {
    return { ok: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  return { ok: true as const, categoryId: category.id };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const policy = await prisma.slaPolicy.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      organizationId: true,
      priority: true,
      categoryId: true,
    },
  });

  if (!policy || policy.organizationId !== (auth.user.organizationId ?? "")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const categoryCheck = await validateCategory(parsed.data.categoryId, policy.organizationId);
  if (!categoryCheck.ok) return categoryCheck.response;
  const nextCategoryId = categoryCheck.categoryId ?? policy.categoryId;
  const nextPriority = parsed.data.priority ?? policy.priority;

  const duplicate = await prisma.slaPolicy.findFirst({
    where: {
      organizationId: policy.organizationId,
      priority: nextPriority,
      categoryId: nextCategoryId ?? null,
      NOT: { id: policy.id },
    },
  });
  if (duplicate) {
    return NextResponse.json({ error: "Policy already exists for this priority/category" }, { status: 409 });
  }

  const updateData: Prisma.SlaPolicyUpdateInput = {};
  if (parsed.data.priority !== undefined) {
    updateData.priority = parsed.data.priority;
  }
  if (parsed.data.categoryId !== undefined) {
    updateData.categoryId = parsed.data.categoryId;
  }
  if (parsed.data.firstResponseHours !== undefined) {
    updateData.firstResponseHours = parsed.data.firstResponseHours;
  }
  if (parsed.data.resolveHours !== undefined) {
    updateData.resolveHours = parsed.data.resolveHours;
  }

  const updated = await prisma.slaPolicy.update({
    where: { id: policy.id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ policy: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const policy = await prisma.slaPolicy.findUnique({
    where: { id: params.id },
    select: { id: true, organizationId: true },
  });

  if (!policy || policy.organizationId !== (auth.user.organizationId ?? "")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.slaPolicy.delete({ where: { id: policy.id } });
  return NextResponse.json({ ok: true });
}
