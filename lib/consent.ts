export type ConsentCategories = {
  essential: true;
  metrics: boolean;
  personalization: boolean;
};

export type CookieConsent = {
  version: string;
  updatedAt: string; // ISO
  categories: ConsentCategories;
};

export type WelcomeAcceptance = {
  version: string;
  acceptedAt: string; // ISO
};

export const CONSENT_COOKIE_NAME = "sf_cookie_consent";
export const WELCOME_COOKIE_NAME = "sf_welcome_accepted";
export const ACCEPTANCE_ID_COOKIE_NAME = "sf_acceptance_id";

// Keep this as a date string so we can rotate terms later without schema changes.
export const LEGAL_VERSION = "2026-01-12";

export function makeConsent(categories: Omit<ConsentCategories, "essential"> & { essential?: true }): CookieConsent {
  return {
    version: LEGAL_VERSION,
    updatedAt: new Date().toISOString(),
    categories: {
      essential: true,
      metrics: !!categories.metrics,
      personalization: !!categories.personalization,
    },
  };
}

export function makeWelcomeAcceptance(): WelcomeAcceptance {
  return {
    version: LEGAL_VERSION,
    acceptedAt: new Date().toISOString(),
  };
}

export function encodeCookieJson(value: unknown): string {
  return encodeURIComponent(JSON.stringify(value));
}

export function decodeCookieJson<T>(raw: string | undefined | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as T;
  } catch {
    return null;
  }
}

export function hasValidWelcomeAcceptance(raw: string | undefined | null): boolean {
  const parsed = decodeCookieJson<WelcomeAcceptance>(raw);
  if (!parsed) return false;
  if (!parsed.version || !parsed.acceptedAt) return false;
  // If legal version rotates, user must re-accept.
  return parsed.version === LEGAL_VERSION;
}

export function parseConsent(raw: string | undefined | null): CookieConsent | null {
  const parsed = decodeCookieJson<CookieConsent>(raw);
  if (!parsed) return null;
  if (!parsed.version || !parsed.updatedAt || !parsed.categories) return null;
  if (parsed.version !== LEGAL_VERSION) return null;
  if (parsed.categories.essential !== true) return null;
  return parsed;
}

export function getCookieValueFromDocument(name: string): string | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const key = part.slice(0, eq);
    if (key === name) return part.slice(eq + 1);
  }
  return null;
}

export function setClientCookie(name: string, value: string, opts?: { maxAgeDays?: number }): void {
  if (typeof document === "undefined") return;
  const maxAgeDays = opts?.maxAgeDays ?? 365;
  const maxAgeSeconds = Math.floor(maxAgeDays * 24 * 60 * 60);
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}
