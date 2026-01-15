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

  const user = await prisma.users.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, plan: true, role: true },
  });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const today = startOfDayUTC(new Date());
  const usageToday = await prisma.usageDays.upsert({
    where: { userId: user.id, day: today },
    update: {},
    create: { userId: user.id, day: today },
    select: { id: true, insightsUsed: true },
  });

  // Substitui aggregate por consulta SQL direta
  const totalPointsAgg = await prisma.query('SELECT SUM(points) as total FROM "UsageDay" WHERE "userId" = $1', [user.id]);
  const totalPoints = totalPointsAgg.rows[0]?.total || 0;

  const lvl = levelFromPoints(totalPoints);

  // Substitui findMany por consulta SQL direta
  const badgesRes = await prisma.query('SELECT key, "createdAt" FROM "BadgeUnlock" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [user.id]);
  const badges = badgesRes.rows;

  // Ranking simbólico: não competitivo tóxico (top 10 apenas como referência)
  const topRes = await prisma.query('SELECT "userId", SUM(points) as total FROM "UsageDay" GROUP BY "userId" ORDER BY total DESC LIMIT 10');
  const top = topRes.rows;

  const position = top.findIndex((t: { userId: string }) => t.userId === user.id);

  return NextResponse.json({
    user,
    points: {
      today: usageToday?.points ?? 0,
      total: totalPoints,
      level: lvl.level,
      nextAt: lvl.nextAt,
      rankLabel: rankLabelFromPoints(totalPoints),
      top10: top.map((t, idx) => ({ position: idx + 1, userId: t.userId, points: Number(t.total ?? 0) })),
      top10Position: position >= 0 ? position + 1 : null,
    },
    usage: {
      signalsSeenToday: usageToday?.signalsSeen ?? 0,
    },
    badges,
  });
}
