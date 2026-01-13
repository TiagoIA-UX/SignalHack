import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient; isSqlite?: boolean };

// Support SQLite fallback for local development when DATABASE_URL is not provided.
// If DATABASE_URL is a Postgres URL, use the pg adapter. Otherwise, rely on the default adapter (SQLite or other).
const databaseUrl = process.env.DATABASE_URL ?? process.env.DATABASE_URL_LOCAL ?? undefined;
let prismaClient: PrismaClient;
let isSqlite = false;

if (!databaseUrl) {
  // Default to a local sqlite file for developer convenience (opt-in by default).
  // This does not add any sensitive data to the repo; file sits in project root (`dev.db`).
  process.env.DATABASE_URL = "file:./dev.db";
  isSqlite = true;
  console.warn("Using local SQLite fallback for development (DATABASE_URL=file:./dev.db). Set DATABASE_URL to use a different DB.");
}

// If DATABASE_URL looks like Postgres, use the Pg adapter to avoid requiring sqlite drivers.
const isPostgres = !!process.env.DATABASE_URL && String(process.env.DATABASE_URL).startsWith("postgres");

if (isPostgres) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prismaClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
} else {
  // SQLite (or other DSNs supported by Prisma) — do not require pg adapter
  prismaClient = new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"] });
  if (String(process.env.DATABASE_URL).startsWith("file:")) isSqlite = true;
}

export const prisma = globalForPrisma.prisma ?? prismaClient;
export const usingSqlite = globalForPrisma.isSqlite ?? isSqlite;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.isSqlite = isSqlite;
}
