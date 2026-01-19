import { z } from "zod";

const envSchema = z.object({
  // Tudo opcional por design: o app precisa rodar sem env (local e produção).
  DATABASE_URL: z.string().min(1).optional(),
  APP_URL: z.string().url().optional(),

  // Chaves opcionais para integrações (não críticas). Se não existir, o app segue em modo local.
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().min(1).optional(),

  // Monetização & Sustentação (público, opcional)
  // URL de afiliado recomendada para provedores de hospedagem (ex: Hostinger). Use apenas URLs públicas.
  NEXT_PUBLIC_AFFILIATE_HOSTING_URL: z.string().url().optional(),
  // Email público de contato para suporte/apoio (opcional)
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email().optional(),
  // PIX key pública para exibir na página de apoio (opcional)
  NEXT_PUBLIC_PIX_KEY: z.string().min(1).optional(),

  // Links externos de aquisição (opcional). Se não existir, a página /acquire mostra fallback.
  NEXT_PUBLIC_ACQUIRE_HOTMART_URL: z.string().url().optional(),
  NEXT_PUBLIC_ACQUIRE_MERCADOLIVRE_URL: z.string().url().optional(),
  NEXT_PUBLIC_ACQUIRE_GUMROAD_URL: z.string().url().optional(),
  NEXT_PUBLIC_ACQUIRE_STRIPE_LINK_URL: z.string().url().optional(),
  NEXT_PUBLIC_ACQUIRE_CHECKOUT_URL: z.string().url().optional(),
});

export function getPixKey(): string | undefined {
  return process.env.NEXT_PUBLIC_PIX_KEY;
}

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
  // Nunca derrube o app por env inválido/ausente: modo FULL precisa abrir sempre.
  return parsed.success ? parsed.data : ({} as Env);
}

export function getAppUrl(): string {
  const appUrl = process.env.APP_URL;
  if (appUrl) return appUrl;
  return "http://localhost:3000";
}

/** Helpers for monetization / support UI */
export function getAffiliateHostingUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_AFFILIATE_HOSTING_URL;
}

export function getSupportEmail(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
}
