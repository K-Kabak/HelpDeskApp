import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

type SessionWithUser = Session & {
  user: {
    id: string;
    role: string;
    organizationId?: string;
    name?: string | null;
    email?: string | null;
  };
};

export type AuthenticatedUser = {
  id: string;
  role: string;
  organizationId?: string | null;
};

type AuthResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; response: NextResponse };

/**
 * Fetches the current session and returns a normalized user or an auth error response.
 */
export async function requireAuth(): Promise<AuthResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (await getServerSession(authOptions as any)) as SessionWithUser | null;

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // SECURITY: Validate required user fields and role
  const role = session.user.role;
  if (!role || typeof role !== "string" || !["REQUESTER", "AGENT", "ADMIN"].includes(role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid user role" }, { status: 401 }),
    };
  }

  const user: AuthenticatedUser = {
    id: session.user.id,
    role,
    organizationId: session.user.organizationId,
  };

  return { ok: true, user };
}

/**
 * Returns a Prisma where clause enforcing requester vs organization scope.
 */
export function ticketScope(user: AuthenticatedUser) {
  if (user.role === "REQUESTER") {
    return { requesterId: user.id };
  }

  // SECURITY: Ensure organization scoping is always enforced for non-requester roles
  if (!user.organizationId) {
    // If user has no organization, they should not see any tickets
    return { id: null }; // This will result in no matches
  }

  return { organizationId: user.organizationId };
}

export function isAgentOrAdmin(user: AuthenticatedUser) {
  return user.role === "AGENT" || user.role === "ADMIN";
}

export function isSameOrganization(user: AuthenticatedUser, organizationId: string) {
  // SECURITY: Strict validation - both values must exist and match exactly
  return user.organizationId !== null &&
         user.organizationId !== undefined &&
         user.organizationId === organizationId;
}
