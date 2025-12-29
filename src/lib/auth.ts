import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcrypt";
import { createHash } from "crypto";
import { prisma } from "./prisma";
import { createRequestLogger } from "./logger";
import type { AdapterUser } from "next-auth/adapters";

type AppUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organizationId: string;
};

type AppToken = JWT & {
  role?: string;
  organizationId?: string;
};

function hashIdentifier(value?: string) {
  if (!value) return undefined;
  return createHash("sha256").update(value.toLowerCase()).digest("hex");
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Hasło", type: "password" },
      },
    async authorize(credentials) {
      const logger = createRequestLogger({
        route: "/api/auth/credentials",
        method: "POST",
      });
      const identifierHash = hashIdentifier(credentials?.email);

      if (!credentials?.email || !credentials.password) {
        logger.securityEvent("failed_login", {
          reason: "missing_credentials",
          identifierHash,
        });
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
      });
      if (!user) {
        logger.securityEvent("failed_login", {
          reason: "user_not_found",
          identifierHash,
        });
        return null;
      }

      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) {
        logger.securityEvent("failed_login", {
          reason: "invalid_password",
          identifierHash,
        });
        return null;
      }

      const appUser: AppUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      };

      return appUser;
    },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        const appUser = user as User & AppUser;
        const appToken = token as AppToken;
        appToken.role = appUser.role;
        appToken.organizationId = appUser.organizationId;
      }

      return token;
    },
    async session(
      params: {
        session: Session;
        token: unknown;
        user: AdapterUser;
        newSession?: unknown;
        trigger?: "update";
      }
    ) {
      const { session, token } = params;
      if (session.user) {
        const appToken = token as AppToken;
        session.user.id = (token as { sub?: string }).sub ?? "";
        session.user.role = appToken.role;
        session.user.organizationId = appToken.organizationId;
      }
      return session;
    },
  },
};
