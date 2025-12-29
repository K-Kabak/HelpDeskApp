import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import type { SessionWithUser } from "@/lib/session-types";

export async function getAppServerSession() {
  return (await getServerSession(authOptions)) as SessionWithUser | null;
}

