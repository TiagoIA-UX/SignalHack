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

  // Monetização & Sustentação (público, opcional)
  // URL de afiliado recomendada para provedores de hospedagem (ex: Hostinger). Use apenas URLs públicas.
  NEXT_PUBLIC_AFFILIATE_HOSTING_URL: z.string().url().optional(),
  // Email público de contato para suporte/apoio (opcional)
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().optional(),
  // Habilita exibição de opções de doação quando "true" (string). Quando ausente/"false", UI de doação fica oculta.
  NEXT_PUBLIC_DONATION_PROVIDER_ENABLED: z.enum(["true", "false"]).optional(),
  // Variante de copy para doações (soft | neutral | minimal)
  NEXT_PUBLIC_DONATION_COPY_VARIANT: z.enum(["soft", "neutral", "minimal"]).optional(),
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

/** Helpers for monetization / support UI */
export function isDonationEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_DONATION_PROVIDER_ENABLED;
  return v === "true" || v === "1";
}

export function getAffiliateHostingUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_AFFILIATE_HOSTING_URL;
}

export function getSupportEmail(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
}

export function getDonationCopyVariant(): "soft" | "neutral" | "minimal" {
  return (process.env.NEXT_PUBLIC_DONATION_COPY_VARIANT as any) ?? "soft";
}
