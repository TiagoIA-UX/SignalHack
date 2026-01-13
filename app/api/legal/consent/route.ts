import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  ACCEPTANCE_ID_COOKIE_NAME,
  CONSENT_COOKIE_NAME,
  LEGAL_VERSION,
  encodeCookieJson,
  makeConsent,
} from "@/lib/consent";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { randomUUID } from "node:crypto";
import { attachUaField, getUa } from "@/lib/ua";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postSchema = z.object({
  metrics: z.boolean(),
  personalization: z.boolean(),
  source: z.enum(["banner", "settings", "welcome"]).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const jar = await cookies();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const ua = getUa(h);

  const token = jar.get(SESSION_COOKIE)?.value ?? null;
  const session = token ? await verifySessionJwt(token).catch(() => null) : null;

  const acceptanceId = jar.get(ACCEPTANCE_ID_COOKIE_NAME)?.value ?? randomUUID();
  jar.set(ACCEPTANCE_ID_COOKIE_NAME, acceptanceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const consent = makeConsent({
    metrics: parsed.data.metrics,
    personalization: parsed.data.personalization,
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

  const audit = prisma as any;

  try {
    await audit.consentEvent.create({
      data: {
        acceptanceId,
        userId: session?.sub ?? null,
        email: session?.email ?? null,
        legalVersion: LEGAL_VERSION,
        metrics: !!consent.categories.metrics,
        personalization: !!consent.categories.personalization,
        ip,
        source: parsed.data.source ?? "banner",
        ...attachUaField({}, ua),
      } as any,
    });
  } catch {
    return NextResponse.json({ error: "audit_unavailable" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, consent });
}
