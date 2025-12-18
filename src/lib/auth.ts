import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
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
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

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
    async jwt({ token, user }) {
      if (user) {
        const appUser = user as User & AppUser;
        const appToken = token as AppToken;
        appToken.role = appUser.role;
        appToken.organizationId = appUser.organizationId;
        return appToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const appToken = token as AppToken;
        session.user.id = token.sub ?? "";
        session.user.role = appToken.role;
        session.user.organizationId = appToken.organizationId;
      }
      return session;
    },
  },
};
