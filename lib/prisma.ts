import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL ?? process.env.DATABASE_URL_LOCAL;
const isPostgres = !!databaseUrl && String(databaseUrl).startsWith("postgres");

let prismaClient: PrismaClient;

if (isPostgres) {
  // Use a pg Pool + PrismaPg adapter in production to avoid client/edge engine issues
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
} else {
  // Fallback to default PrismaClient (for local dev only)
  prismaClient = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? prismaClient;
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

