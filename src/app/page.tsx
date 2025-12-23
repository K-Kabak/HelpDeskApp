import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import type { SessionWithUser } from "@/lib/session-types";

export default async function Home() {
  const session = (await getServerSession(authOptions)) as SessionWithUser | null;
  if (!session) {
    redirect("/login");
  }
  redirect("/app");
}
