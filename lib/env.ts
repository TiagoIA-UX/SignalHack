import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  // Opcional: só é necessário se você habilitar fluxos baseados em tokens (ex: recuperação de senha por email).
  AUTH_TOKEN_PEPPER: z.string().min(16).optional(),
  APP_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_BOOTSTRAP_TOKEN: z.string().min(16).optional(),
  BILLING_WEBHOOK_TOKEN: z.string().min(8).optional(),
  // SMTP removido para login minimalista
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  // Normalize environment values to avoid invalid data caused by accidental
  // trailing CR/LF or literal `\r`/`\n` sequences introduced via UI/CLI.
  const raw: Record<string, unknown> = { ...process.env };
  for (const key of Object.keys(raw)) {
    const v = raw[key];
    if (typeof v === "string") {
      raw[key] = v.replace(/\\r/g, "").replace(/\\n/g, "").replace(/\r/g, "").replace(/\n/g, "").trim();
    }
  }

  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${details}`);
  }
  return parsed.data;
}

export function getAppUrl(): string {
  const appUrl = process.env.APP_URL;
  if (appUrl) return appUrl;
  return "http://localhost:3000";
}
