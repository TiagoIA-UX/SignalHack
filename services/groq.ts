import { getEnv } from "@/lib/env";

type Intent = "LOW" | "MEDIUM" | "HIGH";

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
  if (!env.GROQ_API_KEY) {
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

  // Implementação real mínima (sem SDK) via fetch
  const prompt = `Você é um analista de inteligência de sinais B2B.
Dado o sinal abaixo, devolva JSON válido com as chaves:
intent (LOW|MEDIUM|HIGH), score (0-100), strategic (string), actionable (string).
Sinal:
TITLE: ${input.title}
SUMMARY: ${input.summary}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
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
  const parsed = JSON.parse(jsonText);

  return {
    intent: parsed.intent,
    score: parsed.score,
    strategic: parsed.strategic,
    actionable: parsed.actionable,
  } as ScoredSignal;
}
