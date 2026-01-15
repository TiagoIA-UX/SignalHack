import { config as loadEnv } from "dotenv";

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  // Do not load .env in production by default; allow explicit --load-env
  const forceLoadEnv = getArgValue("--load-env") === "1" || process.env.LOAD_ENV === "1";
  if (process.env.NODE_ENV !== "production" || forceLoadEnv) {
    loadEnv({ path: ".env.local", override: true });
    loadEnv({ path: ".env", override: false });
  }

  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) {
    console.error("ERROR: DATABASE_URL is not set. Aborting.");
    process.exit(2);
  }
  if (dbUrl.startsWith("file:") && getArgValue("--force") !== "1") {
    console.error("ERROR: DATABASE_URL points to a SQLite file. Refusing to run in this environment. If intentional, pass --force.");
    process.exit(2);
  }

  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    console.warn("WARNING: AUTH_SECRET / NEXTAUTH_SECRET is not set. Auth behavior may be unstable across deploys.");
  }

  const emailArg = getArgValue("--email");
  const passwordArg = getArgValue("--password");

  if (!emailArg) {
    console.error("Usage: npx tsx scripts/ensure-admin.ts --email admin@example.com [--password secret] [--force] [--load-env 1]");
    process.exit(2);
  }

  // Delegate to existing seed-admin.ts but ensure safety flags
  const childArgs = ["scripts/seed-admin.ts", "--email", emailArg];
  if (passwordArg) childArgs.push("--password", passwordArg);
  // In production we don't want to load repo .env by default
  // If user passed --load-env or --force, pass them through
  if (getArgValue("--load-env") === "1") childArgs.push("--load-env", "1");
  if (getArgValue("--force") === "1") childArgs.push("--force", "1");

  const { spawnSync } = await import("child_process");
  const res = spawnSync("npx", ["tsx", ...childArgs], { stdio: "inherit", shell: true });
  process.exit(res.status ?? 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});