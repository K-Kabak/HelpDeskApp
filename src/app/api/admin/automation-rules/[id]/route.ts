import { prisma } from "@/lib/prisma";
import { recordAdminAudit } from "@/lib/admin-audit";
import { requireAuth } from "@/lib/authorization";
import { validateTriggerConfig, validateActionConfig } from "@/lib/automation-rules";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  enabled: z.boolean().optional(),
  triggerConfig: z.unknown().optional(),
  actionConfig: z.unknown().optional(),
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

async function getRule(id: string, organizationId: string) {
  const rule = await prisma.automationRule.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!rule) {
    return { ok: false as const, response: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  return { ok: true as const, rule };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const resolvedParams = await params;
  const orgId = auth.user.organizationId ?? "";
  const ruleCheck = await getRule(resolvedParams.id, orgId);
  if (!ruleCheck.ok) return ruleCheck.response;
  const existingRule = ruleCheck.rule;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Validate trigger and action configs if provided
  if (parsed.data.triggerConfig) {
    try {
      validateTriggerConfig(parsed.data.triggerConfig);
    } catch {
      return NextResponse.json(
        { error: { message: "Invalid trigger configuration" } },
        { status: 400 }
      );
    }
  }

  if (parsed.data.actionConfig) {
    try {
      validateActionConfig(parsed.data.actionConfig);
    } catch {
      return NextResponse.json(
        { error: { message: "Invalid action configuration" } },
        { status: 400 }
      );
    }
  }

  const updateData: Partial<{
    name: string;
    enabled: boolean;
    triggerConfig: Prisma.InputJsonValue;
    actionConfig: Prisma.InputJsonValue;
  }> = {
    ...(parsed.data.name !== undefined && { name: parsed.data.name }),
    ...(parsed.data.enabled !== undefined && { enabled: parsed.data.enabled }),
    ...(parsed.data.triggerConfig !== undefined && { triggerConfig: parsed.data.triggerConfig as Prisma.InputJsonValue }),
    ...(parsed.data.actionConfig !== undefined && { actionConfig: parsed.data.actionConfig as Prisma.InputJsonValue }),
  };

  const rule = await prisma.automationRule.update({
    where: { id: resolvedParams.id },
    data: updateData,
  });

  await recordAdminAudit({
    actorId: auth.user.id,
    organizationId: orgId,
    resource: "AUTOMATION_RULE",
    resourceId: rule.id,
    action: "UPDATE",
    data: {
      changes: {
        name: existingRule.name !== rule.name ? { from: existingRule.name, to: rule.name } : undefined,
        enabled: existingRule.enabled !== rule.enabled ? { from: existingRule.enabled, to: rule.enabled } : undefined,
        triggerConfig: JSON.stringify(existingRule.triggerConfig) !== JSON.stringify(rule.triggerConfig)
          ? { from: existingRule.triggerConfig, to: rule.triggerConfig }
          : undefined,
        actionConfig: JSON.stringify(existingRule.actionConfig) !== JSON.stringify(rule.actionConfig)
          ? { from: existingRule.actionConfig, to: rule.actionConfig }
          : undefined,
      },
    },
  });

  return NextResponse.json({ rule });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return auth.response;

  const resolvedParams = await params;
  const orgId = auth.user.organizationId ?? "";
  const ruleCheck = await getRule(resolvedParams.id, orgId);
  if (!ruleCheck.ok) return ruleCheck.response;
  const rule = ruleCheck.rule;

  await prisma.automationRule.delete({
    where: { id: resolvedParams.id },
  });

  await recordAdminAudit({
    actorId: auth.user.id,
    organizationId: orgId,
    resource: "AUTOMATION_RULE",
    resourceId: rule.id,
    action: "DELETE",
    data: {
      name: rule.name,
      triggerConfig: rule.triggerConfig,
      actionConfig: rule.actionConfig,
    },
  });

  return NextResponse.json({ success: true });
}
