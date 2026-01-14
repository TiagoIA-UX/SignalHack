import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSecret } from "@/lib/appSecrets";
import { getClientIp } from "@/lib/rateLimit";
import { captureException, getRequestIdFromHeaders, logEvent } from "@/lib/logger";
import { getPreapproval } from "@/services/mercadopago";
import { getUa } from "@/lib/ua";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  type: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
    })
    .optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

function parseExternalReference(ref: string | undefined) {
  if (!ref) return null;
  const m = /^sh:([^:]+):(PRO|ELITE):\d+$/.exec(ref);
  if (!m) return null;
  return { userId: m[1], plan: m[2] as "PRO" | "ELITE" };
}

function planRank(plan: "FREE" | "PRO" | "ELITE") {
  if (plan === "ELITE") return 3;
  if (plan === "PRO") return 2;
  return 1;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  logEvent("info", "billing.webhook.received", {
    requestId,
    path: "/api/billing/webhook",
    method: "POST",
    status: 200,
    ip,
    ua,
  });

  // Optional shared secret protection via query token.
  const webhookToken = process.env.BILLING_WEBHOOK_TOKEN;
  if (webhookToken) {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token || token !== webhookToken) {
      logEvent("warn", "billing.webhook.invalid_token", {
        requestId,
        path: "/api/billing/webhook",
        method: "POST",
        status: 200,
        ip,
        ua,
      });
      return NextResponse.json({ ok: true });
    }
  }

  try {
    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      logEvent("warn", "billing.webhook.invalid_body", {
        requestId,
        path: "/api/billing/webhook",
        method: "POST",
        status: 200,
        ip,
        ua,
      });
      return NextResponse.json({ ok: true });
    }

    const rawId = parsed.data.data?.id ?? parsed.data.id;
    const id = rawId !== undefined ? String(rawId) : null;
    if (!id) return NextResponse.json({ ok: true });

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN ?? (await getSecret("mercadopago_access_token"));
    if (!accessToken) {
      logEvent("warn", "billing.webhook.not_configured", {
        requestId,
        path: "/api/billing/webhook",
        method: "POST",
        status: 200,
        ip,
        ua,
      });
      return NextResponse.json({ ok: true });
    }

    let pre;
    try {
      pre = await getPreapproval({ accessToken, id });
    } catch (err) {
      captureException(err, {
        requestId,
        path: "/api/billing/webhook",
        method: "POST",
        status: 200,
        ip,
        ua,
        action: "mercadopago_preapproval_fetch_failed",
        extra: { preapprovalId: id },
      });
      logEvent("warn", "billing.webhook.preapproval_fetch_failed", {
        requestId,
        path: "/api/billing/webhook",
        method: "POST",
        status: 200,
        ip,
        ua,
        extra: { preapprovalId: id },
      });
      return NextResponse.json({ ok: true });
    }

    const ext = parseExternalReference(pre.external_reference);
    if (!ext) return NextResponse.json({ ok: true });

    const status = (pre.status ?? "").toLowerCase();
    const isActive = status === "authorized" || status === "active";
    if (!isActive) return NextResponse.json({ ok: true });

    const user = await prisma.users.findUnique({ where: { id: ext.userId }, select: { id: true, plan: true } });
    if (!user) return NextResponse.json({ ok: true });

    const nextPlan = ext.plan;
    if (planRank(user.plan) >= planRank(nextPlan)) return NextResponse.json({ ok: true });

    await prisma.users.update({ id: user.id }, { plan: nextPlan }).catch(() => null);
    logEvent("info", "billing.webhook.plan_upgraded", {
      requestId,
      userId: user.id,
      path: "/api/billing/webhook",
      method: "POST",
      status: 200,
      ip,
      ua,
      extra: { nextPlan },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    captureException(err, {
      requestId,
      path: "/api/billing/webhook",
      method: "POST",
      status: 200,
      ip,
      ua,
    });
    logEvent("error", "billing.webhook.unhandled", {
      requestId,
      path: "/api/billing/webhook",
      method: "POST",
      status: 200,
      ip,
      ua,
    });
    return NextResponse.json({ ok: true });
  }
}
