import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  signalId: z.string().min(10),
  hypothesis: z.string().min(8).max(800),
  experiment: z.string().min(8).max(1200),
  metric: z.string().min(4).max(300),
});

export async function GET(req: Request) {
  // Emergência: retorna nenhum plano salvo.
  return NextResponse.json({ plan: null });
}

export async function PUT(req: Request) {
  // Emergência: salva em memória (sem DB) e retorna o payload.
  const json = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  return NextResponse.json({
    ok: true,
    plan: {
      id: "demo-plan",
      hypothesis: parsed.data.hypothesis,
      experiment: parsed.data.experiment,
      metric: parsed.data.metric,
      updatedAt: new Date().toISOString(),
    },
  });
}
