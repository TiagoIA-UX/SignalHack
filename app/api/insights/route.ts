import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    insight: {
      id: "demo-insight",
      strategic:
        "1. Contexto essencial\nMercado aquecido por automação e revops.\n2. O que o sinal realmente indica\nHá disposição para investir em IA aplicada ao pipeline.\n3. Risco principal\nConcorrência alta e orçamento variável.\n4. Oportunidade de ganhar dinheiro\nPosicionamento como ganho rápido de receita.\n5. Próximo passo sugerido\nRodar piloto com 1 squad em 14 dias.",
      actionable:
        "Sugestão: oferecer prova de valor curta (14 dias), com 1 equipe piloto e metas claras de ROI.",
      confidence: 72,
    },
    cached: true,
  });
}
