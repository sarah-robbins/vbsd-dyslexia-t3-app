import { PrismaClient } from "@prisma/client";
import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // log: ['query', 'info', 'warn', 'error'],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
