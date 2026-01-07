import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sha256, timingSafeEqualHex } from "@/lib/token";
import { verifyPassword, hashPassword } from "@/lib/password";
import { signSessionJwt } from "@/lib/auth";

const bodySchema = z.object({ email: z.string().email().max(320), token: z.string().min(8), password: z.string().min(8).max(128) });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const { email, token, password } = parsed.data;
  const tokenHash = sha256(`${process.env.AUTH_TOKEN_PEPPER}:${token}`);

  const authToken = await prisma.authToken.findFirst({ where: { identifier: email, type: "PASSWORD_RESET" }, orderBy: { createdAt: "desc" } });
  if (!authToken) return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  if (authToken.consumedAt) return NextResponse.json({ error: "token_consumed" }, { status: 400 });
  if (authToken.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "token_expired" }, { status: 400 });

  if (!timingSafeEqualHex(authToken.tokenHash, tokenHash)) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

  const newHash = await hashPassword(password);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash, emailVerified: true } });

  await prisma.authToken.update({ where: { id: authToken.id }, data: { consumedAt: new Date() } });

  const session = await prisma.session.create({ data: { userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000) }, select: { id: true } });

  const jwt = await signSessionJwt({ sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id }, 30 * 24 * 60 * 60);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "em_session", value: jwt, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
