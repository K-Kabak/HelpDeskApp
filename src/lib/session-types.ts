import type { Session } from "next-auth";

export type UserRole = "REQUESTER" | "AGENT" | "ADMIN";

/**
 * SessionWithUser refines NextAuth's Session to guarantee the stored user
 * includes the Prisma-backed identity fields we rely on throughout the app.
 */
export type SessionWithUser = Omit<Session, "user"> & {
  user: Session["user"] & {
    id: string;
    role: UserRole;
    organizationId: string;
  };
};

