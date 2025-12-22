import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const categories = await prisma.category.findMany({
    where: { organizationId: auth.user.organizationId ?? "" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true },
  });

  return NextResponse.json({ categories });
}
