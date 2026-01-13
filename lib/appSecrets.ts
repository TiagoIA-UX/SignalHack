import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secrets";

export type SecretKey =
  | "groq_api_key"
  // SMTP removido para login minimalista
  | "mercadopago_access_token";

export async function setSecret(key: SecretKey, plaintext: string) {
  const valueEnc = encryptSecret(plaintext);
  await prisma.appSecret
    .upsert({
      where: { key },
      create: { key, valueEnc },
      update: { valueEnc },
    })
    .catch(() => null);
}

export async function getSecret(key: SecretKey): Promise<string | null> {
  const row = await prisma.appSecret.findUnique({ where: { key } }).catch(() => null);
  if (!row) return null;
  return decryptSecret(row.valueEnc);
}

export async function hasSecret(key: SecretKey): Promise<boolean> {
  const row = await prisma.appSecret.findUnique({ where: { key }, select: { key: true } }).catch(() => null);
  return !!row;
}

export async function getSecretsStatus() {
  const rows = await prisma.appSecret.findMany({ select: { key: true } }).catch(() => [] as Array<{ key: string }>);
  const set = new Set(rows.map((r) => r.key));
  return {
    groq: set.has("groq_api_key"),
    mercadopago: set.has("mercadopago_access_token"),
  };
}
