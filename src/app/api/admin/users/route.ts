import { requireAuth } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { hash } from "bcryptjs";
// Note: createUserSchema removed - validation done inline in POST method
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(255),
  role: z.enum(["REQUESTER", "AGENT", "ADMIN"]),
  password: z.string().min(8).max(255),
});

// GET /api/admin/users - List users for admin
export async function GET(req: Request) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/admin/users",
    method: req.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  if (auth.user.role !== "ADMIN") {
    logger.warn("admin.required");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rate = checkRateLimit(req, "admin:users:list", {
    logger,
    identifier: auth.user.id,
  });
  if (!rate.allowed) return rate.response;

  try {
    const users = await prisma.user.findMany({
      where: { organizationId: auth.user.organizationId ?? undefined },
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
      orderBy: { createdAt: "desc" },
    });

    const mappedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: !!user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      ticketCount: user._count.ticketsCreated,
      activeTicketCount: user._count.ticketsOwned,
    }));

    return NextResponse.json({ users: mappedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  const logger = createRequestLogger({
    route: "/api/admin/users",
    method: request.method,
    userId: auth.ok ? auth.user.id : undefined,
  });

  if (!auth.ok) {
    logger.warn("auth.required");
    return auth.response;
  }

  if (auth.user.role !== "ADMIN") {
    logger.warn("admin.required");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, name, role, password } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user - use unchecked input to avoid organization relation requirement
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role as Role,
        passwordHash,
        ...(auth.user.organizationId ? { organizationId: auth.user.organizationId } : {}),
        emailVerified: new Date(), // Auto-verify for admin-created users
      },
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
        actorId: auth.user.id,
        organizationId: auth.user.organizationId ?? "",
        resource: "USER",
        resourceId: user.id,
        action: "CREATE",
        data: { email: user.email, name: user.name, role: user.role },
      },
    });

    logger.info("user.create.success", { userId: user.id });

    return NextResponse.json({
      user: {
        ...user,
        emailVerified: !!user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    }, { status: 201 });
  } catch (error) {
    logger.error("user.create.error", { error });
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}