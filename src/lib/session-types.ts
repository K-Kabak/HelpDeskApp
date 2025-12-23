import type { Session } from "next-auth";

export type SessionWithUser = Session & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string;
    organizationId?: string | null;
  };
};

