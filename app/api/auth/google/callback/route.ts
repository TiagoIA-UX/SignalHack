import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/env";
import { signSessionJwt } from "@/lib/auth";
import { getClientIp } from "@/lib/rateLimit";
import { attachUaField, getUa } from "@/lib/ua";
import { logAccess } from "@/lib/accessLog";
import { logEvent, captureException, getRequestIdFromHeaders } from "@/lib/logger";
import { isDbUnavailableError } from "@/lib/dbError";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GoogleTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  id_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  sub?: string;
  picture?: string;
};

function sanitizeNext(nextPath: string | null | undefined) {
  if (!nextPath) return "/dashboard";
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return "/dashboard";
  return nextPath;
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const ua = getUa(req.headers);
  const requestId = getRequestIdFromHeaders(req.headers);

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=oauth_not_configured", req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieState = req.headers.get("cookie")?.match(/google_oauth_state=([^;]+)/)?.[1];
  const codeVerifier = req.headers.get("cookie")?.match(/google_oauth_verifier=([^;]+)/)?.[1];
  const nextCookie = req.headers.get("cookie")?.match(/google_oauth_next=([^;]+)/)?.[1];
  const nextPath = sanitizeNext(nextCookie ? decodeURIComponent(nextCookie) : null);

  if (!code || !state || !cookieState || state !== cookieState || !codeVerifier) {
    logEvent("warn", "auth.google.invalid_state", { requestId, path: "/api/auth/google/callback", method: "GET", status: 400, ip, ua });
    return NextResponse.redirect(new URL("/login?error=oauth_invalid", req.url));
  }

  const appUrl = getAppUrl().replace(/\/$/, "");
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  let tokenJson: GoogleTokenResponse;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });
    tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenJson.access_token) {
      logEvent("warn", "auth.google.token_failed", { requestId, path: "/api/auth/google/callback", method: "GET", status: 400, ip, ua });
      return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
    }
  } catch (err) {
    captureException(err, { requestId, path: "/api/auth/google/callback", method: "GET", status: 500, ip, ua });
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  let profile: GoogleUserInfo = {};
  try {
    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: `Bearer ${tokenJson.access_token}` },
    });
    profile = (await userRes.json()) as GoogleUserInfo;
  } catch (err) {
    captureException(err, { requestId, path: "/api/auth/google/callback", method: "GET", status: 500, ip, ua });
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  const email = profile.email?.toLowerCase();
  if (!email) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  let user;
  try {
    user = await prisma.users.upsert({
      where: { email },
      update: { emailVerified: profile.email_verified ?? true, name: profile.name ?? undefined },
      create: { email, emailVerified: profile.email_verified ?? true, name: profile.name ?? undefined },
    });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      await logAccess({ path: "/api/auth/google/callback", method: "GET", status: 503, ip, ua });
      return NextResponse.redirect(new URL("/login?error=db_unavailable", req.url));
    }
    captureException(err, { requestId, path: "/api/auth/google/callback", method: "GET", status: 500, ip, ua });
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }

  let session;
  try {
    session = await prisma.sessions.create(
      attachUaField({ userId: user.id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60_000), ip }, ua) as any
    );
  } catch (err) {
    if (isDbUnavailableError(err)) {
      await logAccess({ userId: user.id, path: "/api/auth/google/callback", method: "GET", status: 503, ip, ua });
      return NextResponse.redirect(new URL("/login?error=db_unavailable", req.url));
    }
    captureException(err, { requestId, userId: user.id, path: "/api/auth/google/callback", method: "GET", status: 500, ip, ua });
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }

  let jwt: string;
  try {
    jwt = await signSessionJwt({ sub: user.id, email: user.email, plan: user.plan, role: user.role, sid: session.id }, 30 * 24 * 60 * 60);
  } catch (err) {
    captureException(err, { requestId, userId: user.id, path: "/api/auth/google/callback", method: "GET", status: 503, ip, ua });
    return NextResponse.redirect(new URL("/login?error=auth_not_configured", req.url));
  }

  const res = NextResponse.redirect(new URL(nextPath, req.url));
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set({ name: "em_session", value: jwt, httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60 });
  res.cookies.set({ name: "google_oauth_state", value: "", httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set({ name: "google_oauth_verifier", value: "", httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set({ name: "google_oauth_next", value: "", httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
