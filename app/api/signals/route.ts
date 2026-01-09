import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { isDbUnavailableError } from "@/lib/dbError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const qRaw = url.searchParams.get("q");
  const q = qRaw ? qRaw.trim() : "";

  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = await rateLimitAsync(`signals:get:${ip}`, { windowMs: 60_000, max: 60 });
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

  // Modo histórico pesquisável (não consome limite do Free e não incrementa signalsSeen)
  if (q.length > 0) {
    if (!adminBypass && user.plan === "FREE") {
      await logAccess({ userId: user.id, path: "/api/signals", method: "GET", status: 402, ip, userAgent: ua });
      return NextResponse.json({ error: "upgrade_required" }, { status: 402 });
    }

    let matches;
    try {
      matches = await prisma.signal.findMany({
        where: {
          userId: user.id,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { source: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        take: 100,
        select: {
          id: true,
          title: true,
          summary: true,
          source: true,
          intent: true,
          score: true,
          growthPct: true,
          createdAt: true,
          delayUntil: true,
        },
      });
    } catch (err) {
      if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      throw err;
    }

    await logAccess({ userId: user.id, path: "/api/signals", method: "GET", status: 200, ip, userAgent: ua });
    return NextResponse.json({
      signals: matches,
      plan: user.plan,
      role: user.role,
      usage: { signalsSeen: null, limit: null },
      query: q,
    });
  }

  const today = startOfDayUTC(new Date());

  let usage;
  try {
    usage = await prisma.usageDay.upsert({
      where: { userId_day: { userId: user.id, day: today } },
      update: {},
      create: { userId: user.id, day: today },
      select: { id: true, signalsSeen: true, points: true },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  const isFree = user.plan === "FREE" && !adminBypass;
  const limit = isFree ? 3 : Infinity;

  if (isFree && usage.signalsSeen >= limit) {
    await logAccess({ userId: user.id, path: "/api/signals", method: "GET", status: 402, ip, userAgent: ua });
    return NextResponse.json(
      { error: "plan_limit", message: "Limite diário atingido no plano Free." },
      { status: 402 }
    );
  }

  const now = new Date();

  // Garantir que existam alguns sinais na conta
  let existingCount;
  try {
    existingCount = await prisma.signal.count({ where: { userId: user.id } });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }
  if (existingCount === 0) {
    try {
      await prisma.signal.createMany({
        data: [
        {
          userId: user.id,
          source: "Jobs + LinkedIn",
          title: "Aumento súbito de vagas: RevOps + agentes internos",
          summary:
            "Empresas contratando perfis de automação para pipeline e atendimento — sinal de intenção de compra de IA aplicada.",
          intent: "HIGH",
          score: 91,
          growthPct: 38,
        },
        {
          userId: user.id,
          source: "Search",
          title: "Picos de busca por 'privacy-first analytics'",
          summary: "Movimento consistente em termos e benchmarks sugere janela de reposicionamento B2B.",
          intent: "MEDIUM",
          score: 76,
          growthPct: 22,
        },
        {
          userId: user.id,
          source: "Comunidades",
          title: "Discussões crescentes sobre 'agentic workflows'",
          summary: "Muita atenção, pouca intenção direta — útil para narrativa e timing de produto.",
          intent: "LOW",
          score: 63,
          growthPct: 14,
        },
        ],
      });
    } catch (err) {
      if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      throw err;
    }
  }

  let signals;
  try {
    signals = await prisma.signal.findMany({
      where: {
        userId: user.id,
        ...(isFree ? { OR: [{ delayUntil: null }, { delayUntil: { lte: now } }] } : {}),
      },
      orderBy: [{ score: "desc" }, { createdAt: "desc" }],
      take: isFree ? Math.max(0, limit - usage.signalsSeen) : 50,
      select: {
        id: true,
        title: true,
        summary: true,
        source: true,
        intent: true,
        score: true,
        growthPct: true,
        createdAt: true,
        delayUntil: true,
      },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }

  const consumed = Math.min(signals.length, isFree ? limit - usage.signalsSeen : signals.length);
  if (consumed > 0) {
    try {
      await prisma.usageDay.update({
        where: { id: usage.id },
        data: { signalsSeen: { increment: consumed }, points: { increment: consumed * 2 } },
      });
    } catch (err) {
      if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
      throw err;
    }
  }

  await logAccess({ userId: user.id, path: "/api/signals", method: "GET", status: 200, ip, userAgent: ua });
  return NextResponse.json({
    signals,
    plan: user.plan,
    role: user.role,
    usage: { signalsSeen: usage.signalsSeen + consumed, limit: isFree ? 3 : null },
  });
}
