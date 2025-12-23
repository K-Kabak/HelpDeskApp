import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/teams/[id]/memberships - Add user to team
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
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
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify user exists and belongs to same organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: session.user.organizationId,
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
          teamId: params.id,
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
        teamId: params.id,
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
        adminId: session.user.id,
        action: "ADD_TEAM_MEMBER",
        entityType: "TEAM_MEMBERSHIP",
        entityId: membership.userId + ":" + membership.teamId,
        details: {
          teamId: params.id,
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
    return NextResponse.json({ error: "Failed to add team member" }, { status: 500 });
  }
}

// DELETE /api/admin/teams/[id]/memberships - Remove user from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
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
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Verify user exists and belongs to same organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: session.user.organizationId,
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
          teamId: params.id,
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
          teamId: params.id,
        },
      },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        adminId: session.user.id,
        action: "REMOVE_TEAM_MEMBER",
        entityType: "TEAM_MEMBERSHIP",
        entityId: userId + ":" + params.id,
        details: {
          teamId: params.id,
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
    return NextResponse.json({ error: "Failed to remove team member" }, { status: 500 });
  }
}
