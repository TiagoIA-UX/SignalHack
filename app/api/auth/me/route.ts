import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rota de compatibilidade sem autenticação.
export async function GET() {
  return NextResponse.json({ user: null });
}
