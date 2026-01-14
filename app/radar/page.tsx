"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";
import { ModuleBadge } from "@/components/ModuleBadge";
import { ZairixAvatar } from "@/components/ZairixAvatar";
import { UpgradeModal, type UpgradeModalVariant } from "@/components/UpgradeModal";
import { getStrategyDailyLimit, incrementStrategyUsed, readStrategyUsed } from "@/lib/strategyLimit";

type Signal = {
  id: string;
  title: string;
  summary: string;
  source: string;
  intent: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  growthPct: number;
};

type SignalsResponse =
  | { error: string; message?: string }
  | {
      signals: Signal[];
      plan: "FREE" | "PRO" | "ELITE";
      role?: "USER" | "ADMIN";
      usage: { signalsSeen: number | null; limit: number | null };
      query?: string;
    };

type InsightResponse =
  | { error: string; message?: string }
  | { insight: { id: string; strategic: string; actionable: string; confidence: number }; cached: boolean };

type Brief = {
  headline: string;
  summary: string;
  windowsOpen: string[];
  windowsClosing: string[];
  priorities: Array<{ signalTitle: string; whyNow: string; firstAction: string; metric7d: string; risk: string }>;
  disclaimer: string;
};

type BriefResponse =
  | { error: string; message?: string }
  | { brief: Brief; cached: boolean; weekStart: string };

type PlaybookPlan = { id: string; hypothesis: string; experiment: string; metric: string; updatedAt: string };

type PlaybookResponse = { plan: PlaybookPlan | null } | { error: string; message?: string };

function isoWeekNumber(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function parseFiveBlocks(text: string): Array<{ title: string; body: string }> | null {
  if (!text || typeof text !== "string") return null;
  const canonicalTitles = [
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "4. Oportunidade de ganhar dinheiro",
    "5. Próximo passo sugerido",
  ];

  const titleMap = new Map<string, string>([
    ["1. Contexto essencial", "1. Contexto essencial"],
    ["2. O que o sinal realmente indica", "2. O que o sinal realmente indica"],
    ["3. Risco principal", "3. Risco principal"],
    // Compatibilidade com respostas antigas do modelo.
    ["4. Oportunidade principal", "4. Oportunidade de ganhar dinheiro"],
    ["4. Tese principal", "4. Oportunidade de ganhar dinheiro"],
    ["4. Oportunidade de ganhar dinheiro", "4. Oportunidade de ganhar dinheiro"],
    ["5. Próximo passo sugerido", "5. Próximo passo sugerido"],
  ]);

  const mustHave = [
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "5. Próximo passo sugerido",
  ];
  if (!mustHave.every((t) => text.includes(t))) return null;
  if (
    !(
      text.includes("4. Oportunidade principal") ||
      text.includes("4. Tese principal") ||
      text.includes("4. Oportunidade de ganhar dinheiro")
    )
  ) {
    return null;
  }

  const parts = text.split(/\n(?=\d\. )/g);
  const out: Array<{ title: string; body: string }> = [];
  for (const part of parts) {
    const trimmed = part.trim();
    const firstLineEnd = trimmed.indexOf("\n");
    const title = (firstLineEnd >= 0 ? trimmed.slice(0, firstLineEnd) : trimmed).trim();
    const normalizedTitle = titleMap.get(title);
    if (!normalizedTitle) continue;
    const body = (firstLineEnd >= 0 ? trimmed.slice(firstLineEnd + 1) : "").trim();
    out.push({ title: normalizedTitle, body });
  }

  const hasAllCanonical = canonicalTitles.every((t) => out.some((b) => b.title === t));
  return out.length === 5 && hasAllCanonical ? out : null;
}

function sanitizeCopy(text: string) {
  if (!text || typeof text !== "string") return text;
  return text
    .replaceAll("Insights", "Sinais de compra")
    .replaceAll("Insight", "Sinal de compra")
    .replaceAll("insights", "sinais de compra")
    .replaceAll("insight", "sinal de compra")
    .replaceAll("Análise", "Oportunidade de ganhar dinheiro")
    .replaceAll("análise", "oportunidade de ganhar dinheiro")
    .replaceAll("Oportunidade principal", "Oportunidade de ganhar dinheiro")
    .replaceAll("Tese principal", "Potencial de retorno");
}

function translateSignalToMoney(signal: Pick<Signal, "title" | "summary">) {
  const text = `${signal.title} ${signal.summary}`.toLowerCase();
  if (text.includes("vagas") && (text.includes("revops") || text.includes("receita"))) {
    return "Empresas estão tentando comprar automação agora.";
  }
  if (text.includes("contrat") && text.includes("autom")) return "Empresas estão pagando para reduzir trabalho manual agora.";
  if (text.includes("compliance") || text.includes("lgpd")) return "Empresas estão comprando redução de risco e auditoria agora.";
  if (text.includes("whatsapp") || text.includes("crm")) return "Times estão comprando velocidade comercial e follow-up agora.";
  return "Sinal público com comprador e urgência.";
}

function estimateValueHint(signal: Pick<Signal, "title" | "summary" | "intent" | "score">) {
  const text = `${signal.title} ${signal.summary}`.toLowerCase();
  const highIntent = signal.intent === "HIGH" || signal.score >= 80;
  const b2b =
    text.includes("b2b") ||
    text.includes("saas") ||
    text.includes("receita") ||
    text.includes("revops") ||
    text.includes("mid-market");
  const compliance = text.includes("lgpd") || text.includes("compliance") || text.includes("auditoria") || text.includes("risco");
  if (highIntent && (b2b || compliance)) return "alto ticket (projeto) ou recorrência; vale mais com urgência + comprador claro";
  if (highIntent) return "médio ticket; pode virar recorrência se a dor for frequente";
  return "baixo/médio ticket; exige funil forte e volume";
}

function hasInsight(
  res: InsightResponse,
): res is { insight: { id: string; strategic: string; actionable: string; confidence: number }; cached: boolean } {
  return "insight" in res;
}

function isUpgradeRequired(res: InsightResponse): res is { error: "upgrade_required" } {
  return typeof res === "object" && !!res && "error" in res && (res as { error?: unknown }).error === "upgrade_required";
}

export default function RadarPage() {
  const [data, setData] = useState<SignalsResponse | null>(null);
  const [insightBySignalId, setInsightBySignalId] = useState<Record<string, InsightResponse>>({});
  const [loadingInsightId, setLoadingInsightId] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeVariant, setUpgradeVariant] = useState<UpgradeModalVariant>("strategy_locked");
  const [strategyUsed, setStrategyUsed] = useState(0);
  const [meRole, setMeRole] = useState<"USER" | "ADMIN" | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [briefRes, setBriefRes] = useState<BriefResponse | null>(null);
  const [playbookBySignalId, setPlaybookBySignalId] = useState<Record<string, PlaybookPlan | null>>({});
  const [playbookDraftBySignalId, setPlaybookDraftBySignalId] = useState<
    Record<string, { hypothesis: string; experiment: string; metric: string }>
  >({});
  const [playbookSavingId, setPlaybookSavingId] = useState<string | null>(null);

  const loadSignals = useCallback(async (query?: string) => {
    const url = query && query.trim().length > 0 ? `/api/signals?q=${encodeURIComponent(query.trim())}` : "/api/signals";
    const r = await fetch(url, { cache: "no-store" });
    const j = (await r.json()) as SignalsResponse;
    setData(j);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/signals", { cache: "no-store" });
        const j = (await r.json()) as SignalsResponse;
        if (!cancelled) setData(j);
      } catch {
        if (!cancelled) setData({ error: "failed" });
      }
    })();

    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const id = j?.user?.id ?? null;
        const role = j?.user?.role ?? null;
        setMeId(id);
        setMeRole(role);
        if (id) setStrategyUsed(readStrategyUsed(id));
      })
      .catch(() => setMeId(null));
    return () => {
      cancelled = true;
    };
  }, []);

  const signals = useMemo(() => {
    if (!data || "error" in data) return [];
    return data.signals;
  }, [data]);

  const plan = data && !("error" in data) ? data.plan : null;
  const isAdmin = meRole === "ADMIN" || (data && !("error" in data) && data.role === "ADMIN");
  const planLimited = data && "error" in data && data.error === "plan_limit";
  const queryActive = data && !("error" in data) ? (data.query ?? "") : "";

  const strategyLimit = useMemo(() => (plan ? getStrategyDailyLimit(plan) : 0), [plan]);
  const strategyBlocked = plan === "FREE" && !isAdmin;
  const strategyLimited = plan === "PRO" && !isAdmin;

  const fmtIntent = (intent: Signal["intent"]) => (intent === "HIGH" ? "alta" : intent === "MEDIUM" ? "média" : "baixa");

  function computeTags(s: Signal) {
    const tags: Array<{ label: string; className: string }> = [];

    const moneyNow = s.intent === "HIGH" || s.score >= 85;
    const narrativeFuture = s.growthPct >= 35 && s.intent !== "HIGH";
    const highTicket = s.score >= 92;
    const lowCompetition = s.score >= 78 && s.growthPct <= 20;

    if (moneyNow) tags.push({ label: "Dinheiro agora", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" });
    if (narrativeFuture) tags.push({ label: "Narrativa futura", className: "border-sky-500/25 bg-sky-500/10 text-sky-100" });
    if (highTicket) tags.push({ label: "Alto ticket", className: "border-violet-500/25 bg-violet-500/10 text-violet-100" });
    if (lowCompetition) tags.push({ label: "Baixa concorrência", className: "border-zinc-500/25 bg-white/5 text-zinc-200" });

    return tags.slice(0, 3);
  }

  function deriveAsset(s: Signal) {
    const text = `${s.title} ${s.summary}`.toLowerCase();
    const dor = s.summary.length > 140 ? `${s.summary.slice(0, 140).trim()}…` : s.summary;

    const comprador =
      text.includes("revops") || text.includes("receita")
        ? "Head de Receita / RevOps"
        : text.includes("saas")
          ? "Founder de SaaS"
          : text.includes("e-commerce") || text.includes("ecommerce")
            ? "Operador de e-commerce"
            : text.includes("clínica") || text.includes("imobili")
              ? "Negócio local (dono/gestor)"
              : "Operador B2B (owner/gestor)";

    const porQueAgora = `Inflexão de demanda: +${s.growthPct}% e score ${s.score} (intenção ${fmtIntent(s.intent)}).`;

    const vender =
      text.includes("agente") || text.includes("automação")
        ? "Automação produtizada (setup + implementação em 7 dias)"
        : text.includes("outbound")
          ? "Oferta produtizada de prospecção (lista + mensagens + cadência)"
          : text.includes("seo") || text.includes("conteúdo")
            ? "Motor de aquisição (SEO/ativos + funil + tracking)"
            : "Oferta enxuta + funil mensurável (7 dias)";

    const proximoPasso = "Defina o potencial de retorno e rode um teste rápido de mercado de 7 dias com indicador claro de decisão.";

    return { dor, comprador, porQueAgora, vender, proximoPasso };
  }

  useEffect(() => {
    if (!plan) return;
    if (plan === "FREE" && !isAdmin) return;

    fetch("/api/brief", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setBriefRes(j as BriefResponse))
      .catch(() => setBriefRes({ error: "failed" }));
  }, [plan, isAdmin]);

  async function loadPlaybook(signalId: string) {
    const res = await fetch(`/api/playbooks?signalId=${encodeURIComponent(signalId)}`, { cache: "no-store" });
    const json = (await res.json()) as PlaybookResponse;
    if ("plan" in json) {
      const plan = json.plan;
      setPlaybookBySignalId((prev) => ({ ...prev, [signalId]: plan }));
      if (plan) {
        setPlaybookDraftBySignalId((prev) => ({
          ...prev,
          [signalId]: {
            hypothesis: plan.hypothesis,
            experiment: plan.experiment,
            metric: plan.metric,
          },
        }));
      }
    }
  }

  async function savePlaybook(signalId: string) {
    const draft = playbookDraftBySignalId[signalId];
    if (!draft) return;
    setPlaybookSavingId(signalId);
    const res = await fetch("/api/playbooks", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signalId, ...draft }),
    });
    const json = (await res.json()) as PlaybookResponse;
    if (res.ok && "plan" in json && json.plan) setPlaybookBySignalId((prev) => ({ ...prev, [signalId]: json.plan }));
    setPlaybookSavingId(null);
  }

  async function loadInsight(signalId: string) {
    if (!plan) return;

    if (strategyBlocked) {
      setUpgradeVariant("strategy_locked");
      setUpgradeOpen(true);
      return;
    }

    if (strategyLimited && strategyLimit !== null && meId) {
      const used = readStrategyUsed(meId);
      if (used >= strategyLimit) {
        setStrategyUsed(used);
        setUpgradeVariant("strategy_limit");
        setUpgradeOpen(true);
        return;
      }
    }

    setLoadingInsightId(signalId);
    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ signalId }),
    });
    const json = (await res.json()) as InsightResponse;
    setInsightBySignalId((prev) => ({ ...prev, [signalId]: json }));

    if (res.ok && hasInsight(json)) {
      loadPlaybook(signalId).catch(() => null);
    }

    if (res.status === 402 && isUpgradeRequired(json)) {
      setUpgradeVariant(plan === "PRO" ? "strategy_limit" : "strategy_locked");
      setUpgradeOpen(true);
    }
    if (res.ok && strategyLimited && strategyLimit !== null && meId) {
      const maybeCached = "cached" in json ? (json as { cached?: boolean }).cached : undefined;
      if (!maybeCached) {
        const next = incrementStrategyUsed(meId);
        setStrategyUsed(next);
      }
    }
    setLoadingInsightId(null);
  }

  const warWeekLabel = useMemo(() => {
    if (!briefRes || "error" in briefRes) return null;
    const d = new Date(briefRes.weekStart);
    const week = isoWeekNumber(d);
    const date = d.toLocaleDateString("pt-BR");
    return `🧠 Sala de Guerra — Semana ${String(week).padStart(2, "0")} • ${date}`;
  }, [briefRes]);

  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-10">
        <Container>
          {briefRes && !("error" in briefRes) ? (
            <Card className="mb-6 overflow-hidden p-0">
              <div className="border-b border-white/10 bg-black/50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{warWeekLabel ?? "🧠 sala de guerra"}</div>
                    <div className="mt-1 text-base font-semibold text-zinc-100">{briefRes.brief.headline}</div>
                    <div className="mt-2 text-sm text-zinc-200">{briefRes.brief.summary}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">Status</div>
                    <div className="text-sm text-zinc-200">Oportunidades • Ameaças • Onde atacar</div>
                    <div className="mt-2 text-xs text-zinc-500">Radar avançado (para análise). Operação fica no Modo Operador.</div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs font-medium text-zinc-200">Oportunidades abertas</div>
                        <div className="mt-2 space-y-1 text-sm text-zinc-200">
                          {briefRes.brief.windowsOpen?.length ? (
                            briefRes.brief.windowsOpen.map((t, idx) => (
                              <div key={idx} className="text-zinc-200">
                                • {t}
                              </div>
                            ))
                          ) : (
                            <div className="text-zinc-400">Sem destaques.</div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs font-medium text-zinc-200">Ameaças / janelas fechando</div>
                        <div className="mt-2 space-y-1 text-sm text-zinc-200">
                          {briefRes.brief.windowsClosing?.length ? (
                            briefRes.brief.windowsClosing.map((t, idx) => (
                              <div key={idx} className="text-zinc-200">
                                • {t}
                              </div>
                            ))
                          ) : (
                            <div className="text-zinc-400">Sem alertas.</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {briefRes.brief.priorities?.length ? (
                      <div className="mt-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">onde atacar agora</div>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          {briefRes.brief.priorities.slice(0, 3).map((p, idx) => (
                            <div key={idx} className="rounded-xl border border-white/10 bg-black p-3">
                              <div className="text-xs text-zinc-400">Sinal de compra</div>
                              <div className="mt-1 text-sm font-medium text-zinc-100">{p.signalTitle}</div>
                              <div className="mt-2 text-xs text-zinc-400">Por que agora</div>
                              <div className="mt-1 text-sm text-zinc-200">{p.whyNow}</div>
                              <div className="mt-2 text-xs text-zinc-400">Primeiro ataque</div>
                              <div className="mt-1 text-sm text-zinc-200">{p.firstAction}</div>
                              <div className="mt-2 text-xs text-zinc-400">Métrica (7 dias)</div>
                              <div className="mt-1 text-sm text-zinc-200">{p.metric7d}</div>
                              <div className="mt-2 text-xs text-zinc-400">Risco</div>
                              <div className="mt-1 text-sm text-zinc-200">{p.risk}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">resumo (1 página)</div>
                      <div className="mt-3 space-y-3 text-sm text-zinc-200">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="text-xs text-zinc-400">Pergunta</div>
                          <div className="mt-1">Onde atacar primeiro para gerar dinheiro em 7 dias?</div>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="text-xs text-zinc-400">Critério</div>
                          <div className="mt-1">Métrica → dobrar, ajustar ou matar.</div>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="text-xs text-zinc-400">Nota</div>
                          <div className="mt-1 text-xs text-zinc-400">{briefRes.brief.disclaimer}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : briefRes && "error" in briefRes ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
              {briefRes.error === "upgrade_required"
                ? "Sala de Guerra semanal disponível no Pro/Elite."
                : briefRes.error === "ai_not_configured"
                  ? (briefRes.message ?? "IA não configurada para gerar a Sala de Guerra semanal.")
                  : "Sala de Guerra indisponível."}
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sala de Guerra de Mercado</h1>
              <p className="mt-1 text-sm text-zinc-300">
                Aqui é diagnóstico e leitura do cenário. Para operar e executar um plano de 7 dias, use o Modo Operador.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <ModuleBadge id="atlas" />
                <ModuleBadge id="nexus" />
                <ModuleBadge
                  id="pulse"
                  locked={plan === "FREE" && !isAdmin}
                  rightLabel={plan === "FREE" && !isAdmin ? "bloqueado" : undefined}
                />
                <ModuleBadge
                  id="artisan"
                  locked={plan === "FREE" && !isAdmin}
                  rightLabel={
                    plan === "FREE" && !isAdmin
                      ? "bloqueado"
                      : plan === "PRO" && strategyLimit !== null
                        ? `${strategyUsed}/${strategyLimit}`
                        : plan === "ELITE"
                          ? "ilimitado"
                          : undefined
                  }
                />
                <span className="text-xs text-zinc-400">leitura/diagnóstico (execução acontece no Operar)</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button href="/dashboard" variant="ghost">
                Operar
              </Button>
              <Button href="/plans" variant="ghost">
                Ver planos
              </Button>
            </div>
          </div>

          <Card className="mt-6 p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadSignals(searchQ).catch(() => null);
              }}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="flex-1">
                <label className="text-xs text-zinc-400">Buscar no histórico</label>
                <input
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="ex.: revops, copy, afiliado, IA"
                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>
              <Button type="submit" variant="ghost">
                Buscar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearchQ("");
                  loadSignals("").catch(() => null);
                }}
              >
                Limpar
              </Button>
            </form>
            {queryActive ? (
              <div className="mt-3 text-xs text-zinc-400">
                Mostrando resultados para: <span className="text-zinc-200">{queryActive}</span>
              </div>
            ) : (
              <div className="mt-3 text-xs text-zinc-400">Dica: use palavras do título, fonte ou resumo.</div>
            )}
          </Card>

          {planLimited && !isAdmin ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
              Limite diário do plano Free atingido. Faça upgrade para continuar.
            </div>
          ) : null}

          <div className="mt-8 grid gap-4">
            {signals.map((s) => {
              const insightRes = insightBySignalId[s.id];
              const tags = computeTags(s);
              const asset = deriveAsset(s);
              const moneyLine = translateSignalToMoney(s);
              const valueHint = estimateValueHint(s);
              return (
                <Card key={s.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight">{s.title}</h2>
                        {tags.map((t) => (
                          <Badge key={t.label} className={t.className}>
                            {t.label}
                          </Badge>
                        ))}
                        <Badge className="border-white/10 bg-white/5 text-zinc-200">sinal de compra {fmtIntent(s.intent)}</Badge>
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">{s.source}</div>
                      <div className="mt-2 text-sm text-zinc-200">
                        <span className="text-zinc-400">Tradução:</span> {moneyLine}
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">
                        Encontrado em <span className="text-zinc-200">fontes públicas</span> • Intenção e contexto{" "}
                        <span className="text-zinc-200">interpretados</span>
                        {plan === "FREE" ? (
                          <>
                            {" "}• Filtro avançado (ruído removido): <span className="text-zinc-200">Pro</span>
                          </>
                        ) : (
                          <>
                            {" "}• <span className="text-zinc-200">Ruído removido</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-300">Score</div>
                      <div className="text-2xl font-semibold">{s.score}</div>
                      <div className="text-xs text-zinc-400">+{s.growthPct}%</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">Dor</div>
                      <div className="mt-2 text-sm text-zinc-200">{asset.dor}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">Comprador</div>
                      <div className="mt-2 text-sm text-zinc-200">{asset.comprador}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">Por que agora</div>
                      <div className="mt-2 text-sm text-zinc-200">{asset.porQueAgora}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">O que vender</div>
                      <div className="mt-2 text-sm text-zinc-200">{asset.vender}</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 md:col-span-2">
                      <div className="text-xs font-medium text-zinc-200">Quanto tende a valer</div>
                      <div className="mt-2 text-sm text-zinc-200">{valueHint}</div>
                      <div className="mt-2 text-xs text-zinc-400">Estimativa qualitativa baseada em urgência, comprador e contexto do sinal.</div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-emerald-500/15 bg-black/30 p-4">
                    <div className="text-xs font-medium text-zinc-200">Próximo passo prático</div>
                    <div className="mt-2 text-sm text-zinc-200">{asset.proximoPasso}</div>
                    <div className="mt-2 text-xs text-zinc-400">Sem execução, não existe validação.</div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => loadInsight(s.id)} variant="ghost" disabled={loadingInsightId === s.id}>
                      {loadingInsightId === s.id
                        ? "Gerando potencial de retorno + plano…"
                        : plan === "FREE"
                          ? "Gerar potencial de retorno + plano"
                          : plan === "PRO" && strategyLimit !== null
                            ? `Gerar potencial de retorno + plano (${strategyUsed}/${strategyLimit})`
                            : "Gerar potencial de retorno + plano"}
                    </Button>
                  </div>

                  {plan === "FREE" ? (
                    <div className="mt-3 text-xs text-zinc-400">Potencial de retorno + plano (7 dias) disponíveis no Pro.</div>
                  ) : null}

                  {plan === "PRO" && strategyLimit !== null ? (
                    <div className="mt-3 text-xs text-zinc-400">Você usou {strategyUsed}/{strategyLimit} planos hoje.</div>
                  ) : null}

                  {insightRes && hasInsight(insightRes) ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">potencial de retorno + plano</div>
                        <ZairixAvatar className="h-5 w-5 text-white/60" />
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">
                        Plano sugerido para execução em 7 dias
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="text-xs text-zinc-400">Resumo (consultoria)</div>
                          {(() => {
                            const strategic = sanitizeCopy(insightRes.insight.strategic);
                            const blocks = parseFiveBlocks(strategic);
                            if (!blocks) {
                              return <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{strategic}</div>;
                            }

                            return (
                              <div className="mt-2 space-y-3">
                                {blocks.map((b) => (
                                  <div key={b.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="text-xs font-medium text-zinc-200">{b.title}</div>
                                    <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{b.body}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        <div>
                          <div className="text-xs text-zinc-400">Ação sugerida (próximos movimentos)</div>
                          <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{sanitizeCopy(insightRes.insight.actionable)}</div>

                          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">plano de execução (7 dias)</div>
                            <div className="mt-3 space-y-3">
                              <div>
                                <div className="text-xs text-zinc-400">Hipótese</div>
                                <textarea
                                  value={(playbookDraftBySignalId[s.id]?.hypothesis ?? playbookBySignalId[s.id]?.hypothesis ?? "").toString()}
                                  onChange={(e) =>
                                    setPlaybookDraftBySignalId((prev) => ({
                                      ...prev,
                                      [s.id]: {
                                        hypothesis: e.target.value,
                                        experiment: prev[s.id]?.experiment ?? playbookBySignalId[s.id]?.experiment ?? "",
                                        metric: prev[s.id]?.metric ?? playbookBySignalId[s.id]?.metric ?? "",
                                      },
                                    }))
                                  }
                                  placeholder="Se eu atacar X com Y, espero ver Z."
                                  className="mt-2 min-h-[84px] w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                                />
                              </div>
                              <div>
                                <div className="text-xs text-zinc-400">Experimento</div>
                                <textarea
                                  value={(playbookDraftBySignalId[s.id]?.experiment ?? playbookBySignalId[s.id]?.experiment ?? "").toString()}
                                  onChange={(e) =>
                                    setPlaybookDraftBySignalId((prev) => ({
                                      ...prev,
                                      [s.id]: {
                                        hypothesis: prev[s.id]?.hypothesis ?? playbookBySignalId[s.id]?.hypothesis ?? "",
                                        experiment: e.target.value,
                                        metric: prev[s.id]?.metric ?? playbookBySignalId[s.id]?.metric ?? "",
                                      },
                                    }))
                                  }
                                  placeholder="Passo 1… Passo 2… Passo 3…"
                                  className="mt-2 min-h-[96px] w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-white/10"
                                />
                              </div>
                              <div>
                                <div className="text-xs text-zinc-400">Métrica (7 dias)</div>
                                <input
                                  value={(playbookDraftBySignalId[s.id]?.metric ?? playbookBySignalId[s.id]?.metric ?? "").toString()}
                                  onChange={(e) =>
                                    setPlaybookDraftBySignalId((prev) => ({
                                      ...prev,
                                      [s.id]: {
                                        hypothesis: prev[s.id]?.hypothesis ?? playbookBySignalId[s.id]?.hypothesis ?? "",
                                        experiment: prev[s.id]?.experiment ?? playbookBySignalId[s.id]?.experiment ?? "",
                                        metric: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="ex.: 10 respostas qualificadas, 3 calls, 2% CTR"
                                  className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <Button variant="ghost" onClick={() => savePlaybook(s.id)} disabled={playbookSavingId === s.id}>
                                  {playbookBySignalId[s.id] ? "Atualizar plano" : "Salvar plano"}
                                </Button>
                                {playbookBySignalId[s.id] ? <div className="text-xs text-zinc-400">Salvo.</div> : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-zinc-400">Confiança: {insightRes.insight.confidence}</div>
                      <div className="mt-2 text-xs text-zinc-400">IA sugere; você valida com realidade.</div>
                    </div>
                  ) : null}

                  {insightRes && "error" in insightRes ? (
                    <div className="mt-4 text-sm text-zinc-300">
                      {insightRes.error === "ai_not_configured" ? (
                        <>{insightRes.message ?? "IA não configurada para gerar sinais de compra."}</>
                      ) : insightRes.error === "ai_failed" ? (
                        insightRes.message ?? "IA indisponível agora."
                      ) : insightRes.error === "upgrade_required" ? (
                        "Upgrade necessário para gerar potencial de retorno + plano."
                      ) : (
                        insightRes.message ?? "Oportunidade indisponível."
                      )}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>

          {data && !("error" in data) && signals.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3">
                <ZairixAvatar className="h-6 w-6 text-white/60" />
                <div>
                  <div className="text-sm font-medium">Nenhum sinal disponível ainda</div>
                      <div className="mt-1 text-xs text-zinc-400">Nenhuma oportunidade clara encontrada no momento.</div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Varrer novamente
                </Button>
                <Button href="/plans" variant="ghost">
                  Ver planos
                </Button>
              </div>
            </div>
          ) : null}

          {!data ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-zinc-300">
              <ZairixAvatar className="h-5 w-5 animate-pulse text-white/60" />
              <span>Varrendo sinais públicos…</span>
            </div>
          ) : null}
          {data && "error" in data && data.error === "unauthorized" ? (
            <div className="mt-6 text-sm text-zinc-300">Sessão inválida. Volte ao login.</div>
          ) : null}
        </Container>
      </main>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        variant={upgradeVariant}
        strategyUsed={strategyUsed}
        strategyLimit={strategyLimit === null ? undefined : strategyLimit}
      />
    </div>
  );
}
