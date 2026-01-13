import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Pool } from "pg";

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

// Aproxima o comportamento do Next: .env.local tem precedência sobre .env
const envFromFile = { ...parseDotenv(envFile), ...parseDotenv(envLocalFile) };

const databaseUrl = process.env.DATABASE_URL || envFromFile.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL não está definido (nem no ambiente, nem em .env/.env.local).");
  process.exit(2);
}

let parsed;
try {
  parsed = new URL(databaseUrl);
} catch {
  console.error("DATABASE_URL não é uma URL válida.");
  process.exit(2);
}

const safe = {
  protocol: parsed.protocol,
  host: parsed.hostname,
  port: parsed.port || "(default)",
  database: parsed.pathname?.replace(/^\//, "") || "(none)",
  user: decodeURIComponent(parsed.username || ""),
  ssl: parsed.searchParams.get("sslmode") || "(none)",
};

console.log("PostgreSQL target:");
console.log(`- host: ${safe.host}`);
console.log(`- port: ${safe.port}`);
console.log(`- database: ${safe.database}`);
console.log(`- user: ${safe.user || "(none)"}`);
console.log(`- sslmode: ${safe.ssl}`);

const pool = new Pool({ connectionString: databaseUrl, max: 1 });
try {
  const start = Date.now();
  const r = await pool.query("select 1 as ok");
  const elapsed = Date.now() - start;
  console.log(`Conexão OK (SELECT 1) em ${elapsed}ms. Resultado:`, r.rows?.[0]);
  process.exit(0);
} catch (err) {
  const e = err;
  console.error("Falha ao conectar/consultar.");
  if (e && typeof e === "object") {
    const code = e.code || e.errorCode;
    const message = e.message;
    if (code) console.error(`- code: ${code}`);
    if (message) console.error(`- message: ${String(message)}`);
  } else {
    console.error(String(err));
  }
  process.exit(1);
} finally {
  await pool.end().catch(() => undefined);
}
