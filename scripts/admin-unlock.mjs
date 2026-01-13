import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function getArgValues(flag) {
  const values = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === flag && process.argv[i + 1]) values.push(process.argv[i + 1]);
  }
  return values;
}

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env", override: false });

const emails = getArgValues("--email").map((e) => String(e).trim().toLowerCase()).filter(Boolean);
const password = getArgValue("--password");

if (!emails.length) {
  console.error("Uso: node scripts/admin-unlock.mjs --email voce@exemplo.com [--email outro@exemplo.com] --password 'SuaSenha'");
  process.exit(1);
}
if (!password || String(password).length < 8) {
  console.error("Senha ausente ou muito curta. Use --password (>= 8 chars). Ex.: --password 'ChangeMe123!'");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL não configurada em .env/.env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  const argon2 = await import("argon2");
  const passwordHash = await argon2.default.hash(String(password), { type: argon2.default.argon2id });

  for (const email of emails) {
    await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", plan: "ELITE", passwordHash, emailVerified: true },
      create: { email, role: "ADMIN", plan: "ELITE", passwordHash, emailVerified: true },
    });
    process.stdout.write(`OK admin+elite: ${email}\n`);
  }

  process.stdout.write("Concluído.\n");
} finally {
  await prisma.$disconnect().catch(() => undefined);
  await pool.end().catch(() => undefined);
}
