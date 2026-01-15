import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientIp } from "@/lib/rateLimit";
import { attachUaField, getUa } from "@/lib/ua";
import { signSessionJwt } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Feature gate: only active when explicitly enabled
  const enabled = process.env.TEST_LOGIN_BYPASS_ENABLED === "true";
  const secret = process.env.TEST_LOGIN_BYPASS_TOKEN;
  if (process.env.NODE_ENV === "production" || !enabled || !secret) {
    return NextResponse.json({ error: "not_enabled" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const token = body?.token;
  const email = (body?.email || process.env.SMOKE_TEST_EMAIL || process.env.ADMIN_EMAIL)?.toLowerCase();
  if (!token || token !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!email) {
    return NextResponse.json({ error: "missing_email" }, { status: 400 });
  }

  const ip = getClientIp(req);
  const ua = getUa(req.headers);

  // Upsert user (safe for idempotent test calls)
  let user;
  try {
    console.time('db_upsert');
    user = await prisma.users.upsert({
      where: { email },
      update: { emailVerified: true },
      create: { email, emailVerified: true },
      select: { id: true, email: true, plan: true, role: true },
    });
    console.timeEnd('db_upsert');
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('login-bypass: upsert error', errMsg);
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  // Create session row
  let session;
  try {
    console.time('db_session_create');
    session = await prisma.sessions.create(
      attachUaField({ userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000), ip }, ua) as any
    );
    console.timeEnd('db_session_create');
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
    console.error('login-bypass: create session error', errMsg);
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const jwt = await signSessionJwt({ sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id }, 30 * 24 * 60 * 60);

  const res = NextResponse.json({ ok: true });
  const isProdEnv = (process.env.NODE_ENV as string) === "production";
  res.cookies.set({ name: "em_session", value: jwt, httpOnly: true, secure: isProdEnv, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  return res;
}

export async function GET(req: Request) {
  // Non-sensitive check: return whether bypass is enabled (value may be encrypted on Vercel)
  const isProdEnv = (process.env.NODE_ENV as string) === "production";
  const enabled = process.env.TEST_LOGIN_BYPASS_ENABLED === "true" && !isProdEnv;
  return NextResponse.json({ enabled });
}
