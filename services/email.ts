import nodemailer from "nodemailer";
import { getEnv } from "@/lib/env";
import { getSecret } from "@/lib/appSecrets";

export async function sendMagicLinkEmail(opts: { to: string; url: string }) {
  const env = getEnv();

  const smtpHost = env.SMTP_HOST ?? (await getSecret("smtp_host").catch(() => null));
  const smtpPortRaw =
    (env.SMTP_PORT ? String(env.SMTP_PORT) : null) ?? (await getSecret("smtp_port").catch(() => null));
  const smtpUser = env.SMTP_USER ?? (await getSecret("smtp_user").catch(() => null));
  const smtpPass = env.SMTP_PASS ?? (await getSecret("smtp_pass").catch(() => null));
  const smtpFrom = env.SMTP_FROM ?? (await getSecret("smtp_from").catch(() => null));

  const smtpPort = smtpPortRaw ? Number(smtpPortRaw) : null;
  const hasSmtp = !!(smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom);

  if (!hasSmtp) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_NOT_CONFIGURED");
    }
    console.log(`[SignalHack] Magic link for ${opts.to}: ${opts.url}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost!,
    port: smtpPort!,
    secure: smtpPort === 465,
    auth: { user: smtpUser!, pass: smtpPass! },
  });

  await transporter.sendMail({
    from: smtpFrom!,
    to: opts.to,
    subject: "Seu acesso ao SignalHack",
    text: `Abra este link para entrar: ${opts.url}`,
  });
}
