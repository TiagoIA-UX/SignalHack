import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sha256 } from "@/lib/token";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";
import { signSessionJwt } from "@/lib/auth";
import { captureException, getRequestIdFromHeaders, logEvent } from "@/lib/logger";
import { attachUaField, getUa } from "@/lib/ua";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  email: z.string().email().max(320),
  token: z.string().min(10).max(512),
  next: z.string().max(512).optional(),
});

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  const rl = await rateLimitAsync(`auth:magic:verify:${ip}`, { windowMs: 10 * 60_000, max: 30 });
  if (!rl.ok) {
    logEvent("warn", "auth.magic.verify.rate_limited", { requestId, path: "/api/auth/verify", method: "GET", status: 429, ip, ua });
    await logAccess({ path: "/api/auth/verify", method: "GET", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    email: url.searchParams.get("email"),
    token: url.searchParams.get("token"),
    next: url.searchParams.get("next") ?? undefined,
  });

  const nextPath = parsed.success ? parsed.data.next : undefined;
  const redirectTarget = (() => {
    if (!nextPath) return "/dashboard";
    // Evita open redirect.
    if (!nextPath.startsWith("/")) return "/dashboard";
    if (nextPath.startsWith("//")) return "/dashboard";
    return nextPath;
  })();

  if (!parsed.success) {
    logEvent("warn", "auth.magic.verify.invalid_request", { requestId, path: "/api/auth/verify", method: "GET", status: 400, ip, ua });
    await logAccess({ path: "/api/auth/verify", method: "GET", status: 400, ip, ua });
    return NextResponse.redirect(new URL(`/login?error=invalid_link`, req.url));
  }

  const email = parsed.data.email.toLowerCase();
  const pepper = process.env.AUTH_TOKEN_PEPPER;
  if (!pepper || pepper.length < 16) {
    logEvent("error", "auth.magic.verify.not_configured", { requestId, path: "/api/auth/verify", method: "GET", status: 503, ip, ua });
    await logAccess({ path: "/api/auth/verify", method: "GET", status: 503, ip, ua });
    return NextResponse.redirect(new URL(`/login?error=not_configured`, req.url));
  }

  const tokenHash = sha256(`${parsed.data.token}:${pepper}`);

  try {
    const now = new Date();
    const tokenRow = await prisma.authTokens.findFirst({
      where: {
        type: "MAGIC_LINK",
        identifier: email,
        tokenHash,
        consumedAt: null,
        expiresAt: { gt: now },
      },
      select: { id: true, userId: true },
    });

    if (!tokenRow || !tokenRow.userId) {
      logEvent("warn", "auth.magic.verify.invalid_token", { requestId, path: "/api/auth/verify", method: "GET", status: 400, ip, ua, extra: { email } });
      await logAccess({ path: "/api/auth/verify", method: "GET", status: 400, ip, ua });
      return NextResponse.redirect(new URL(`/login?error=expired_or_invalid`, req.url));
    }

    const user = await prisma.users.findUnique({ where: { id: tokenRow.userId } });
    if (!user) {
      logEvent("warn", "auth.magic.verify.invalid_token", { requestId, path: "/api/auth/verify", method: "GET", status: 400, ip, ua, extra: { email } });
      await logAccess({ path: "/api/auth/verify", method: "GET", status: 400, ip, ua });
      return NextResponse.redirect(new URL(`/login?error=expired_or_invalid`, req.url));
    }

    await prisma.authTokens.update({ where: { id: tokenRow.id }, data: { consumedAt: now } });
    await prisma.users.update({ id: user.id }, { emailVerified: true });
    const session = await prisma.sessions.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
      ip,
      ...attachUaField({}, ua),
    });

    const jwt = await signSessionJwt(
      { sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id },
      30 * 24 * 60 * 60
    );

    await logAccess({ userId: user.id, path: "/api/auth/verify", method: "GET", status: 302, ip, ua });
    logEvent("info", "auth.magic.verify.ok", { requestId, userId: user.id, path: "/api/auth/verify", method: "GET", status: 302, ip, ua });

    const res = NextResponse.redirect(new URL(redirectTarget, req.url));
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
      captureException(err, { requestId, path: "/api/auth/verify", method: "GET", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "auth.magic.verify.db_unavailable", { requestId, path: "/api/auth/verify", method: "GET", status: 503, ip, ua });
      await logAccess({ path: "/api/auth/verify", method: "GET", status: 503, ip, ua });
      return NextResponse.redirect(new URL(`/login?error=db_unavailable`, req.url));
    }
    captureException(err, { requestId, path: "/api/auth/verify", method: "GET", status: 500, ip, ua });
    throw err;
  }
}
