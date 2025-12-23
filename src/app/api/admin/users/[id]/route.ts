import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { Role, Prisma } from "@prisma/client";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";

// GET /api/admin/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ticketsCreated: true,
            ticketsOwned: {
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: !!user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        ticketCount: user._count.ticketsCreated,
        activeTicketCount: user._count.ticketsOwned,
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, name, role, password } = body;

    // Validation
    if (role && !["REQUESTER", "AGENT", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (password && password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check if user exists and belongs to admin's organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: Prisma.UserUpdateInput = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role as Role;
    if (password) updateData.passwordHash = await hash(password, 12);

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        adminId: session.user.id,
        action: "UPDATE_USER",
        entityType: "USER",
        entityId: user.id,
        details: { email: user.email, name: user.name, role: user.role },
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        emailVerified: !!user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user exists and belongs to admin's organization
    const existingUser = await prisma.user.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
      include: {
        _count: {
          select: {
            ticketsOwned: {
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

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting users with active tickets
    if (existingUser._count.ticketsOwned > 0) {
      return NextResponse.json({
        error: "Cannot delete user with active tickets. Please reassign or close all tickets first."
      }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (existingUser.id === session.user.id) {
      return NextResponse.json({
        error: "Cannot delete your own account"
      }, { status: 400 });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: params.id },
    });

    // Log admin action
    await prisma.adminAudit.create({
      data: {
        adminId: session.user.id,
        action: "DELETE_USER",
        entityType: "USER",
        entityId: params.id,
        details: { email: existingUser.email, name: existingUser.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}