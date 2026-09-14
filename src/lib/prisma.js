import { PrismaClient } from "@prisma/client";

// Next.js dev modunda hot-reload sırasında birden fazla PrismaClient
// oluşmasını önlemek için global'e cache'liyoruz.
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
