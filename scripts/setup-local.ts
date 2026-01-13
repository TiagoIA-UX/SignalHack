import { execSync } from "child_process";
import { existsSync } from "fs";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env.local", override: true });
loadDotenv({ path: ".env", override: false });

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
console.log("[setup-local] Using DATABASE_URL:", dbUrl);

// Ensure migrations are applied non-interactively
try {
  console.log("[setup-local] Running prisma migrate deploy...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} catch (err) {
  console.warn("[setup-local] prisma migrate deploy failed, trying prisma migrate dev (idempotent)...");
  try {
    execSync("npx prisma migrate dev --name init --skip-seed", { stdio: "inherit" });
  } catch (err2) {
    console.error("[setup-local] prisma migrate dev failed:", (err2 as any).message || err2);
    process.exit(1);
  }
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
