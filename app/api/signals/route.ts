import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent");

  const rl = rateLimit(`signals:get:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

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
    select: { id: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const today = startOfDayUTC(new Date());

  const usage = await prisma.usageDay.upsert({
    where: { userId_day: { userId: user.id, day: today } },
    update: {},
    create: { userId: user.id, day: today },
    select: { id: true, signalsSeen: true, points: true },
  });

  const isFree = user.plan === "FREE";
  const limit = isFree ? 3 : Infinity;

  if (isFree && usage.signalsSeen >= limit) {
    await logAccess({ userId: user.id, path: "/api/signals", method: "GET", status: 402, ip, userAgent: ua });
    return NextResponse.json(
      { error: "plan_limit", message: "Limite diário atingido no plano Free." },
      { status: 402 }
    );
  }

  const now = new Date();
  const delayUntil = isFree ? new Date(now.getTime() + 24 * 60 * 60_000) : null;

  // Para o MVP: garantir que existam alguns sinais na conta
  const existingCount = await prisma.signal.count({ where: { userId: user.id } });
  if (existingCount === 0) {
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
          delayUntil,
        },
        {
          userId: user.id,
          source: "Search",
          title: "Picos de busca por 'privacy-first analytics'",
          summary: "Movimento consistente em termos e benchmarks sugere janela de reposicionamento B2B.",
          intent: "MEDIUM",
          score: 76,
          growthPct: 22,
          delayUntil,
        },
        {
          userId: user.id,
          source: "Comunidades",
          title: "Discussões crescentes sobre 'agentic workflows'",
          summary: "Muita atenção, pouca intenção direta — útil para narrativa e timing de produto.",
          intent: "LOW",
          score: 63,
          growthPct: 14,
          delayUntil,
        },
      ],
    });
  }

  const signals = await prisma.signal.findMany({
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

  const consumed = Math.min(signals.length, isFree ? limit - usage.signalsSeen : signals.length);
  if (consumed > 0) {
    await prisma.usageDay.update({
      where: { id: usage.id },
      data: { signalsSeen: { increment: consumed }, points: { increment: consumed * 2 } },
    });
  }

  await logAccess({ userId: user.id, path: "/api/signals", method: "GET", status: 200, ip, userAgent: ua });
  return NextResponse.json({ signals, plan: user.plan, usage: { signalsSeen: usage.signalsSeen + consumed, limit: isFree ? 3 : null } });
}
