import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/password";

async function main() {
  const email = "zairyx.ai@gmail.com";
  const password = "#Aurelius170742";
  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", passwordHash: passwordHash },
    create: { email, role: "ADMIN", passwordHash: passwordHash },
  });
  console.log("Usuário admin atualizado/criado com sucesso.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
