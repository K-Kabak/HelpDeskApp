import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import type { SessionWithUser } from "@/lib/session-types";

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
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;

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
 * Returns a Prisma where clause enforcing role-based ticket access scope.
 * 
 * - REQUESTER role: Returns only tickets created by the user (requesterId filter)
 * - AGENT/ADMIN roles: Returns tickets within the user's organization (organizationId filter)
 * 
 * SECURITY: If user has no organizationId, returns a filter that matches nothing
 * to prevent unauthorized access.
 * 
 * @param user - Authenticated user with role and organization context
 * @returns Prisma where clause for ticket filtering
 */
export function ticketScope(user: AuthenticatedUser) {
  if (user.role === "REQUESTER") {
    return { requesterId: user.id };
  }

  // SECURITY: Ensure organization scoping is always enforced for non-requester roles
  if (!user.organizationId) {
    // If user has no organization, they should not see any tickets
    // Return a filter that matches nothing (empty array for 'in' operator)
    return { id: { in: [] } };
  }

  return { organizationId: user.organizationId };
}

/**
 * Checks if user has agent or admin role.
 * 
 * @param user - Authenticated user
 * @returns True if user is AGENT or ADMIN, false otherwise
 */
export function isAgentOrAdmin(user: AuthenticatedUser) {
  return user.role === "AGENT" || user.role === "ADMIN";
}

/**
 * Validates that user belongs to the specified organization.
 * 
 * SECURITY: Performs strict validation - both values must exist and match exactly.
 * Used to prevent cross-organization access.
 * 
 * @param user - Authenticated user
 * @param organizationId - Organization ID to check against
 * @returns True if user belongs to the organization, false otherwise
 */
export function isSameOrganization(user: AuthenticatedUser, organizationId: string) {
  // SECURITY: Strict validation - both values must exist and match exactly
  return user.organizationId !== null &&
         user.organizationId !== undefined &&
         user.organizationId === organizationId;
}
