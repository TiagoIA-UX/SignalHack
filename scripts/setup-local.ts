import { execSync } from "child_process";
import { existsSync } from "fs";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local", override: true });
loadDotenv({ path: ".env", override: false });

let dbUrl = process.env.DATABASE_URL || "file:./dev.db";
console.log("[setup-local] Using DATABASE_URL:", dbUrl);

// Try to apply migrations; if DATABASE_URL points to localhost but is unreachable, fall back to SQLite
function tryMigrate() {
  try {
    console.log("[setup-local] Running prisma migrate deploy...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    return true;
  } catch (err) {
    const msg = (err as any)?.message ?? String(err);
    console.warn("[setup-local] prisma migrate deploy failed:", msg);

    // If the failure indicates the DB is unreachable and it's a localhost URL, fallback to sqlite
    const isLocalhostUrl = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");
    // If the DB is on localhost and migrate deploy failed, fallback to SQLite unless the user explicitly prefers Postgres
    if (isLocalhostUrl && !process.env.PREFER_POSTGRES) {
      console.warn("[setup-local] Detected unreachable local Postgres. Falling back to local SQLite (dev.db). To prefer Postgres, set PREFER_POSTGRES=1 and ensure DB is running.");
      process.env.DATABASE_URL = "file:./dev.db";
      dbUrl = process.env.DATABASE_URL;
      try {
        execSync("npx prisma migrate deploy", { stdio: "inherit" });
        return true;
      } catch (err2) {
        console.warn("[setup-local] prisma migrate deploy still failed on fallback:", (err2 as any).message || err2);
      }
    }

    // Try `prisma migrate dev` as a last resort (idempotent for dev)
    console.warn("[setup-local] Trying prisma migrate dev (idempotent)...");
    try {
      execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
      return true;
    } catch (err2) {
      console.error("[setup-local] prisma migrate dev failed:", (err2 as any).message || err2);
      return false;
    }
  }
}

if (!tryMigrate()) {
  console.error('[setup-local] Migration failed. Please start your Postgres instance or remove DATABASE_URL to let the script use SQLite fallback and re-run `npm run setup:local`.');
  process.exit(1);
}

// Optionally seed admin if provided via env
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail && adminPassword) {
  try {
    console.log("[setup-local] Seeding admin user (via ADMIN_EMAIL/ADMIN_PASSWORD)...");
    execSync(`npx tsx scripts/seed-admin.ts --email ${adminEmail} --password ${adminPassword}`, { stdio: "inherit" });
  } catch (err) {
    console.warn("[setup-local] seed-admin failed:", (err as any).message || err);
  }
} else {
  console.log("[setup-local] No ADMIN_EMAIL/ADMIN_PASSWORD provided — skipping auto-seed (you can run scripts/seed-admin.ts manually).");
}

console.log("[setup-local] Done. Local DB should be ready.");
