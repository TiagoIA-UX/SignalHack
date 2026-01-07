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
  // Endpoint removido. Login por email+senha agora é feito via /api/auth/login.
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
