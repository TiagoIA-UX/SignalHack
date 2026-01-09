import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDbUnavailableError } from "@/lib/dbError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ user: null }, { status: 200 });

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, plan: true, role: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    throw err;
  }

  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      role: user.role,
    },
  });
}
