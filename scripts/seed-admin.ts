import { config as loadEnv } from "dotenv";

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  // Segurança: NÃO carregamos .env automaticamente quando NODE_ENV=production,
  // para evitar executar contra um DB local ou acidentalmente usar variáveis do repositório.
  const forceLoadEnv = getArgValue("--load-env") === "1" || process.env.LOAD_ENV === "1";
  if (process.env.NODE_ENV !== "production" || forceLoadEnv) {
    // Importante: Prisma lê DATABASE_URL no import do client, então carregue env antes.
    loadEnv({ path: ".env.local", override: true });
    loadEnv({ path: ".env", override: false });
  }

  const emailFromArgs = getArgValue("--email");
  const passwordFromArgs = getArgValue("--password");
  const emailFromEnv = process.env.ADMIN_EMAIL;
  const passwordFromEnv = process.env.ADMIN_PASSWORD;

  const { db: prisma } = await import("../lib/prisma");
  const { hashPassword } = await import("../lib/password");

  let email = (emailFromArgs || emailFromEnv || "").trim().toLowerCase();
  const password = passwordFromArgs || passwordFromEnv;

  // Safety: Prevent accidental use of SQLite dev DB in production
  const dbUrl = process.env.DATABASE_URL || "";
  if (dbUrl.startsWith("file:") && getArgValue("--force") !== "1") {
    throw new Error(
      "Refusing to run against SQLite (file:). If you really want to run against a file DB, pass --force or set LOAD_ENV=1."
    );
  }

  if (!email) {
    const all = await prisma.users.findMany();
    if (!all.length) {
      throw new Error(
        "Nenhum usuário encontrado para promover. Crie uma conta em /register e rode novamente."
      );
    }
    // Ordena por createdAt (se existir), senão pega o último
    const last = all.sort((a: { createdAt?: string | Date | null; email: string }, b: { createdAt?: string | Date | null; email: string }) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    })[0];
    email = last.email.toLowerCase();
  }

  const update: { role: "ADMIN"; passwordHash?: string } = { role: "ADMIN" };
  if (password) {
    update.passwordHash = await hashPassword(password);
  }

  await prisma.users.upsert({
    where: { email },
    update,
    create: { email, ...update },
  });

  console.log(`Usuário promovido para ADMIN: ${email}`);
  if (password) {
    console.log("Senha definida/atualizada via ADMIN_PASSWORD/--password.");
  } else {
    console.log("Senha não foi alterada (nenhum ADMIN_PASSWORD/--password fornecido).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
