import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { isDbUnavailableError } from "@/lib/dbError";
import { logAccess } from "@/lib/accessLog";
import { Prisma } from "@prisma/client";
import { generateWeeklyBriefWithGroq, type WeeklyBrief } from "@/services/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function startOfWeekUTC(d: Date) {
  // Segunda-feira como início da semana
  const day = d.getUTCDay(); // 0=Dom
  const diff = (day + 6) % 7; // seg->0, dom->6
  const base = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  base.setUTCDate(base.getUTCDate() - diff);
  return base;
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = await rateLimitAsync(`brief:get:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let session;
  try {
    session = await verifySessionJwt(token);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, plan: true, role: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const adminBypass = process.env.NODE_ENV !== "production" && user.role === "ADMIN";
  if (!adminBypass && user.plan === "FREE") {
    await logAccess({ userId: user.id, path: "/api/brief", method: "GET", status: 402, ip, userAgent: ua });
    return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
  }

  const weekStart = startOfWeekUTC(new Date());

  let existing;
  try {
    existing = await prisma.weeklyBrief.findUnique({
      where: { userId_weekStart: { userId: user.id, weekStart } },
      select: { id: true, content: true, updatedAt: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  if (existing) {
    await logAccess({ userId: user.id, path: "/api/brief", method: "GET", status: 200, ip, userAgent: ua });
    return NextResponse.json({ brief: existing.content, cached: true, weekStart: weekStart.toISOString() });
  }

  const since = new Date(weekStart.getTime() - 7 * 24 * 60 * 60_000);

  let signals;
  try {
    signals = await prisma.signal.findMany({
      where: { userId: user.id, createdAt: { gte: since } },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        title: true,
        summary: true,
        source: true,
        intent: true,
        score: true,
        growthPct: true,
      },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  if (!signals || signals.length === 0) {
    await logAccess({ userId: user.id, path: "/api/brief", method: "GET", status: 200, ip, userAgent: ua });
    return NextResponse.json({
      brief: {
        headline: "Brief semanal",
        summary: "Sem sinais suficientes nesta semana para gerar um briefing.",
        windowsOpen: [],
        windowsClosing: [],
        priorities: [],
        disclaimer: "IA ajuda a interpretar e priorizar; decisão final é humana.",
      },
      cached: false,
      weekStart: weekStart.toISOString(),
    });
  }

  let brief: WeeklyBrief;
  try {
    brief = await generateWeeklyBriefWithGroq({ signals });
  } catch {
    await logAccess({ userId: user.id, path: "/api/brief", method: "GET", status: 503, ip, userAgent: ua });
    return NextResponse.json(
      { error: "ai_not_configured", message: "Configure GROQ_API_KEY (ou o segredo groq_api_key) para gerar o brief semanal." },
      { status: 503 },
    );
  }

  try {
    await prisma.weeklyBrief.create({
      data: {
        userId: user.id,
        weekStart,
        content: brief as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  await logAccess({ userId: user.id, path: "/api/brief", method: "GET", status: 200, ip, userAgent: ua });
  return NextResponse.json({ brief, cached: false, weekStart: weekStart.toISOString() });
}
