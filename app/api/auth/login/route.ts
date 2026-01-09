import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signSessionJwt } from "@/lib/auth";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";

const bodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = await rateLimitAsync(`auth:login:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) {
    await logAccess({ path: "/api/auth/login", method: "POST", status: 429, ip, userAgent: ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    await logAccess({ path: "/api/auth/login", method: "POST", status: 400, ip, userAgent: ua });
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const lower = email.toLowerCase();

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: lower } });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      await logAccess({ path: "/api/auth/login", method: "POST", status: 503, ip, userAgent: ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    throw err;
  }
  if (!user || !user.passwordHash) {
    await logAccess({ path: "/api/auth/login", method: "POST", status: 401, ip, userAgent: ua });
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(user.passwordHash, password);
  if (!ok) {
    await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 401, ip, userAgent: ua });
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  let session;
  try {
    session = await prisma.session.create({
      data: { userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000), ip, userAgent: ua },
      select: { id: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 503, ip, userAgent: ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    throw err;
  }

  const jwt = await signSessionJwt({ sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id }, 30 * 24 * 60 * 60);

  await logAccess({ userId: user.id, path: "/api/auth/login", method: "POST", status: 200, ip, userAgent: ua });

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "em_session", value: jwt, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
