import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth is a function that returns a handler compatible with Next.js App Router
// Using type assertion through unknown for better type safety than 'as any'
// This is necessary due to NextAuth's type definitions not fully supporting App Router
const NextAuthHandler = NextAuth as unknown as (options: typeof authOptions) => {
  (req: Request): Promise<Response>;
};
const handler = NextAuthHandler(authOptions);

export { handler as GET, handler as POST };
