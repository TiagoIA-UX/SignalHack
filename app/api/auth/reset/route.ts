import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Recuperação de senha desativada neste MVP.
export async function POST() {
  return NextResponse.json(
    { error: "disabled", message: "Recuperação de senha está desativada neste MVP." },
    { status: 410 }
  );
}
