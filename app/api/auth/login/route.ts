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
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  const rl = await rateLimitAsync(`auth:login:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) {
    logEvent("warn", "auth.login.rate_limited", { requestId, path: "/api/auth/login", method: "POST", status: 429, ip, ua });
    await logAccess({ path: "/api/auth/login", method: "POST", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logEvent("warn", "auth.login.invalid_request", { requestId, path: "/api/auth/login", method: "POST", status: 400, ip, ua });
    await logAccess({ path: "/api/auth/login", method: "POST", status: 400, ip, ua });
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const lower = email.toLowerCase();

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
  if (!user || !user.passwordHash) {
    logEvent("warn", "auth.login.invalid_credentials", { requestId, path: "/api/auth/login", method: "POST", status: 401, ip, ua });
    await logAccess({ path: "/api/auth/login", method: "POST", status: 401, ip, ua });
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const ok = password === user.passwordHash;
  if (!ok) {
    logEvent("warn", "auth.login.invalid_credentials", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 401, ip, ua });
    await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 401, ip, ua });
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  let session;
  try {
    session = await prisma.sessions.create(
      attachUaField({ userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000), ip }, ua) as any
    );
  } catch (err) {
    if (isDbUnavailableError(err)) {
      captureException(err, { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "auth.login.db_unavailable", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua });
      await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    captureException(err, { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 500, ip, ua });
    throw err;
  }

  const jwt = await signSessionJwt({ sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id }, 30 * 24 * 60 * 60);

  await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 200, ip, ua });
  logEvent("info", "auth.login.ok", { requestId, userId: user.id, path: "/api/auth/login", method: "POST", status: 200, ip, ua });

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "em_session", value: jwt, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
