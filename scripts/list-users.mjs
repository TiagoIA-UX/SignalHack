
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env", override: false });

import db from "../lib/prisma.js";

async function main() {
  const users = await db.users.findMany();
  for (const u of users) {
    process.stdout.write(`${u.createdAt?.toISOString?.() ?? ''}\t${u.role ?? ''}\t${u.plan ?? ''}\t${u.email}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
