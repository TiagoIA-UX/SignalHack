import { config as loadEnv } from "dotenv";

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  // Importante: Prisma lê DATABASE_URL no import do client, então carregue env antes.
  loadEnv({ path: ".env.local", override: true });
  loadEnv({ path: ".env", override: false });

  const emailFromArgs = getArgValue("--email");
  const passwordFromArgs = getArgValue("--password");
  const emailFromEnv = process.env.ADMIN_EMAIL;
  const passwordFromEnv = process.env.ADMIN_PASSWORD;

  const { prisma } = await import("../lib/prisma");
  const { hashPassword } = await import("../lib/password");

  let email = (emailFromArgs || emailFromEnv || "").trim().toLowerCase();
  const password = passwordFromArgs || passwordFromEnv;

  if (!email) {
    const last = await prisma.user.findFirst({
      orderBy: { createdAt: "desc" },
      select: { email: true },
    });
    if (!last?.email) {
      throw new Error(
        "Nenhum usuário encontrado para promover. Crie uma conta em /register e rode novamente."
      );
    }
    email = last.email.toLowerCase();
  }

  const update: { role: "ADMIN"; passwordHash?: string } = { role: "ADMIN" };
  if (password) {
    update.passwordHash = await hashPassword(password);
  }

  await prisma.user.upsert({
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
