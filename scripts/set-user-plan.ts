import { config as loadEnv } from "dotenv";

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

async function main() {
  loadEnv({ path: ".env.local", override: true });
  loadEnv({ path: ".env", override: false });

  const email = (getArgValue("--email") || "").trim().toLowerCase();
  const plan = (getArgValue("--plan") || "").trim().toUpperCase();
  const resetDaily = process.argv.includes("--reset-daily");

  if (!email) {
    throw new Error("Uso: npx tsx scripts/set-user-plan.ts --email voce@exemplo.com --plan PRO|ELITE [--reset-daily]");
  }
  if (!plan || !["FREE", "PRO", "ELITE"].includes(plan)) {
    throw new Error("Plano inválido. Use FREE, PRO ou ELITE.");
  }

  const { prisma } = await import("../lib/prisma");

  const user = await prisma.user.update({
    where: { email },
    data: { plan: plan as "FREE" | "PRO" | "ELITE" },
    select: { id: true, email: true, plan: true, role: true },
  });

  if (resetDaily) {
    // Apaga todos os contadores do dia atual (UTC) para o usuário.
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);

    await prisma.usageDay.deleteMany({
      where: {
        userId: user.id,
        day,
      },
    });
  }

  console.log(`Atualizado: ${user.email} role=${user.role} plan=${user.plan}`);
  if (resetDaily) {
    console.log("Uso diário resetado (UsageDay do dia UTC removido).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
