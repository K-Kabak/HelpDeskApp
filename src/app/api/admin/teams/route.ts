import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authorization";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createRequestLogger } from "@/lib/logger";

// GET /api/admin/teams - List teams for admin
export async function GET(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/admin/teams",
    method: "GET",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok || auth.user.role !== "ADMIN") {
    logger.warn("admin.required");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit(req, "admin:teams:list", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  try {
    const teams = await prisma.team.findMany({
      where: { organizationId: auth.user.organizationId ?? undefined },
      include: {
        _count: {
          select: {
            memberships: true,
            tickets: {
              where: {
                status: {
                  notIn: ["ROZWIAZANE", "ZAMKNIETE"]
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedTeams = teams.map(team => ({
      id: team.id,
      name: team.name,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      memberCount: team._count.memberships,
      activeTicketCount: team._count.tickets,
    }));

    return NextResponse.json({ teams: mappedTeams });
  } catch (error) {
    logger.error("teams.list.error", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/teams - Create new team
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/admin/teams",
    method: "POST",
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok || auth.user.role !== "ADMIN") {
    logger.warn("admin.required");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit(request, "admin:teams:create", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  try {
    const body = await request.json();
    const { name } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      return NextResponse.json({ error: "Team name must be less than 100 characters" }, { status: 400 });
    }

    // Check if team name already exists in organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        name: trimmedName,
        organizationId: auth.user.organizationId ?? undefined,
      },
    });

    if (existingTeam) {
      return NextResponse.json({ error: "Team name already exists" }, { status: 400 });
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name: trimmedName,
        organizationId: auth.user.organizationId!,
      },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        actorId: auth.user.id,
        organizationId: auth.user.organizationId ?? "",
        resource: "TEAM",
        resourceId: team.id,
        action: "CREATE",
        data: { name: team.name },
      },
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
        memberCount: 0,
        activeTicketCount: 0,
      }
    }, { status: 201 });
  } catch (error) {
    logger.error("team.create.error", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}