import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function base64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=oauth_not_configured", req.url));
  }

  const appUrl = getAppUrl().replace(/\/$/, "");
  const url = new URL(req.url);
  const nextPath = url.searchParams.get("next") || "/dashboard";

  const { randomBytes, createHash } = await import("crypto");
  const state = base64Url(randomBytes(24));
  const codeVerifier = base64Url(randomBytes(48));
  const codeChallenge = base64Url(createHash("sha256").update(codeVerifier).digest());

  const redirectUri = `${appUrl}/api/auth/google/callback`;
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl);
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set({ name: "google_oauth_state", value: state, httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 10 * 60 });
  res.cookies.set({ name: "google_oauth_verifier", value: codeVerifier, httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 10 * 60 });
  res.cookies.set({ name: "google_oauth_next", value: nextPath, httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 10 * 60 });
  return res;
}
