import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/secrets";

export type SecretKey =
  | "groq_api_key"
  | "smtp_host"
  | "smtp_port"
  | "smtp_user"
  | "smtp_pass"
  | "smtp_from"
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
    smtp:
      set.has("smtp_host") &&
      set.has("smtp_port") &&
      set.has("smtp_user") &&
      set.has("smtp_pass") &&
      set.has("smtp_from"),
    mercadopago: set.has("mercadopago_access_token"),
  };
}
