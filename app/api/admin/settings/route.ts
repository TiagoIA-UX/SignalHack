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
  // smtp removido
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

    const status = await getSecretsStatus();
    return NextResponse.json({ ok: true, status });
  } catch {
    return NextResponse.json(
      { error: "not_ready", message: "Tabela de secrets ainda não existe no banco. Rode migrações do Prisma." },
      { status: 503 },
    );
  }
}
