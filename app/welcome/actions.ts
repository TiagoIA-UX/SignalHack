"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCEPTANCE_ID_COOKIE_NAME,
  CONSENT_COOKIE_NAME,
  LEGAL_VERSION,
  WELCOME_COOKIE_NAME,
  encodeCookieJson,
  makeConsent,
  makeWelcomeAcceptance,
} from "@/lib/consent";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { attachUaField, getUa } from "@/lib/ua";

type AcceptWelcomeInput = {
  next?: string;
  metrics?: string;
  personalization?: string;
  acceptTerms?: string;
  acceptPrivacy?: string;
  acceptEssentialCookies?: string;
};

function safeNextPath(next?: string | null) {
  if (!next) return "/dashboard";
  // Only allow internal paths.
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  return next;
}

export async function acceptWelcome(formData: FormData) {
  const input: AcceptWelcomeInput = {
    next: (formData.get("next") as string | null) ?? undefined,
    metrics: (formData.get("metrics") as string | null) ?? undefined,
    personalization: (formData.get("personalization") as string | null) ?? undefined,
    acceptTerms: (formData.get("acceptTerms") as string | null) ?? undefined,
    acceptPrivacy: (formData.get("acceptPrivacy") as string | null) ?? undefined,
    acceptEssentialCookies: (formData.get("acceptEssentialCookies") as string | null) ?? undefined,
  };

  // Hard requirements: psychological contract + privacy contract + essential cookies.
  if (input.acceptTerms !== "on" || input.acceptPrivacy !== "on" || input.acceptEssentialCookies !== "on") {
    redirect(`/welcome?error=missing&next=${encodeURIComponent(safeNextPath(input.next))}`);
  }

  const consent = makeConsent({
    metrics: input.metrics === "on",
    personalization: input.personalization === "on",
  });

  const welcome = makeWelcomeAcceptance();

  const jar = await cookies();
  const hasSession = !!jar.get(SESSION_COOKIE)?.value;

  const acceptanceId = jar.get(ACCEPTANCE_ID_COOKIE_NAME)?.value ?? randomUUID();
  jar.set(ACCEPTANCE_ID_COOKIE_NAME, acceptanceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  jar.set(WELCOME_COOKIE_NAME, encodeCookieJson(welcome), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  jar.set(CONSENT_COOKIE_NAME, encodeCookieJson(consent), {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  jar.set("sf_legal_version", LEGAL_VERSION, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  // Server-side proof (audit) — required for enterprise defensibility.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = getUa(h);

  const token = jar.get(SESSION_COOKIE)?.value ?? null;
  const session = token
    ? await verifySessionJwt(token).catch(() => null)
    : null;

  const audit = prisma as any;

  try {
    await audit.legalAcceptance.create({
      data: {
        acceptanceId,
        userId: session?.sub ?? null,
        email: session?.email ?? null,
        legalVersion: LEGAL_VERSION,
        acceptedAt: new Date(welcome.acceptedAt),
        termsAccepted: true,
        privacyAccepted: true,
        essentialCookiesAccepted: true,
        metricsConsent: !!consent.categories.metrics,
        personalizationConsent: !!consent.categories.personalization,
        ip,
        source: "welcome",
        ...attachUaField({}, ua),
      } as any,
    });

    await audit.consentEvent.create({
      data: {
        acceptanceId,
        userId: session?.sub ?? null,
        email: session?.email ?? null,
        legalVersion: LEGAL_VERSION,
        metrics: !!consent.categories.metrics,
        personalization: !!consent.categories.personalization,
        ip,
        source: "welcome",
        ...attachUaField({}, ua),
      } as any,
    });
  } catch {
    redirect(`/welcome?error=audit&next=${encodeURIComponent(safeNextPath(input.next))}`);
  }

  const nextPath = safeNextPath(input.next);
  if (!hasSession) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  redirect(nextPath);
}
