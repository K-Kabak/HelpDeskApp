import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user: AuthenticatedUser = {
    id: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };

  return { ok: true, user };
}

/**
 * Returns a Prisma where clause enforcing requester vs organization scope.
 */
export function ticketScope(user: AuthenticatedUser) {
  return user.role === "REQUESTER"
    ? { requesterId: user.id }
    : { organizationId: user.organizationId ?? undefined };
}

export function isAgentOrAdmin(user: AuthenticatedUser) {
  return user.role === "AGENT" || user.role === "ADMIN";
}

export function isSameOrganization(user: AuthenticatedUser, organizationId: string) {
  return Boolean(user.organizationId) && user.organizationId === organizationId;
}
