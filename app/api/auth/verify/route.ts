import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Magic link foi removido: login é por email+senha.
export async function GET() {
  return NextResponse.json(
    { error: "disabled", message: "Magic link foi desativado. Use login por email e senha." },
    { status: 410 }
  );
}
