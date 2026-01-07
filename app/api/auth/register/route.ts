import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signSessionJwt } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const { email, password, name } = parsed.data;
  const lower = email.toLowerCase();

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email: lower }, select: { id: true, passwordHash: true } });
  if (existing && existing.passwordHash) {
    return NextResponse.json({ error: "user_exists" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email: lower },
    update: { passwordHash, name: name ?? undefined, emailVerified: true },
    create: { email: lower, passwordHash, name: name ?? undefined },
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000),
    },
    select: { id: true },
  });

  const jwt = await signSessionJwt({ sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id }, 30 * 24 * 60 * 60);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: "em_session", value: jwt, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  return res;
}
