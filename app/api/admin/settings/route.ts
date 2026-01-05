import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/lib/auth";
import { getSecretsStatus, setSecret } from "@/lib/appSecrets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const putSchema = z.object({
  groqApiKey: z.string().min(1).optional(),
  mercadopagoAccessToken: z.string().min(1).optional(),
  smtp: z
    .object({
      host: z.string().min(1).optional(),
      port: z.union([z.number().int().positive(), z.string().min(1)]).optional(),
      user: z.string().min(1).optional(),
      pass: z.string().min(1).optional(),
      from: z.string().email().optional(),
    })
    .optional(),
});

async function requireAdmin(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return null;
  if (session.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const status = await getSecretsStatus();
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json(
      { error: "not_ready", message: "Tabela de secrets ainda não existe no banco. Rode migrações do Prisma." },
      { status: 503 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const json = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const body = parsed.data;

  try {
    if (body.groqApiKey) await setSecret("groq_api_key", body.groqApiKey);
    if (body.mercadopagoAccessToken) await setSecret("mercadopago_access_token", body.mercadopagoAccessToken);

    if (body.smtp) {
      const { host, port, user, pass, from } = body.smtp;
      if (host) await setSecret("smtp_host", host);
      if (port) await setSecret("smtp_port", String(port));
      if (user) await setSecret("smtp_user", user);
      if (pass) await setSecret("smtp_pass", pass);
      if (from) await setSecret("smtp_from", from);
    }

    const status = await getSecretsStatus();
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json(
      { error: "not_ready", message: "Tabela de secrets ainda não existe no banco. Rode migrações do Prisma." },
      { status: 503 },
    );
  }
}
