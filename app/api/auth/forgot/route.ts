import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomToken, sha256 } from "@/lib/token";
import { getAppUrl } from "@/lib/env";
import { sendPasswordResetEmail } from "@/services/email";

const bodySchema = z.object({ email: z.string().email().max(320) });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true }); // do not reveal existence

  const token = randomToken(32);
  const tokenHash = sha256(`${process.env.AUTH_TOKEN_PEPPER}:${token}`);

  await prisma.authToken.create({
    data: {
      identifier: email,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60_1000), // 1 hour
      ip: null,
      userAgent: null,
      userId: user.id,
      type: "PASSWORD_RESET",
    },
  });

  const url = new URL('/reset', getAppUrl());
  url.searchParams.set('email', email);
  url.searchParams.set('token', token);

  try {
    await sendPasswordResetEmail({ to: email, url: url.toString() });
  } catch (e) {
    console.error('Password reset email send failed', e);
  }

  return NextResponse.json({ ok: true });
}
