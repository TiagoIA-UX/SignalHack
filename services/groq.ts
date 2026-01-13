import { getEnv } from "@/lib/env";
import { getSecret } from "@/lib/appSecrets";

type Intent = "LOW" | "MEDIUM" | "HIGH";

// Nota: modelos Groq mudam com o tempo; mantenha este default em um modelo estável e suportado.
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function strategySystemPrompt() {
  return [
    "Você é o módulo de Estratégia do SignalForge.",
    "Você opera como operador(a) de mercado dentro de um sistema privado.",
    "Seu papel: interpretar sinais, eliminar ruído e produzir um sinal de compra acionável.",
    "Restrições: sem previsões absolutas, sem promessas garantidas, sem hype, sem emojis.",
    "Tom: claro, confiante e persuasivo (marketing B2B), mas sempre condicional e ancorado em hipótese e evidência.",
    "Escreva para founders, agências e operadores de marketing/growth: foco em comprador ideal, posicionamento, canais, criativos e próximos experimentos.",
    "Evite jargão. Se usar siglas/termos (ex.: RevOps), defina em 1 frase.",
    "Em cada bloco, inclua 1 linha explícita de 'Benefício esperado' (condicional) e 1 linha de 'Como medir' (métrica simples em 7 dias).",
    "Formato obrigatório (use exatamente estes títulos):",
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "4. Oportunidade de ganhar dinheiro",
    "5. Próximo passo sugerido",
  ].join("\n");
}

function strategyUserPrompt(input: { title: string; summary: string }) {
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
    "5. Próximo passo sugerido",
  ];
  const has4 = text.includes("4. Oportunidade de ganhar dinheiro") || text.includes("4. Oportunidade principal") || text.includes("4. Tese principal");
  return required.every((h) => text.includes(h)) && has4;
}

export type ScoredSignal = {
  intent: Intent;
  score: number;
  strategic: string;
  actionable: string;
};

export type WeeklyBrief = {
  headline: string;
  summary: string;
  windowsOpen: string[];
  windowsClosing: string[];
  priorities: Array<{
    signalTitle: string;
    whyNow: string;
    firstAction: string;
    metric7d: string;
    risk: string;
  }>;
  disclaimer: string;
};

export async function analyzeSignalWithGroq(input: {
  title: string;
  summary: string;
}) : Promise<ScoredSignal> {
  const env = getEnv();
  const model = env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
  const apiKey = env.GROQ_API_KEY ?? (await getSecret("groq_api_key").catch(() => null));
  if (!apiKey) {
    throw new Error("groq_not_configured");
  }

  async function callGroq(temperature: number) {
    const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: strategySystemPrompt() },
          { role: "user", content: strategyUserPrompt(input) },
        ],
        temperature,
      }),
    }, 15_000);

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
    strategic: typeof parsed.strategic === "string" && hasFiveBlocks(parsed.strategic)
      ? parsed.strategic
      : "1. Contexto essencial\nSinal recebido.\n\n2. O que o sinal realmente indica\nIndício insuficiente para inferência confiável.\n\n3. Risco principal\nLeitura enviesada por ruído.\n\n4. Oportunidade principal\nColetar evidência rápida e barata.\n\n5. Próximo passo sugerido\nValidar 3 fontes independentes antes de agir.",
    actionable: typeof parsed.actionable === "string" && parsed.actionable.trim().length > 0
      ? parsed.actionable
      : "Defina 1 hipótese e valide com 5 conversas em 72h.",
  } as ScoredSignal;
}

function weeklyBriefSystemPrompt() {
  return [
    "Você é o módulo de Brief Semanal do SignalForge.",
    "Seu papel: transformar uma lista de sinais em um briefing semanal curto, claro e operacional.",
    "Restrições: sem previsões absolutas, sem promessas garantidas, sem hype, sem emojis.",
    "Tom: persuasivo e executivo (B2B), mas sempre condicional e verificável.",
    "Inclua benefícios plausíveis de acordo com a plataforma: reduzir ruído, acelerar decisão, orientar experimentos e medir em 7 dias.",
    "Formato: retorne APENAS JSON válido (sem markdown) com as chaves: headline, summary, windowsOpen, windowsClosing, priorities, disclaimer.",
    "windowsOpen/windowsClosing: arrays curtos (2-5 itens).",
    "priorities: array de 3 itens, cada item com signalTitle, whyNow, firstAction, metric7d, risk (tudo string).",
  ].join("\n");
}

function weeklyBriefUserPrompt(input: { signals: Array<{ title: string; summary: string; source: string; intent: Intent; score: number; growthPct: number }> }) {
  return [
    "SINAIS (use APENAS estes dados; não invente fatos externos):",
    JSON.stringify(input.signals),
  ].join("\n");
}

export async function generateWeeklyBriefWithGroq(input: {
  signals: Array<{ title: string; summary: string; source: string; intent: Intent; score: number; growthPct: number }>;
}): Promise<WeeklyBrief> {
  const env = getEnv();
  const model = env.GROQ_MODEL ?? DEFAULT_GROQ_MODEL;
  const apiKey = env.GROQ_API_KEY ?? (await getSecret("groq_api_key").catch(() => null));
  if (!apiKey) {
    throw new Error("groq_not_configured");
  }

  async function callGroq(temperature: number) {
    const res = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: weeklyBriefSystemPrompt() },
          { role: "user", content: weeklyBriefUserPrompt({ signals: input.signals }) },
        ],
        temperature,
      }),
    }, 15_000);
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
    const parsed = JSON.parse(jsonText) as WeeklyBrief;
    return parsed;
  }

  const first = await callGroq(0.2);
  const ok =
    typeof first?.headline === "string" &&
    typeof first?.summary === "string" &&
    Array.isArray(first?.priorities) &&
    first.priorities.length >= 1;

  const parsed = ok ? first : await callGroq(0.1);

  return {
    headline: typeof parsed.headline === "string" ? parsed.headline : "Brief semanal",
    summary: typeof parsed.summary === "string" ? parsed.summary : "Resumo semanal indisponível.",
    windowsOpen: Array.isArray(parsed.windowsOpen) ? parsed.windowsOpen.slice(0, 5).map(String) : [],
    windowsClosing: Array.isArray(parsed.windowsClosing) ? parsed.windowsClosing.slice(0, 5).map(String) : [],
    priorities: Array.isArray(parsed.priorities)
      ? parsed.priorities.slice(0, 3).map((p) => ({
          signalTitle: String(asRecord(p)?.signalTitle ?? ""),
          whyNow: String(asRecord(p)?.whyNow ?? ""),
          firstAction: String(asRecord(p)?.firstAction ?? ""),
          metric7d: String(asRecord(p)?.metric7d ?? ""),
          risk: String(asRecord(p)?.risk ?? ""),
        }))
      : [],
    disclaimer:
      typeof parsed.disclaimer === "string"
        ? parsed.disclaimer
        : "IA ajuda a interpretar e priorizar; decisão final é humana.",
  };
}
