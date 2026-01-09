import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { SESSION_COOKIE, signSessionJwt } from "@/lib/auth";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  token: z.string().min(16).max(512),
});

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = await rateLimitAsync(`auth:bootstrap:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.ok) {
    await logAccess({ path: "/api/auth/bootstrap", method: "GET", status: 429, ip, userAgent: ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const env = getEnv();
  const expected = env.ADMIN_BOOTSTRAP_TOKEN;
  if (!expected) {
    await logAccess({ path: "/api/auth/bootstrap", method: "GET", status: 404, ip, userAgent: ua });
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ token: url.searchParams.get("token") });
  if (!parsed.success || parsed.data.token !== expected) {
    await logAccess({ path: "/api/auth/bootstrap", method: "GET", status: 403, ip, userAgent: ua });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const adminEmail = env.ADMIN_EMAIL?.toLowerCase();
  if (!adminEmail) {
    await logAccess({ path: "/api/auth/bootstrap", method: "GET", status: 500, ip, userAgent: ua });
    return NextResponse.json({ error: "admin_not_configured" }, { status: 500 });
  }

  let user;
  try {
    user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
      create: { email: adminEmail, role: "ADMIN" },
      select: { id: true, email: true, plan: true, role: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      await logAccess({ path: "/api/auth/bootstrap", method: "GET", status: 503, ip, userAgent: ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    throw err;
  }

  let session;
  try {
    session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
        ip,
        userAgent: ua,
      },
      select: { id: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      await logAccess({ userId: user.id, path: "/api/auth/bootstrap", method: "GET", status: 503, ip, userAgent: ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    throw err;
  }

  const jwt = await signSessionJwt(
    { sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id },
    30 * 24 * 60 * 60
  );

  const res = NextResponse.redirect(new URL("/admin/settings", req.url));
  res.cookies.set({
    name: SESSION_COOKIE,
    value: jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  await logAccess({ userId: user.id, path: "/api/auth/bootstrap", method: "GET", status: 302, ip, userAgent: ua });
  return res;
}
