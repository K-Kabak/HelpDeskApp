import type { Session } from "next-auth";

/**
 * SessionWithUser is an alias for Session that ensures the user object
 * has the required fields (id, role, organizationId) as defined in
 * the NextAuth type augmentation.
 * 
 * Since NextAuth types are augmented in src/types/next-auth.d.ts,
 * the Session type already includes these fields, so this is primarily
 * for documentation and type clarity.
 */
export type SessionWithUser = Session;

