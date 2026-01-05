import nodemailer from "nodemailer";
import { getEnv } from "@/lib/env";

export async function sendMagicLinkEmail(opts: { to: string; url: string }) {
  const env = getEnv();

  const hasSmtp = !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);

  if (!hasSmtp) {
    console.log(`[SignalHack] Magic link for ${opts.to}: ${opts.url}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: opts.to,
    subject: "Seu acesso ao SignalHack",
    text: `Abra este link para entrar: ${opts.url}`,
  });
}
