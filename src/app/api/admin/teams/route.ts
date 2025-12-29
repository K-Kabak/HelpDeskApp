import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import type { SessionWithUser } from "@/lib/session-types";

// GET /api/admin/teams - List teams for admin
export async function GET() {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await prisma.team.findMany({
      where: { organizationId: session.user.organizationId ?? undefined },
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
    console.error("Error fetching teams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/teams - Create new team
export async function POST(request: NextRequest) {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
        organizationId: session.user.organizationId ?? undefined,
      },
    });

    if (existingTeam) {
      return NextResponse.json({ error: "Team name already exists" }, { status: 400 });
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name: trimmedName,
        organizationId: session.user.organizationId!,
      },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        actorId: session.user.id,
        organizationId: session.user.organizationId ?? "",
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
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}