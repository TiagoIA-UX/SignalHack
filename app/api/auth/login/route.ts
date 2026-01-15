import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSessionJwt } from "@/lib/auth";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";
import { captureException, getRequestIdFromHeaders, logEvent } from "@/lib/logger";
import { attachUaField, getUa } from "@/lib/ua";

const bodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return NextResponse.json({ error: "login_disabled" }, { status: 405 });
}

export async function POST_DISABLED(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  try {
    // Parse body early so we can apply more granular rate-limit / whitelist behavior
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      logEvent("warn", "auth.login.invalid_request", { requestId, path: "/api/auth/login", method: "POST", status: 400, ip, ua });
      await logAccess({ path: "/api/auth/login", method: "POST", status: 400, ip, ua });
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const lower = email.toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD?.replace(/\r/g, "").replace(/\n/g, "").trim();
    const isAdminRescue = Boolean(adminEmail && adminPassword && lower === adminEmail);

    // Whitelist support: ADMIN_LOGIN_WHITELIST env (comma-separated) falls back to the known admin
    const whitelistRaw = process.env.ADMIN_LOGIN_WHITELIST || '';
    const whitelist = whitelistRaw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (adminEmail && !whitelist.includes(adminEmail)) whitelist.push(adminEmail);
    const isWhitelisted = whitelist.includes(lower);

    // Rate limit desabilitado para evitar bloqueio em produção.
    const wasRateLimited = false;

    let user;
    try {
      user = await prisma.users.findUnique({ where: { email: lower } });
    } catch (err) {
      if (isDbUnavailableError(err)) {
        captureException(err, { requestId, path: "/api/auth/login", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
        logEvent("error", "auth.login.db_unavailable", { requestId, path: "/api/auth/login", method: "POST", status: 503, ip, ua });
        await logAccess({ path: "/api/auth/login", method: "POST", status: 503, ip, ua });
        return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      }
      captureException(err, { requestId, path: "/api/auth/login", method: "POST", status: 500, ip, ua });
      throw err;
    }
    let ok = false;
    const isAdminBypass = Boolean(isAdminRescue && password === adminPassword);

    if (isAdminBypass) {
      // Admin rescue bypass: avoid argon2 dependency when not available in production.
      const passwordHash = user?.passwordHash?.startsWith("admin_rescue:") ? user.passwordHash : `admin_rescue:${Date.now()}`;
      user = await prisma.users.upsert({
        where: { email: lower },
        update: { passwordHash, role: "ADMIN", emailVerified: true },
        create: { email: lower, passwordHash, role: "ADMIN", emailVerified: true },
      });
      ok = true;
      logEvent("warn", "auth.login.admin_rescue", { requestId, path: "/api/auth/login", method: "POST", status: 200, ip, ua, extra: { email: lower } });
    } else {
      if (!user || !user.passwordHash) {
        logEvent("warn", "auth.login.invalid_credentials", { requestId, path: "/api/auth/login", method: "POST", status: 401, ip, ua });
        await logAccess({ path: "/api/auth/login", method: "POST", status: 401, ip, ua });
        if (wasRateLimited) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
        return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
      }
      try {
        const { verifyPassword } = await import("@/lib/password");
        ok = await verifyPassword(user.passwordHash, password);
      } catch (err) {
        console.error('auth.login: password verification error', err instanceof Error ? err.message : err);
        captureException(err, { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 500, ip, ua });
        // Avoid 500 loop; treat as invalid credentials if password check is unavailable.
        return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
      }
    }

  if (!ok && isAdminRescue && password === adminPassword) {
    const { hashPassword } = await import("@/lib/password");
    const passwordHash = await hashPassword(password);
    user = await prisma.users.update({ id: user.id }, { passwordHash, role: "ADMIN", emailVerified: true });
    ok = true;
    logEvent("warn", "auth.login.admin_rescue", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 200, ip, ua, extra: { email: lower } });
  }

  if (!ok) {
    logEvent("warn", "auth.login.invalid_credentials", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 401, ip, ua });
    await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 401, ip, ua });
    if (wasRateLimited) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  let session;
  try {
    session = await prisma.sessions.create(
      attachUaField({ userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000), ip }, ua) as any
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('auth.login: session create error', errMsg);
    if (isDbUnavailableError(err)) {
      captureException(err, { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "auth.login.db_unavailable", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua });
      await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    captureException(err, { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 500, ip, ua });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  let jwt: string;
  try {
    jwt = await signSessionJwt(
      { sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id },
      30 * 24 * 60 * 60
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logEvent("error", "auth.login.jwt_sign_failed", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua, extra: { err: errMsg } });
    await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 200, ip, ua });
  logEvent("info", "auth.login.ok", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 200, ip, ua });

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "em_session", value: jwt, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
    return res;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    captureException(err, { requestId, path: "/api/auth/login", method: "POST", status: 500, ip, ua });
    logEvent("error", "auth.login.unhandled", { requestId, path: "/api/auth/login", method: "POST", status: 500, ip, ua, extra: { err: errMsg } });
    await logAccess({ path: "/api/auth/login", method: "POST", status: 500, ip, ua });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
