import { sendMagicLinkEmail as sendMagicLinkEmailImpl, sendPasswordResetEmail as sendPasswordResetEmailImpl } from "@/services/email";

export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !portRaw || !user || !pass || !from) return false;
  const port = Number(portRaw);
  if (!Number.isFinite(port) || port <= 0) return false;
  return true;
}

export async function sendPasswordResetEmail(args: { to: string; url: string }): Promise<void> {
  await sendPasswordResetEmailImpl(args);
}

export async function sendMagicLinkEmail(args: { to: string; url: string }): Promise<void> {
  await sendMagicLinkEmailImpl(args);
}
