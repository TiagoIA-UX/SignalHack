import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "em_session";

export type SessionClaims = {
  sub: string;
  email: string;
  plan: "FREE" | "PRO" | "ELITE";
  role: "USER" | "ADMIN";
  sid: string;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set");
  return new TextEncoder().encode(secret);
}

export async function signSessionJwt(claims: SessionClaims, expiresInSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ email: claims.email, plan: claims.plan, role: claims.role, sid: claims.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(getSecretKey());
}

export async function verifySessionJwt(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
  const sub = payload.sub;
  const email = payload.email;
  const plan = payload.plan;
  const role = payload.role;
  const sid = payload.sid;

  if (
    typeof sub !== "string" ||
    typeof email !== "string" ||
    (plan !== "FREE" && plan !== "PRO" && plan !== "ELITE") ||
    (role !== "USER" && role !== "ADMIN") ||
    typeof sid !== "string"
  ) {
    throw new Error("Invalid session token");
  }

  return { sub, email, plan, role, sid } satisfies SessionClaims;
}

export async function getSessionFromCookies() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionJwt(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionJwt(token);
  } catch {
    return null;
  }
}
