import { NextResponse } from "next/server";

// Base para monetização: assinatura recorrente, afiliados, enterprise, API, relatórios premium.
// Gateway propositalmente não integrado no MVP.
export async function GET() {
  return NextResponse.json({ status: "stub", message: "Billing estruturado (sem gateway no MVP)." });
}
