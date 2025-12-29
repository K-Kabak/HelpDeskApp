import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import type { SessionWithUser } from "@/lib/session-types";

// POST /api/admin/teams/[id]/memberships - Add user to team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Verify team exists and belongs to admin's organization
    const team = await prisma.team.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organizationId ?? undefined,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify user exists and belongs to same organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: session.user.organizationId ?? undefined,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a member of this team
    const existingMembership = await prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: resolvedParams.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 });
    }

    // Add user to team
    const membership = await prisma.teamMembership.create({
      data: {
        userId,
        teamId: resolvedParams.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        actorId: session.user.id,
        organizationId: session.user.organizationId ?? "",
        resource: "TEAM",
        resourceId: resolvedParams.id,
        action: "UPDATE",
        data: {
          action: "ADD_TEAM_MEMBER",
          teamId: resolvedParams.id,
          teamName: team.name,
          userId: membership.userId,
          userName: membership.user.name,
          userEmail: membership.user.email,
        },
      },
    });

    return NextResponse.json({
      membership: {
        userId: membership.userId,
        teamId: membership.teamId,
        assignedAt: membership.assignedAt.toISOString(),
        user: {
          id: membership.user.id,
          name: membership.user.name,
          email: membership.user.email,
          role: membership.user.role,
        },
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/teams/[id]/memberships - Remove user from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Verify team exists and belongs to admin's organization
    const team = await prisma.team.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organizationId ?? undefined,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify user exists and belongs to same organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: session.user.organizationId ?? undefined,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if membership exists
    const membership = await prisma.teamMembership.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId: resolvedParams.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "User is not a member of this team" }, { status: 400 });
    }

    // Remove user from team
    await prisma.teamMembership.delete({
      where: {
        userId_teamId: {
          userId,
          teamId: resolvedParams.id,
        },
      },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        actorId: session.user.id,
        organizationId: session.user.organizationId ?? "",
        resource: "TEAM",
        resourceId: resolvedParams.id,
        action: "UPDATE",
        data: {
          action: "REMOVE_TEAM_MEMBER",
          teamId: resolvedParams.id,
          teamName: team.name,
          userId,
          userName: user.name,
          userEmail: user.email,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
