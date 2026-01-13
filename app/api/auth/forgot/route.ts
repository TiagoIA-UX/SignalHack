import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/env";
import { randomToken, sha256 } from "@/lib/token";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";
import { isSmtpConfigured, sendPasswordResetEmail } from "@/lib/email";
import { captureException, getRequestIdFromHeaders, logEvent } from "@/lib/logger";
import { attachUaField, getUa } from "@/lib/ua";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  // Anti-abuse: limit by IP and by identifier.
  const rlIp = await rateLimitAsync(`auth:forgot:${ip}`, { windowMs: 10 * 60_000, max: 10 });
  if (!rlIp.ok) {
    logEvent("warn", "auth.forgot.rate_limited", { requestId, path: "/api/auth/forgot", method: "POST", status: 429, ip, ua });
    await logAccess({ path: "/api/auth/forgot", method: "POST", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logEvent("warn", "auth.forgot.invalid_request", { requestId, path: "/api/auth/forgot", method: "POST", status: 400, ip, ua });
    await logAccess({ path: "/api/auth/forgot", method: "POST", status: 400, ip, ua });
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const rlEmail = await rateLimitAsync(`auth:forgot:email:${email}`, { windowMs: 60 * 60_000, max: 5 });
  if (!rlEmail.ok) {
    logEvent("warn", "auth.forgot.rate_limited", { requestId, path: "/api/auth/forgot", method: "POST", status: 429, ip, ua, extra: { email } });
    await logAccess({ path: "/api/auth/forgot", method: "POST", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const pepper = process.env.AUTH_TOKEN_PEPPER;
  if (!pepper || pepper.length < 16) {
    logEvent("error", "auth.forgot.not_configured", { requestId, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
    await logAccess({ path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  if (!isSmtpConfigured()) {
    logEvent("error", "auth.forgot.email_not_configured", { requestId, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
    await logAccess({ path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  // Do not disclose whether the account exists.
  let user: { id: string; email: string } | null = null;
  try {
    user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      captureException(err, { requestId, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "auth.forgot.db_unavailable", { requestId, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
      await logAccess({ path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    captureException(err, { requestId, path: "/api/auth/forgot", method: "POST", status: 500, ip, ua });
    throw err;
  }

  if (user) {
    const token = randomToken(32);
    const tokenHash = sha256(`${token}:${pepper}`);
    const expiresAt = new Date(Date.now() + 30 * 60_000);

    try {
      await prisma.$transaction([
        prisma.authToken.updateMany({
          where: {
            type: "PASSWORD_RESET",
            identifier: email,
            consumedAt: null,
            expiresAt: { gt: new Date() },
          },
          data: { consumedAt: new Date() },
        }),
        prisma.authToken.create({
          data: {
            type: "PASSWORD_RESET",
            identifier: email,
            tokenHash,
            expiresAt,
            ip,
            ...attachUaField({}, ua),
            userId: user.id,
          },
        }),
      ]);
    } catch (err) {
      if (isDbUnavailableError(err)) {
        captureException(err, { requestId, userId: user.id, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
        logEvent("error", "auth.forgot.db_unavailable", { requestId, userId: user.id, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
        await logAccess({ path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      }
      captureException(err, { requestId, userId: user.id, path: "/api/auth/forgot", method: "POST", status: 500, ip, ua });
      throw err;
    }

    const appUrl = getAppUrl().replace(/\/$/, "");
    const resetUrl = `${appUrl}/reset?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    try {
      await sendPasswordResetEmail({ to: user.email, url: resetUrl });
    } catch {
      logEvent("error", "auth.forgot.email_unavailable", { requestId, userId: user.id, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
      await logAccess({ userId: user.id, path: "/api/auth/forgot", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "email_unavailable" }, { status: 503 });
    }
  }

  await logAccess({ userId: user?.id, path: "/api/auth/forgot", method: "POST", status: 200, ip, ua });
  logEvent("info", "auth.forgot.ok", { requestId, userId: user?.id ?? undefined, path: "/api/auth/forgot", method: "POST", status: 200, ip, ua });
  return NextResponse.json({ ok: true });
}
