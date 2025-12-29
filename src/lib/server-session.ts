import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import type { SessionWithUser } from "@/lib/session-types";

const serverSessionOptions = authOptions as Parameters<typeof getServerSession>[0];

export async function getAppServerSession() {
  return (await getServerSession(serverSessionOptions)) as SessionWithUser | null;
}


