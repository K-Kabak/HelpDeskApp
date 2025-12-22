import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { TicketPriority } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  priority: z.nativeEnum(TicketPriority),
  categoryId: z.string().trim().min(1).nullable().optional(),
  firstResponseHours: z.coerce.number().int().positive(),
  resolveHours: z.coerce.number().int().positive(),
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

async function validateCategory(categoryId: string | null | undefined, organizationId: string) {
  if (!categoryId) return { ok: true as const, categoryId: null };

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, organizationId: true },
  });

  if (!category || category.organizationId !== organizationId) {
    return { ok: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  return { ok: true as const, categoryId: category.id };
}

async function ensureNoDuplicate(organizationId: string, priority: TicketPriority, categoryId: string | null) {
  const existing = await prisma.slaPolicy.findFirst({
    where: {
      organizationId,
      priority,
      categoryId,
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Policy already exists for this priority/category" }, { status: 409 });
  }

  return null;
}

export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const policies = await prisma.slaPolicy.findMany({
    where: { organizationId: auth.user.organizationId ?? "" },
    orderBy: [{ priority: "asc" }, { categoryId: "asc" }],
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ policies });
}

export async function POST(req: Request) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orgId = auth.user.organizationId ?? "";
  const categoryCheck = await validateCategory(parsed.data.categoryId, orgId);
  if (!categoryCheck.ok) return categoryCheck.response;
  const categoryId = categoryCheck.categoryId;

  const duplicate = await ensureNoDuplicate(orgId, parsed.data.priority, categoryId);
  if (duplicate) return duplicate;

  const policy = await prisma.slaPolicy.create({
    data: {
      organizationId: orgId,
      priority: parsed.data.priority,
      categoryId,
      firstResponseHours: parsed.data.firstResponseHours,
      resolveHours: parsed.data.resolveHours,
    },
    include: {
      category: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ policy }, { status: 201 });
}
