// Prisma CLI (migrations/generate) não carrega automaticamente .env.local.
// Em dev com Next.js, .env.local é a fonte preferida; então carregamos aqui.
import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env", override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
