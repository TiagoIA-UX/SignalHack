import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/env";
import { randomToken, sha256 } from "@/lib/token";
import { getClientIp, rateLimitAsync } from "@/lib/rateLimit";
import { logAccess } from "@/lib/accessLog";
import { isDbUnavailableError } from "@/lib/dbError";
import { isSmtpConfigured, sendMagicLinkEmail } from "@/lib/email";
import { captureException, getRequestIdFromHeaders, logEvent } from "@/lib/logger";
import { attachUaField, getUa } from "@/lib/ua";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
  next: z.string().max(512).optional(),
});

function isAuthorized(req: Request): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 12) return false;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return false;
  const token = auth.slice("bearer ".length);
  return token === adminPassword;
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  const rl = await rateLimitAsync(`admin:magic:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) {
    logEvent("warn", "admin.magic_link.rate_limited", { requestId, path: "/api/admin/magic-link", method: "POST", status: 429, ip, ua });
    await logAccess({ path: "/api/admin/magic-link", method: "POST", status: 429, ip, ua });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!isAuthorized(req)) {
    logEvent("warn", "admin.magic_link.unauthorized", { requestId, path: "/api/admin/magic-link", method: "POST", status: 401, ip, ua });
    await logAccess({ path: "/api/admin/magic-link", method: "POST", status: 401, ip, ua });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    logEvent("warn", "admin.magic_link.invalid_request", { requestId, path: "/api/admin/magic-link", method: "POST", status: 400, ip, ua });
    await logAccess({ path: "/api/admin/magic-link", method: "POST", status: 400, ip, ua });
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const nextPath = parsed.data.next;

  const pepper = process.env.AUTH_TOKEN_PEPPER;
  if (!pepper || pepper.length < 16) {
    logEvent("error", "admin.magic_link.not_configured", { requestId, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
    await logAccess({ path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!isSmtpConfigured()) {
    logEvent("error", "admin.magic_link.email_not_configured", { requestId, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
    await logAccess({ path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "email_not_configured" }, { status: 503 });
  }

  let user: { id: string; email: string } | null = null;
  try {
    user = await prisma.users.findUnique({ where: { email }, select: { id: true, email: true } });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      captureException(err, { requestId, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "admin.magic_link.db_unavailable", { requestId, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
      await logAccess({ path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    captureException(err, { requestId, path: "/api/admin/magic-link", method: "POST", status: 500, ip, ua });
    throw err;
  }

  if (!user) {
    // Não vaza se existe; mas admin usa esse endpoint, então devolvemos ok mesmo assim.
    logEvent("info", "admin.magic_link.ok_no_user", { requestId, path: "/api/admin/magic-link", method: "POST", status: 200, ip, ua });
    await logAccess({ path: "/api/admin/magic-link", method: "POST", status: 200, ip, ua });
    return NextResponse.json({ ok: true });
  }

  const token = randomToken(32);
  const tokenHash = sha256(`${token}:${pepper}`);
  const expiresAt = new Date(Date.now() + 15 * 60_000);

  try {
    // Invalidate previous tokens
    await prisma.authTokens.updateMany({
      where: {
        type: "MAGIC_LINK",
        identifier: email,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { consumedAt: new Date() },
    });
    // Create new token
    await prisma.authTokens.create({
      type: "MAGIC_LINK",
      identifier: email,
      tokenHash,
      expiresAt,
      ip,
      ...attachUaField({}, ua),
      userId: user.id,
    });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      captureException(err, { requestId, userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua, action: "db_unavailable" });
      logEvent("error", "admin.magic_link.db_unavailable", { requestId, userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
      await logAccess({ userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
      return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
    }
    captureException(err, { requestId, userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 500, ip, ua });
    throw err;
  }

  const appUrl = getAppUrl().replace(/\/$/, "");
  const verifyUrl = `${appUrl}/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`;

  try {
    await sendMagicLinkEmail({ to: user.email, url: verifyUrl });
  } catch {
    logEvent("error", "admin.magic_link.email_unavailable", { requestId, userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
    await logAccess({ userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 503, ip, ua });
    return NextResponse.json({ error: "email_unavailable" }, { status: 503 });
  }

  await logAccess({ userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 200, ip, ua });
  logEvent("info", "admin.magic_link.ok", { requestId, userId: user.id, path: "/api/admin/magic-link", method: "POST", status: 200, ip, ua });
  return NextResponse.json({ ok: true });
}
