import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/env";
import { randomToken, sha256 } from "@/lib/token";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";
import { isSmtpConfigured, sendMagicLinkEmail } from "@/lib/email";
import { captureException, getRequestIdFromHeaders, logEvent } from "@/lib/logger";
import { attachUaField, getUa } from "@/lib/ua";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
  next: z.string().max(512).optional(),
});

// Magic link (opcional): request -> email -> verify -> sessão.
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  const rlIp = await rateLimitAsync(`auth:magic:request:${ip}`, { windowMs: 10 * 60_000, max: 10 });
  if (!rlIp.ok) {
    logEvent("warn", "auth.magic.request.rate_limited", { requestId, path: "/api/auth/request", method: "POST", status: 429, ip, ua });
    await logAccess({ path: "/api/auth/request", method: "POST", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logEvent("warn", "auth.magic.request.invalid_request", { requestId, path: "/api/auth/request", method: "POST", status: 400, ip, ua });
    await logAccess({ path: "/api/auth/request", method: "POST", status: 400, ip, ua });
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const nextPath = parsed.data.next;

  const rlEmail = await rateLimitAsync(`auth:magic:request:email:${email}`, { windowMs: 60 * 60_000, max: 5 });
  if (!rlEmail.ok) {
    logEvent("warn", "auth.magic.request.rate_limited", { requestId, path: "/api/auth/request", method: "POST", status: 429, ip, ua, extra: { email } });
    await logAccess({ path: "/api/auth/request", method: "POST", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const pepper = process.env.AUTH_TOKEN_PEPPER;
  if (!pepper || pepper.length < 16) {
    logEvent("error", "auth.magic.request.not_configured", { requestId, path: "/api/auth/request", method: "POST", status: 503, ip, ua });
    await logAccess({ path: "/api/auth/request", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  if (!isSmtpConfigured()) {
    logEvent("error", "auth.magic.request.email_not_configured", { requestId, path: "/api/auth/request", method: "POST", status: 503, ip, ua });
    await logAccess({ path: "/api/auth/request", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  // Não revelar se o email existe.
  let user: { id: string; email: string } | null = null;
  try {
    user = await prisma.users.findUnique({ where: { email }, select: { id: true, email: true } });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      captureException(err, { requestId, path: "/api/auth/request", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "auth.magic.request.db_unavailable", { requestId, path: "/api/auth/request", method: "POST", status: 503, ip, ua });
      await logAccess({ path: "/api/auth/request", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    captureException(err, { requestId, path: "/api/auth/request", method: "POST", status: 500, ip, ua });
    throw err;
  }

  if (user) {
    const token = randomToken(32);
    const tokenHash = sha256(`${token}:${pepper}`);
    const expiresAt = new Date(Date.now() + 15 * 60_000);

    try {
      // Invalidate previous tokens
      await prisma.authTokens.updateMany({
        where: {
          type: "MAGIC_LINK",
          identifier: email,
          consumedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { consumedAt: new Date() },
      });
      // Create new token
      await prisma.authTokens.create({
        type: "MAGIC_LINK",
        identifier: email,
        tokenHash,
        expiresAt,
        ip,
        ...attachUaField({}, ua),
        userId: user.id,
      });
    } catch (err) {
      if (isDbUnavailableError(err)) {
        captureException(err, { requestId, userId: user.id, path: "/api/auth/request", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
        logEvent("error", "auth.magic.request.db_unavailable", { requestId, userId: user.id, path: "/api/auth/request", method: "POST", status: 503, ip, ua });
        await logAccess({ path: "/api/auth/request", method: "POST", status: 503, ip, ua });
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      }
      captureException(err, { requestId, userId: user.id, path: "/api/auth/request", method: "POST", status: 500, ip, ua });
      throw err;
    }

    const appUrl = getAppUrl().replace(/\/$/, "");
    const verifyUrl = `${appUrl}/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`;

    try {
      await sendMagicLinkEmail({ to: user.email, url: verifyUrl });
    } catch {
      logEvent("error", "auth.magic.request.email_unavailable", { requestId, userId: user.id, path: "/api/auth/request", method: "POST", status: 503, ip, ua });
      await logAccess({ userId: user.id, path: "/api/auth/request", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "email_unavailable" }, { status: 503 });
    }
  }

  await logAccess({ userId: user?.id, path: "/api/auth/request", method: "POST", status: 200, ip, ua });
  logEvent("info", "auth.magic.request.ok", { requestId, userId: user?.id ?? undefined, path: "/api/auth/request", method: "POST", status: 200, ip, ua });
  return NextResponse.json({ ok: true });
}
