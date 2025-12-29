import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import type { SessionWithUser } from "@/lib/session-types";

// GET /api/admin/teams/[id] - Get specific team with members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const team = await prisma.team.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organizationId ?? undefined,
      },
      include: {
        memberships: {
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
          orderBy: { assignedAt: "desc" },
        },
        _count: {
          select: {
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
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const members = team.memberships.map(membership => ({
      id: membership.user.id,
      name: membership.user.name,
      email: membership.user.email,
      role: membership.user.role,
      assignedAt: membership.assignedAt.toISOString(),
    }));

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
        memberCount: team.memberships.length,
        activeTicketCount: team._count.tickets,
        members,
      }
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/teams/[id] - Update team
export async function PATCH(
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
    const { name } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      return NextResponse.json({ error: "Team name must be less than 100 characters" }, { status: 400 });
    }

    // Check if team exists and belongs to admin's organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organizationId ?? undefined,
      },
    });

    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if name is already taken by another team
    if (trimmedName !== existingTeam.name) {
      const nameExists = await prisma.team.findFirst({
        where: {
          name: trimmedName,
          organizationId: session.user.organizationId ?? undefined,
          id: { not: resolvedParams.id },
        },
      });

      if (nameExists) {
        return NextResponse.json({ error: "Team name already exists" }, { status: 400 });
      }
    }

    // Update team
    const team = await prisma.team.update({
      where: { id: resolvedParams.id },
      data: { name: trimmedName },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        actorId: session.user.id,
        organizationId: session.user.organizationId ?? "",
        resource: "TEAM",
        resourceId: team.id,
        action: "UPDATE",
        data: { name: team.name },
      },
    });

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/teams/[id] - Delete team
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
    // Check if team exists and belongs to admin's organization
    const existingTeam = await prisma.team.findFirst({
      where: {
        id: resolvedParams.id,
        organizationId: session.user.organizationId ?? undefined,
      },
      include: {
        _count: {
          select: {
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
    });

    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Prevent deleting teams with active tickets
    if (existingTeam._count.tickets > 0) {
      return NextResponse.json({
        error: "Cannot delete team with active tickets. Please reassign or close all tickets first."
      }, { status: 400 });
    }

    // Delete team (cascade will handle memberships)
    await prisma.team.delete({
      where: { id: resolvedParams.id },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        actorId: session.user.id,
        organizationId: session.user.organizationId ?? "",
        resource: "TEAM",
        resourceId: resolvedParams.id,
        action: "DELETE",
        data: { name: existingTeam.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}