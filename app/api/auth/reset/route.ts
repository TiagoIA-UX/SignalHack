import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sha256 } from "@/lib/token";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";
import { signSessionJwt } from "@/lib/auth";
import { captureException, getRequestIdFromHeaders, logEvent } from "@/lib/logger";
import { attachUaField, getUa } from "@/lib/ua";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
  token: z.string().min(10).max(512),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  const rl = await rateLimitAsync(`auth:reset:${ip}`, { windowMs: 10 * 60_000, max: 20 });
  if (!rl.ok) {
    logEvent("warn", "auth.reset.rate_limited", { requestId, path: "/api/auth/reset", method: "POST", status: 429, ip, ua });
    await logAccess({ path: "/api/auth/reset", method: "POST", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logEvent("warn", "auth.reset.invalid_request", { requestId, path: "/api/auth/reset", method: "POST", status: 400, ip, ua });
    await logAccess({ path: "/api/auth/reset", method: "POST", status: 400, ip, ua });
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const pepper = process.env.AUTH_TOKEN_PEPPER;
  if (!pepper || pepper.length < 16) {
    logEvent("error", "auth.reset.not_configured", { requestId, path: "/api/auth/reset", method: "POST", status: 503, ip, ua });
    await logAccess({ path: "/api/auth/reset", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const tokenHash = sha256(`${parsed.data.token}:${pepper}`);

  try {
    const now = new Date();
    const tokenRow = await prisma.authToken.findFirst({
      where: {
        type: "PASSWORD_RESET",
        identifier: email,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      select: { id: true, userId: true },
    });

    if (!tokenRow || !tokenRow.userId) {
      logEvent("warn", "auth.reset.invalid_token", { requestId, path: "/api/auth/reset", method: "POST", status: 400, ip, ua, extra: { email } });
      await logAccess({ path: "/api/auth/reset", method: "POST", status: 400, ip, ua });
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await prisma.user.findUnique({ where: { id: tokenRow.userId } });
    if (!user) {
      logEvent("warn", "auth.reset.invalid_token", { requestId, path: "/api/auth/reset", method: "POST", status: 400, ip, ua, extra: { email } });
      await logAccess({ path: "/api/auth/reset", method: "POST", status: 400, ip, ua });
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }

    const session = await prisma.$transaction(async (tx) => {
      await tx.authToken.update({ where: { id: tokenRow.id }, data: { consumedAt: now } });
      await tx.user.update({ where: { id: user.id }, data: { passwordHash, emailVerified: true } });
      const created = await tx.session.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
          ip,
          ...attachUaField({}, ua),
        },
        select: { id: true },
      });
      return created;
    });

    const jwt = await signSessionJwt({ sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id }, 30 * 24 * 60 * 60);

    await logAccess({ userId: user.id, path: "/api/auth/reset", method: "POST", status: 200, ip, ua });
    logEvent("info", "auth.reset.ok", { requestId, userId: user.id, path: "/api/auth/reset", method: "POST", status: 200, ip, ua });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: "em_session",
      value: jwt,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch (err) {
    if (isDbUnavailableError(err)) {
      captureException(err, { requestId, path: "/api/auth/reset", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "auth.reset.db_unavailable", { requestId, path: "/api/auth/reset", method: "POST", status: 503, ip, ua });
      await logAccess({ path: "/api/auth/reset", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    captureException(err, { requestId, path: "/api/auth/reset", method: "POST", status: 500, ip, ua });
    throw err;
  }
}
