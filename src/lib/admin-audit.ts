import { prisma } from "@/lib/prisma";

export type AdminAuditResource = "USER" | "TEAM" | "TAG" | "SLA" | "AUTOMATION_RULE";
export type AdminAuditAction = "CREATE" | "UPDATE" | "DELETE";

export type RecordAdminAuditInput = {
  actorId: string;
  organizationId: string;
  resource: AdminAuditResource;
  resourceId: string;
  action: AdminAuditAction;
  data?: Record<string, unknown> | null;
  client?: typeof prisma;
};

export async function recordAdminAudit({
  actorId,
  organizationId,
  resource,
  resourceId,
  action,
  data,
  client = prisma,
}: RecordAdminAuditInput) {
  await client.adminAudit.create({
    data: {
      actorId,
      organizationId,
      resource,
      resourceId,
      action,
      data: data ? (data as any) : undefined,
    },
  });
}
