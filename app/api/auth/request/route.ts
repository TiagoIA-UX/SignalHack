import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAppUrl, getEnv } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { randomToken, sha256 } from "@/lib/token";
import { logAccess } from "@/lib/accessLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = rateLimit(`auth:request:${ip}`, { windowMs: 60_000, max: 5 });
  if (!rl.ok) {
    await logAccess({ path: "/api/auth/request", method: "POST", status: 429, ip, userAgent: ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    await logAccess({ path: "/api/auth/request", method: "POST", status: 400, ip, userAgent: ua });
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const env = getEnv();
  const email = parsed.data.email.toLowerCase();

  const adminEmail = env.ADMIN_EMAIL?.toLowerCase();
  const shouldBeAdmin = !!adminEmail && email === adminEmail;

  const user = await prisma.user.upsert({
    where: { email },
    update: shouldBeAdmin ? { role: "ADMIN" } : {},
    create: { email, role: shouldBeAdmin ? "ADMIN" : "USER" },
    select: { id: true, email: true },
  });

  const token = randomToken(32);
  const tokenHash = sha256(`${env.AUTH_TOKEN_PEPPER}:${token}`);

  await prisma.authToken.create({
    data: {
      identifier: email,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60_000),
      ip,
      userAgent: ua,
      userId: user.id,
      // type removido (magic link)
    },
  });

  const url = new URL("/api/auth/verify", getAppUrl());
  // Lógica de magic link removida

  await logAccess({ userId: user.id, path: "/api/auth/request", method: "POST", status: 200, ip, userAgent: ua });
  return NextResponse.json({ ok: true });
}
