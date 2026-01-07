import { getEnv } from "@/lib/env";
import { getSecret } from "@/lib/appSecrets";

type Intent = "LOW" | "MEDIUM" | "HIGH";

const GROQ_MODEL = "llama-3.1-70b-versatile";
const STRATEGIST_PROMPT_VERSION = "sh_strategist_v1";

function strategistSystemPrompt() {
  return [
    "Você é o Strategist Agent do SignalHack.",
    "Você opera como analista de inteligência estratégica dentro de um sistema privado.",
    "Seu papel: interpretar sinais, eliminar ruído e produzir insight acionável.",
    "Restrições: sem previsões absolutas, sem hype, sem marketing, sem emojis.",
    "Tom: objetivo, frio, técnico, orientado à decisão.",
    "Formato obrigatório (use exatamente estes títulos):",
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "4. Oportunidade principal",
    "5. Próximo passo sugerido",
  ].join("\n");
}

function strategistUserPrompt(input: { title: string; summary: string }) {
  return [
    "SINAL:",
    `TITLE: ${input.title}`,
    `SUMMARY: ${input.summary}`,
    "\nRetorne JSON válido com as chaves:",
    "intent (LOW|MEDIUM|HIGH)",
    "score (0-100)",
    "strategic (string)  // deve conter os 5 blocos no formato acima",
    "actionable (string) // 1 ação objetiva em 1-2 frases",
  ].join("\n");
}

function hasFiveBlocks(text: string) {
  const required = [
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "4. Oportunidade principal",
    "5. Próximo passo sugerido",
  ];
  return required.every((h) => text.includes(h));
}

export type ScoredSignal = {
  intent: Intent;
  score: number;
  strategic: string;
  actionable: string;
};

export async function analyzeSignalWithGroq(input: {
  title: string;
  summary: string;
}) : Promise<ScoredSignal> {
  const env = getEnv();
  const apiKey = env.GROQ_API_KEY ?? (await getSecret("groq_api_key").catch(() => null));
  if (!apiKey) {
    // Mock inteligente e determinístico o suficiente para demo
    const base = Math.min(95, Math.max(40, input.title.length + input.summary.length / 8));
    const score = Math.round(base);
    const intent: Intent = score >= 85 ? "HIGH" : score >= 70 ? "MEDIUM" : "LOW";
    return {
      intent,
      score,
      strategic: "Interprete este sinal como janela de timing: valide ICP e narrativa antes de escalar aquisição.",
      actionable: "Crie 1 landing por hipótese, rode 10 entrevistas e monitore conversões por segmento em 72h.",
    };
  }

  async function callGroq(temperature: number) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: strategistSystemPrompt() },
          { role: "user", content: strategistUserPrompt(input) },
        ],
        temperature,
      }),
    });

    if (!res.ok) throw new Error("Groq request failed");
    const data: unknown = await res.json();

    const content = (() => {
      if (!data || typeof data !== "object") return null;
      const choices = (data as { choices?: unknown }).choices;
      if (!Array.isArray(choices) || choices.length === 0) return null;
      const message = (choices[0] as { message?: unknown } | undefined)?.message;
      if (!message || typeof message !== "object") return null;
      const c = (message as { content?: unknown }).content;
      return typeof c === "string" ? c : null;
    })();

    if (!content) throw new Error("Invalid Groq response");

    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    const jsonText = jsonStart >= 0 && jsonEnd >= 0 ? content.slice(jsonStart, jsonEnd + 1) : content;
    const parsed = JSON.parse(jsonText) as {
      intent: Intent;
      score: number;
      strategic: string;
      actionable: string;
    };

    return parsed;
  }

  const first = await callGroq(0.2);
  const strategicOk = typeof first.strategic === "string" && hasFiveBlocks(first.strategic);
  const actionableOk = typeof first.actionable === "string" && first.actionable.trim().length > 0;

  const parsed = strategicOk && actionableOk ? first : await callGroq(0.1);

  return {
    intent: parsed.intent,
    score: parsed.score,
    strategic:
      `[${STRATEGIST_PROMPT_VERSION}]\n` +
      (typeof parsed.strategic === "string" && hasFiveBlocks(parsed.strategic)
        ? parsed.strategic
        : "1. Contexto essencial\nSinal recebido.\n\n2. O que o sinal realmente indica\nIndício insuficiente para inferência confiável.\n\n3. Risco principal\nLeitura enviesada por ruído.\n\n4. Oportunidade principal\nColetar evidência rápida e barata.\n\n5. Próximo passo sugerido\nValidar 3 fontes independentes antes de agir."),
    actionable: typeof parsed.actionable === "string" && parsed.actionable.trim().length > 0
      ? parsed.actionable
      : "Defina 1 hipótese e valide com 5 conversas em 72h.",
  } as ScoredSignal;
}
