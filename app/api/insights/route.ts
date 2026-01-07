import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { analyzeSignalWithGroq } from "@/services/groq";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  signalId: z.string().min(10),
});

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = rateLimit(`insights:post:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let session;
  try {
    session = await verifySessionJwt(token);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true, plan: true } });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (user.plan === "FREE") {
    await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 402, ip, userAgent: ua });
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  const signal = await prisma.signal.findFirst({
    where: { id: parsed.data.signalId, userId: user.id },
    select: { id: true, title: true, summary: true },
  });
  if (!signal) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const existing = await prisma.insight.findFirst({
    where: { signalId: signal.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, strategic: true, actionable: true, confidence: true },
  });
  if (existing) {
    await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 200, ip, userAgent: ua });
    return NextResponse.json({ insight: existing, cached: true });
  }

  // Enforce PRO daily limit server-side (client-side localStorage can be bypassed).
  if (user.plan === "PRO") {
    const today = startOfDayUTC(new Date());
    const usage = await prisma.usageDay.upsert({
      where: { userId_day: { userId: user.id, day: today } },
      update: {},
      create: { userId: user.id, day: today },
      select: { id: true, insightsUsed: true },
    });

    if (usage.insightsUsed >= 5) {
      await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 402, ip, userAgent: ua });
      return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
    }
  }

  let analysis;
  try {
    analysis = await analyzeSignalWithGroq({ title: signal.title, summary: signal.summary });
  } catch {
    await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 503, ip, userAgent: ua });
    return NextResponse.json({ error: "insight_unavailable" }, { status: 503 });
  }

  const insight = await prisma.insight.create({
    data: {
      signalId: signal.id,
      strategic: analysis.strategic,
      actionable: analysis.actionable,
      confidence: Math.min(95, Math.max(50, Math.round(analysis.score))),
      model: process.env.GROQ_API_KEY ? "groq" : "mock",
    },
    select: { id: true, strategic: true, actionable: true, confidence: true },
  });

  await prisma.badgeUnlock.upsert({
    where: { userId_key: { userId: user.id, key: "first_insight" } },
    update: {},
    create: { userId: user.id, key: "first_insight" },
  });

  await prisma.usageDay.updateMany({
    where: { userId: user.id, day: { gte: new Date(Date.now() - 36 * 60 * 60_000) } },
    data: { points: { increment: 5 } },
  });

  if (user.plan === "PRO") {
    const today = startOfDayUTC(new Date());
    await prisma.usageDay.update({
      where: { userId_day: { userId: user.id, day: today } },
      data: { insightsUsed: { increment: 1 } },
    });
  }

  await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 200, ip, userAgent: ua });
  return NextResponse.json({ insight, cached: false });
}
