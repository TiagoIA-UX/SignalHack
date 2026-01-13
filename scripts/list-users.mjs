import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env", override: false });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { email: true, role: true, plan: true, createdAt: true },
  });

  for (const u of users) {
    process.stdout.write(
      `${u.createdAt.toISOString()}\t${u.role}\t${u.plan}\t${u.email}\n`
    );
  }
} finally {
  await prisma.$disconnect().catch(() => undefined);
  await pool.end().catch(() => undefined);
}
