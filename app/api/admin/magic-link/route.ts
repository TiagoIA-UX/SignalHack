import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAppUrl, getEnv } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { randomToken, sha256 } from "@/lib/token";
import { getSessionFromRequest } from "@/lib/auth";
import { logAccess } from "@/lib/accessLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email().max(320),
});

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  if (session.role !== "ADMIN") return null;
  return session;
}
  // Endpoint removido para login minimalista
  });

  const url = new URL("/api/auth/verify", getAppUrl());
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);

  await logAccess({ userId: session.sub, path: "/api/admin/magic-link", method: "POST", status: 200, ip, userAgent: ua });
  return NextResponse.json({ ok: true, url: url.toString() });
}
