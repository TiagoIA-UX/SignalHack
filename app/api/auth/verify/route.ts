import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { sha256, timingSafeEqualHex } from "@/lib/token";
import { SESSION_COOKIE, signSessionJwt } from "@/lib/auth";
import { logAccess } from "@/lib/accessLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const querySchema = z.object({
  email: z.string().email().max(320),
  token: z.string().min(10).max(500),
});

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = rateLimit(`auth:verify:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) {
    await logAccess({ path: "/api/auth/verify", method: "GET", status: 429, ip, userAgent: ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    email: url.searchParams.get("email"),
    token: url.searchParams.get("token"),
  });

  if (!parsed.success) {
    await logAccess({ path: "/api/auth/verify", method: "GET", status: 400, ip, userAgent: ua });
    return NextResponse.json({ error: "invalid_link" }, { status: 400 });
  }

  const env = getEnv();
  const email = parsed.data.email.toLowerCase();
  const tokenHash = sha256(`${env.AUTH_TOKEN_PEPPER}:${parsed.data.token}`);

  const record = await prisma.authToken.findFirst({
    where: {
      type: "MAGIC_LINK",
      identifier: email,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, tokenHash: true, userId: true },
  });

  if (!record || !timingSafeEqualHex(record.tokenHash, tokenHash)) {
    await logAccess({ path: "/api/auth/verify", method: "GET", status: 401, ip, userAgent: ua });
    return NextResponse.json({ error: "invalid_or_expired" }, { status: 401 });
  }

  await prisma.authToken.update({ where: { id: record.id }, data: { consumedAt: new Date() } });

  const user = await prisma.user.findUnique({
    where: { id: record.userId! },
    select: { id: true, email: true, plan: true, role: true },
  });

  if (!user) {
    await logAccess({ path: "/api/auth/verify", method: "GET", status: 404, ip, userAgent: ua });
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
      ip,
      userAgent: ua,
    },
    select: { id: true },
  });

  const today = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
  await prisma.usageDay.upsert({
    where: { userId_day: { userId: user.id, day: today } },
    update: { points: { increment: 10 } },
    create: { userId: user.id, day: today, points: 10 },
  });
  await prisma.badgeUnlock.upsert({
    where: { userId_key: { userId: user.id, key: "first_login" } },
    update: {},
    create: { userId: user.id, key: "first_login" },
  });

  const jwt = await signSessionJwt(
    { sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id },
    30 * 24 * 60 * 60
  );

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set({
    name: SESSION_COOKIE,
    value: jwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  await logAccess({ userId: user.id, path: "/api/auth/verify", method: "GET", status: 302, ip, userAgent: ua });
  return res;
}
