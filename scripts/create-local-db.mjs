import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "pg";

function parseDotenv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const repoRoot = path.resolve(process.cwd());
const envFile = path.join(repoRoot, ".env");
const envLocalFile = path.join(repoRoot, ".env.local");

// .env.local sobrescreve .env
const envFromFile = { ...parseDotenv(envFile), ...parseDotenv(envLocalFile) };

const databaseUrl = process.env.DATABASE_URL || envFromFile.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL não está definido (nem no ambiente, nem em .env/.env.local)."
  );
  process.exit(2);
}

let parsed;
try {
  parsed = new URL(databaseUrl);
} catch {
  console.error("DATABASE_URL não é uma URL válida.");
  process.exit(2);
}

const targetDb = parsed.pathname?.replace(/^\//, "") || "";
if (!targetDb) {
  console.error("DATABASE_URL não contém o nome do banco (path)."
  );
  process.exit(2);
}

const adminUrl = new URL(parsed.toString());
adminUrl.pathname = "/postgres";

const client = new Client({ connectionString: adminUrl.toString() });
await client.connect();
try {
  const exists = await client.query(
    "select 1 from pg_database where datname = $1",
    [targetDb]
  );

  if (exists.rowCount && exists.rowCount > 0) {
    console.log(`DB '${targetDb}' já existe.`);
    process.exit(0);
  }

  // CREATE DATABASE não aceita parâmetros; validação é feita acima
  await client.query(`CREATE DATABASE \"${targetDb.replaceAll('"', '""')}\"`);
  console.log(`DB '${targetDb}' criado.`);
} finally {
  await client.end();
}
