import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { levelFromPoints, rankLabelFromPoints } from "@/lib/gamification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let session;
  try {
    session = await verifySessionJwt(token);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, plan: true, role: true },
  });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const today = startOfDayUTC(new Date());
  const usageToday = await prisma.usageDay.findUnique({
    where: { userId_day: { userId: user.id, day: today } },
    select: { points: true, signalsSeen: true },
  });

  const totalPointsAgg = await prisma.usageDay.aggregate({
    where: { userId: user.id },
    _sum: { points: true },
  });
  const totalPoints = totalPointsAgg._sum.points ?? 0;

  const lvl = levelFromPoints(totalPoints);

  const badges = await prisma.badgeUnlock.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { key: true, createdAt: true },
    take: 20,
  });

  // Ranking simbólico: não competitivo tóxico (top 10 apenas como referência)
  const top = await prisma.usageDay.groupBy({
    by: ["userId"],
    _sum: { points: true },
    orderBy: { _sum: { points: "desc" } },
    take: 10,
  });

  const position = top.findIndex((t) => t.userId === user.id);

  return NextResponse.json({
    user,
    points: {
      today: usageToday?.points ?? 0,
      total: totalPoints,
      level: lvl.level,
      nextAt: lvl.nextAt,
      rankLabel: rankLabelFromPoints(totalPoints),
      top10: top.map((t, idx) => ({ position: idx + 1, userId: t.userId, points: t._sum.points ?? 0 })),
      top10Position: position >= 0 ? position + 1 : null,
    },
    usage: {
      signalsSeenToday: usageToday?.signalsSeen ?? 0,
    },
    badges,
  });
}
