import nodemailer from "nodemailer";

type Transporter = nodemailer.Transporter;

let transporter: Transporter | null = null;
let verified = false;

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

function getTransporter(): Transporter {
  if (transporter) return transporter;
  if (!isSmtpConfigured()) {
    throw new Error("SMTP not configured (missing env vars)");
  }
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT!);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // explicit TLS options can be added here if needed
  });
  return transporter;
}

export async function verifyTransporter(): Promise<void> {
  if (verified) return;
  const t = getTransporter();
  await t.verify();
  verified = true;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP not configured");
  }
  await verifyTransporter();
  const t = getTransporter();
  const from = process.env.SMTP_FROM!;
  const info = await t.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html });
  return info;
}
