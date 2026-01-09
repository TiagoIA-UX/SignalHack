import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { isDbUnavailableError } from "@/lib/dbError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  signalId: z.string().min(10),
  hypothesis: z.string().min(8).max(800),
  experiment: z.string().min(8).max(1200),
  metric: z.string().min(4).max(300),
});

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`playbooks:get:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let session;
  try {
    session = await verifySessionJwt(token);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const signalId = url.searchParams.get("signalId");
  if (!signalId || signalId.length < 10) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  try {
    const plan = await prisma.executionPlan.findUnique({
      where: { userId_signalId: { userId: session.sub, signalId } },
      select: { id: true, hypothesis: true, experiment: true, metric: true, updatedAt: true },
    });

    return NextResponse.json({ plan: plan ?? null });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }
}

export async function PUT(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`playbooks:put:${ip}`, { windowMs: 60_000, max: 40 });
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
  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  // Garantir que o sinal pertence ao usuário
  try {
    const signal = await prisma.signal.findFirst({
      where: { id: parsed.data.signalId, userId: session.sub },
      select: { id: true },
    });
    if (!signal) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const plan = await prisma.executionPlan.upsert({
      where: { userId_signalId: { userId: session.sub, signalId: parsed.data.signalId } },
      update: {
        hypothesis: parsed.data.hypothesis,
        experiment: parsed.data.experiment,
        metric: parsed.data.metric,
      },
      create: {
        userId: session.sub,
        signalId: parsed.data.signalId,
        hypothesis: parsed.data.hypothesis,
        experiment: parsed.data.experiment,
        metric: parsed.data.metric,
      },
      select: { id: true, hypothesis: true, experiment: true, metric: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, plan });
  } catch (err) {
    if (isDbUnavailableError(err)) return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    throw err;
  }
}
