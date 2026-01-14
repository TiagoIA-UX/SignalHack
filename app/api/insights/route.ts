import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { analyzeSignalWithGroq } from "@/services/groq";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";
import { getUa } from "@/lib/ua";

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
  const ua = getUa(req.headers);

  const rl = await rateLimitAsync(`insights:post:${ip}`, { windowMs: 60_000, max: 30 });
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

  let user;
  try {
    user = await prisma.users.findUnique({ where: { id: session.sub }, select: { id: true, plan: true, role: true } });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const adminBypass = user.role === "ADMIN";

  if (!adminBypass && user.plan === "FREE") {
    await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 402, ip, ua });
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  let signal;
  try {
    signal = await prisma.signals.findFirst({
      where: { id: parsed.data.signalId, userId: user.id },
      select: { id: true, title: true, summary: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }
  if (!signal) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let existing;
  try {
    existing = await prisma.insights.findFirst({
      where: { signalId: signal.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, strategic: true, actionable: true, confidence: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }
  if (existing) {
    await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 200, ip, ua });
    return NextResponse.json({ insight: existing, cached: true });
  }

  // Enforce PRO daily limit server-side (client-side localStorage can be bypassed).
  if (!adminBypass && user.plan === "PRO") {
    const today = startOfDayUTC(new Date());
    let usage;
    try {
      usage = await prisma.usageDays.upsert({
        where: { userId: user.id, day: today },
        update: {},
        create: { userId: user.id, day: today },
        select: { id: true, insightsUsed: true },
      });
    } catch (err) {
      if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      throw err;
    }

    if (usage.insightsUsed >= 5) {
      await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 402, ip, ua });
      return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
    }
  }

  let analysis;
  try {
    analysis = await analyzeSignalWithGroq({ title: signal.title, summary: signal.summary });
  } catch (err) {
    await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 503, ip, ua });
    const msg = err instanceof Error ? err.message : "";
    if (msg === "groq_not_configured") {
      return NextResponse.json(
        {
          error: "ai_not_configured",
          message:
            "IA não está configurada. Defina GROQ_API_KEY no .env (ou salve o segredo groq_api_key) e reinicie o servidor de dev.",
        },
        { status: 503 }
      );
    }

    console.error("[insights] Groq failed:", msg || err);
    return NextResponse.json(
      {
        error: "ai_failed",
        message: "IA indisponível agora. Verifique se GROQ_API_KEY/GROQ_MODEL estão válidos e tente novamente.",
      },
      { status: 503 }
    );
  }

  let insight;
  try {
    insight = await prisma.insights.create({
      signalId: signal.id,
      strategic: analysis.strategic,
      actionable: analysis.actionable,
      confidence: Math.min(95, Math.max(50, Math.round(analysis.score))),
      model: "groq",
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  try {
    await prisma.badgeUnlocks.upsert({
      where: { userId: user.id, key: "first_insight" },
      update: {},
      create: { userId: user.id, key: "first_insight" },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  try {
    await prisma.usageDays.updateMany({
      where: { userId: user.id, day: { gte: new Date(Date.now() - 36 * 60 * 60_000) } },
      data: { points: { increment: 5 } },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  if (!adminBypass && user.plan === "PRO") {
    const today = startOfDayUTC(new Date());
    try {
      await prisma.usageDays.update({
        where: { userId_day: { userId: user.id, day: today } },
        data: { insightsUsed: { increment: 1 } },
      });
    } catch (err) {
      if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      throw err;
    }
  }

  await logAccess({ userId: user.id, path: "/api/insights", method: "POST", status: 200, ip, ua });
  return NextResponse.json({ insight, cached: false });
}
