import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/env";
import { SESSION_COOKIE, verifySessionJwt } from "@/lib/auth";
import { getSecret } from "@/lib/appSecrets";
import { createPreapproval } from "@/services/mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Base para monetização: assinatura recorrente, afiliados, enterprise, API, relatórios premium.
// Gateway ainda não integrado.
export async function GET() {
  return NextResponse.json({ status: "stub", message: "Billing estruturado (gateway não integrado)." });
}

const postSchema = z.object({
  plan: z.enum(["PRO", "ELITE"]),
});

function planRank(plan: "FREE" | "PRO" | "ELITE") {
  if (plan === "ELITE") return 3;
  if (plan === "PRO") return 2;
  return 1;
}

export async function POST(req: Request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let session;
  try {
    session = await verifySessionJwt(token);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = postSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requested = parsed.data.plan;
  if (planRank(user.plan) >= planRank(requested)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? (await getSecret("mercadopago_access_token"));
  if (!accessToken) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const appUrl = getAppUrl();
  const webhookToken = process.env.BILLING_WEBHOOK_TOKEN;
  const notificationUrl = webhookToken
    ? `${appUrl.replace(/\/$/, "")}/api/billing/webhook?token=${encodeURIComponent(webhookToken)}`
    : `${appUrl.replace(/\/$/, "")}/api/billing/webhook`;

  const isElite = requested === "ELITE";
  const amount = isElite ? 79 : 29;

  const externalReference = `sh:${user.id}:${requested}:${Date.now()}`;
  const backUrl = `${appUrl.replace(/\/$/, "")}/plans?status=return`;

  try {
    const created = await createPreapproval({
      accessToken,
      reason: isElite ? "Signal Hacker • Elite access" : "Signal Hacker • Pro access",
      payerEmail: user.email,
      backUrl,
      notificationUrl,
      externalReference,
      amount,
      currencyId: "BRL",
    });

    const initPoint = created.init_point ?? created.sandbox_init_point;
    if (!initPoint) return NextResponse.json({ error: "billing_unavailable" }, { status: 503 });

    return NextResponse.json({ ok: true, initPoint });
  } catch {
    return NextResponse.json({ error: "billing_unavailable" }, { status: 503 });
  }
}
