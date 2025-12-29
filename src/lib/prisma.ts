import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

const extendedPrisma = prismaClient.$extends({
  query: {
    async $allOperations({ model, operation, args, query }) {
      const start = performance.now();
      const result = await query(args);
      const end = performance.now();
      const duration = end - start;
      
      if (process.env.LOG_QUERY_TIME === "true" || process.env.NODE_ENV === "development") {
        console.log(`[Prisma Query] ${model}.${operation} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    },
  },
});

export const prisma = extendedPrisma as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}
