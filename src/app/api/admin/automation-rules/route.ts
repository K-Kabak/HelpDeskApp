import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/admin-audit";
import { requireAuth } from "@/lib/authorization";
import { validateTriggerConfig, validateActionConfig } from "@/lib/automation-rules";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  triggerConfig: z.unknown(),
  actionConfig: z.unknown(),
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

export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const rules = await prisma.automationRule.findMany({
    where: { organizationId: auth.user.organizationId ?? "" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ rules });
}

export async function POST(req: Request) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Validate trigger and action configs
  try {
    validateTriggerConfig(parsed.data.triggerConfig);
    validateActionConfig(parsed.data.actionConfig);
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid trigger or action configuration" } },
      { status: 400 }
    );
  }

  const orgId = auth.user.organizationId ?? "";

  const rule = await prisma.automationRule.create({
    data: {
      organizationId: orgId,
      name: parsed.data.name,
      triggerConfig: parsed.data.triggerConfig,
      actionConfig: parsed.data.actionConfig,
    },
  });

  await recordAdminAudit({
    actorId: auth.user.id,
    organizationId: orgId,
    resource: "AUTOMATION_RULE",
    resourceId: rule.id,
    action: "CREATE",
    data: {
      name: rule.name,
      triggerConfig: rule.triggerConfig,
      actionConfig: rule.actionConfig,
    },
  });

  return NextResponse.json({ rule }, { status: 201 });
}
