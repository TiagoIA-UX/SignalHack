"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
import { ZairixAvatar } from "@/components/ZairixAvatar";

type MoneyHunt =
  | "REVOPS_AUTOMATION"
  | "DUNNING"
  | "B2B_LEADS"
  | "COMPLIANCE"
  | "ECOM"
  | "OTHER";

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

type PlaybookPlan = { id: string; hypothesis: string; experiment: string; metric: string; updatedAt: string };
type PlaybookResponse = { plan: PlaybookPlan | null } | { error: string; message?: string };

type ActivePlaybook = {
  signalId: string;
  signalTitle: string;
  hunt: MoneyHunt;
  hypothesis: string;
  experiment: string;
  metric: string;
  updatedAt: string;
};

const ACTIVE_PLAYBOOK_STORAGE_KEY = "sh_active_playbook";

function fmtIntent(intent: Signal["intent"]) {
  return intent === "HIGH" ? "alta" : intent === "MEDIUM" ? "média" : "baixa";
}

function labelForHunt(h: MoneyHunt) {
  switch (h) {
    case "REVOPS_AUTOMATION":
      return "Automatizar RevOps";
    case "DUNNING":
      return "Recuperar receita (dunning)";
    case "B2B_LEADS":
      return "Leads B2B";
    case "COMPLIANCE":
      return "Compliance & Privacidade";
    case "ECOM":
      return "E-commerce";
    case "OTHER":
      return "Outro";
  }
}

function sanitizeCopy(text: string) {
  if (!text || typeof text !== "string") return text;
  return text
    .replaceAll("Insights", "Sinais de compra")
    .replaceAll("Insight", "Sinal de compra")
    .replaceAll("insights", "sinais de compra")
    .replaceAll("insight", "sinal de compra")
    .replaceAll("Oportunidade principal", "Oportunidade de ganhar dinheiro")
    .replaceAll("Tese principal", "Oportunidade de ganhar dinheiro");
}

function parseFiveBlocks(text: string): Array<{ title: string; body: string }> | null {
  if (!text || typeof text !== "string") return null;
  const required = [
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "5. Próximo passo sugerido",
  ];
  const has4 =
    text.includes("4. Oportunidade de ganhar dinheiro") || text.includes("4. Oportunidade principal") || text.includes("4. Tese principal");
  if (!required.every((h) => text.includes(h)) || !has4) return null;

  const titleMap = new Map<string, string>([
    ["1. Contexto essencial", "1. Contexto essencial"],
    ["2. O que o sinal realmente indica", "2. O que o sinal realmente indica"],
    ["3. Risco principal", "3. Risco principal"],
    ["4. Oportunidade principal", "4. Oportunidade de ganhar dinheiro"],
    ["4. Tese principal", "4. Oportunidade de ganhar dinheiro"],
    ["4. Oportunidade de ganhar dinheiro", "4. Oportunidade de ganhar dinheiro"],
    ["5. Próximo passo sugerido", "5. Próximo passo sugerido"],
  ]);

  const canonical = [
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "4. Oportunidade de ganhar dinheiro",
    "5. Próximo passo sugerido",
  ];

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

  const hasAll = canonical.every((t) => out.some((b) => b.title === t));
  return out.length === 5 && hasAll ? out : null;
}

function scoreSignalForHunt(signal: Signal, hunt: MoneyHunt) {
  const text = `${signal.title} ${signal.summary}`.toLowerCase();

  const keywordGroups: Record<MoneyHunt, string[]> = {
    REVOPS_AUTOMATION: ["revops", "pipeline", "receita", "crm", "autom", "follow", "leads", "cadência"],
    DUNNING: ["dunning", "cobran", "inadimpl", "churn", "chargeback", "billing", "renov"],
    B2B_LEADS: ["leads", "b2b", "outbound", "sdr", "abm", "prospec", "cold"],
    COMPLIANCE: ["compliance", "lgpd", "risco", "auditoria", "privacidade", "seguran", "iso"],
    ECOM: ["e-commerce", "ecommerce", "shopify", "checkout", "carrinho", "pix", "marketplace"],
    OTHER: [],
  };

  let keywordHits = 0;
  for (const kw of keywordGroups[hunt]) {
    if (text.includes(kw)) keywordHits += 1;
  }

  const intentWeight = signal.intent === "HIGH" ? 16 : signal.intent === "MEDIUM" ? 8 : 2;
  const scoreWeight = Math.max(0, Math.min(100, signal.score)) * 0.2;
  const growthWeight = Math.max(0, Math.min(100, signal.growthPct)) * 0.12;
  const keywordWeight = keywordHits * 10;

  return keywordWeight + intentWeight + scoreWeight + growthWeight;
}

function pickTop3(signals: Signal[], hunt: MoneyHunt) {
  const ranked = [...signals].sort((a, b) => scoreSignalForHunt(b, hunt) - scoreSignalForHunt(a, hunt));
  return ranked.slice(0, 3);
}

export default function DashboardOperatorPage() {
  const [hunt, setHunt] = useState<MoneyHunt | null>(null);
  const [signalsRes, setSignalsRes] = useState<SignalsResponse | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  const [activePlaybook, setActivePlaybook] = useState<ActivePlaybook | null>(null);

  const [insightRes, setInsightRes] = useState<InsightResponse | null>(null);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const [playbook, setPlaybook] = useState<PlaybookPlan | null>(null);
  const [draft, setDraft] = useState<{ hypothesis: string; experiment: string; metric: string }>({
    hypothesis: "",
    experiment: "",
    metric: "",
  });
  const [saving, setSaving] = useState(false);

  const signals = useMemo(() => {
    if (!signalsRes || "error" in signalsRes) return [];
    return signalsRes.signals;
  }, [signalsRes]);

  const plan = signalsRes && !("error" in signalsRes) ? signalsRes.plan : null;
  const isAdmin = signalsRes && !("error" in signalsRes) ? signalsRes.role === "ADMIN" : false;

  const top3 = useMemo(() => {
    if (!hunt) return [];
    return pickTop3(signals, hunt);
  }, [signals, hunt]);

  const selectedSignal = useMemo(() => {
    if (!selectedSignalId) return null;
    return signals.find((s) => s.id === selectedSignalId) ?? null;
  }, [signals, selectedSignalId]);

  async function loadSignals() {
    setLoadingSignals(true);
    setInsightRes(null);
    setPlaybook(null);
    setDraft({ hypothesis: "", experiment: "", metric: "" });
    try {
      const r = await fetch("/api/signals", { cache: "no-store" });
      const j = (await r.json()) as SignalsResponse;
      setSignalsRes(j);
      if (!("error" in j) && j.signals?.[0]?.id) {
        setSelectedSignalId(null);
      }
    } catch {
      setSignalsRes({ error: "failed" });
    } finally {
      setLoadingSignals(false);
    }
  }

  async function loadPlaybook(signalId: string) {
    const res = await fetch(`/api/playbooks?signalId=${encodeURIComponent(signalId)}`, { cache: "no-store" });
    const json = (await res.json()) as PlaybookResponse;
    if ("plan" in json) {
      setPlaybook(json.plan);
      if (json.plan) {
        setDraft({ hypothesis: json.plan.hypothesis, experiment: json.plan.experiment, metric: json.plan.metric });
      }
    }
  }

  async function generate(signalId: string) {
    setLoadingInsight(true);
    setInsightRes(null);
    setPlaybook(null);
    setDraft({ hypothesis: "", experiment: "", metric: "" });
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signalId }),
      });
      const json = (await res.json()) as InsightResponse;
      setInsightRes(json);
      if (res.ok && !("error" in json)) {
        await loadPlaybook(signalId);
      }
    } catch {
      setInsightRes({ error: "failed" });
    } finally {
      setLoadingInsight(false);
    }
  }

  async function save(signalId: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/playbooks", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signalId, ...draft }),
      });
      const json = (await res.json()) as PlaybookResponse;
      if (res.ok && "plan" in json) {
        setPlaybook(json.plan);

        if (json.plan && hunt && selectedSignal) {
          const nextActive: ActivePlaybook = {
            signalId,
            signalTitle: selectedSignal.title,
            hunt,
            hypothesis: json.plan.hypothesis,
            experiment: json.plan.experiment,
            metric: json.plan.metric,
            updatedAt: json.plan.updatedAt,
          };
          setActivePlaybook(nextActive);
          try {
            localStorage.setItem(ACTIVE_PLAYBOOK_STORAGE_KEY, JSON.stringify(nextActive));
          } catch {
            // noop
          }
        }
      }
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACTIVE_PLAYBOOK_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ActivePlaybook;
      if (parsed?.signalId && parsed?.hypothesis && parsed?.experiment && parsed?.metric && parsed?.hunt) {
        setActivePlaybook(parsed);
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    if (!hunt) return;
    void loadSignals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hunt]);

  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-10">
        <Container>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Modo Operador</h1>
                  <p className="mt-1 text-sm text-zinc-300">Escolha o alvo → escolha 1 sinal → gere e salve um playbook de 7 dias.</p>
                </div>
                <Button href="/visao-estrategica" variant="ghost">
                  Abrir Visão Estratégica
                </Button>
              </div>
            </div>

            <Card className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">objetivo ativo</div>
                  <div className="mt-1 text-sm font-medium text-zinc-100">
                    {activePlaybook ? activePlaybook.signalTitle : "Nenhuma"}
                  </div>
                </div>
                {activePlaybook ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setHunt(activePlaybook.hunt);
                      setSelectedSignalId(activePlaybook.signalId);
                    }}
                  >
                    Retomar
                  </Button>
                ) : null}
              </div>

              {activePlaybook ? (
                <div className="mt-3 space-y-3">
                  {(() => {
                    const updatedAtMs = Date.parse(activePlaybook.updatedAt);
                    const days = Number.isFinite(updatedAtMs) ? (Date.now() - updatedAtMs) / 86_400_000 : null;
                    const status =
                      days === null ? "em andamento" : days <= 7 ? `rodando (D+${Math.floor(days)})` : "fora da janela (7 dias)";

                    return (
                      <div className="text-xs text-zinc-400">
                        Alvo: <span className="text-zinc-200">{labelForHunt(activePlaybook.hunt)}</span> • Status:{" "}
                        <span className="text-zinc-200">{status}</span>
                      </div>
                    );
                  })()}

                  <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-3">
                    <div className="text-xs text-zinc-400">Hipótese</div>
                    <div className="mt-1 text-sm text-zinc-100">{activePlaybook.hypothesis}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-3">
                    <div className="text-xs text-zinc-400">Experimento</div>
                    <div className="mt-1 text-sm text-zinc-100">{activePlaybook.experiment}</div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-3">
                    <div className="text-xs text-zinc-400">Métrica (7 dias)</div>
                    <div className="mt-1 text-sm text-zinc-100">{activePlaybook.metric}</div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-zinc-500">Atualizado: {new Date(activePlaybook.updatedAt).toLocaleString("pt-BR")}</div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setActivePlaybook(null);
                        try {
                          localStorage.removeItem(ACTIVE_PLAYBOOK_STORAGE_KEY);
                        } catch {
                          // noop
                        }
                      }}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-zinc-300">
                  Salve um playbook e ele aparece aqui como seu painel de execução.
                </div>
              )}
            </Card>
          </div>

          {!hunt ? (
            <Card className="mt-6 p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">passo 1</div>
              <div className="mt-2 text-lg font-semibold text-zinc-100">Qual dinheiro você quer caçar esta semana?</div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {([
                  "REVOPS_AUTOMATION",
                  "DUNNING",
                  "B2B_LEADS",
                  "COMPLIANCE",
                  "ECOM",
                  "OTHER",
                ] as MoneyHunt[]).map((h) => (
                  <button
                    key={h}
                    onClick={() => setHunt(h)}
                    className="rounded-2xl border border-emerald-500/15 bg-black/40 p-4 text-left transition-colors hover:border-emerald-500/25"
                  >
                    <div className="text-sm font-medium text-zinc-100">{labelForHunt(h)}</div>
                    <div className="mt-1 text-xs text-zinc-400">Ver 3 sinais ativos agora.</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-xs text-zinc-500">Sem relatório. Só operação.</div>
            </Card>
          ) : (
            <>
              <Card className="mt-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">passo 1</div>
                    <div className="mt-2 text-lg font-semibold text-zinc-100">Alvo: {labelForHunt(hunt)}</div>
                    <div className="mt-2 text-sm text-zinc-300">Agora escolha 1 sinal e gere o playbook.</div>
                    <div className="mt-3 text-xs text-zinc-400">
                      Plano: {plan ?? "…"} {isAdmin ? "• admin" : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setHunt(null);
                        setSignalsRes(null);
                        setSelectedSignalId(null);
                        setInsightRes(null);
                        setPlaybook(null);
                      }}
                    >
                      Trocar alvo
                    </Button>
                    <Button variant="ghost" onClick={() => void loadSignals()} disabled={loadingSignals}>
                      {loadingSignals ? "Atualizando…" : "Atualizar"}
                    </Button>
                  </div>
                </div>
              </Card>

              {hunt && loadingSignals ? (
                <div className="mt-6 flex items-center gap-3 text-sm text-zinc-300">
                  <ZairixAvatar className="h-5 w-5 animate-pulse text-white/60" />
                  <span>Carregando sinais…</span>
                </div>
              ) : null}

              {signalsRes && "error" in signalsRes ? (
                <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-black/40 p-4 text-sm text-zinc-200">
                  {signalsRes.error === "plan_limit"
                    ? "Limite diário do Free atingido. Faça upgrade para continuar operando."
                    : signalsRes.error === "db_unavailable"
                      ? "Banco indisponível agora."
                      : "Falha ao carregar sinais."}
                  <div className="mt-3 flex gap-2">
                    <Button href="/plans" variant="ghost">
                      Ver planos
                    </Button>
                    <Button href="/visao-estrategica" variant="ghost">
                      Abrir Visão Estratégica
                    </Button>
                  </div>
                </div>
              ) : null}

              {signalsRes && !("error" in signalsRes) ? (
                <Card className="mt-6 p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">passo 2</div>
                  <div className="mt-2 text-lg font-semibold text-zinc-100">Escolha 1 sinal (top 3)</div>
                  <div className="mt-5 grid gap-3 lg:grid-cols-3">
                    {top3.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSignalId(s.id);
                          setInsightRes(null);
                          setPlaybook(null);
                          setDraft({ hypothesis: "", experiment: "", metric: "" });
                        }}
                        className={`rounded-2xl border bg-black/40 p-4 text-left transition-colors hover:border-emerald-500/25 ${
                          selectedSignalId === s.id ? "border-emerald-500/35" : "border-emerald-500/15"
                        }`}
                      >
                        <div className="text-xs text-zinc-400">{s.source}</div>
                        <div className="mt-2 text-sm font-medium text-zinc-100">{s.title}</div>
                        <div className="mt-2 text-xs text-zinc-400">{s.summary}</div>
                        <div className="mt-3 text-xs text-zinc-400">
                          intenção {fmtIntent(s.intent)} • score {s.score} • +{s.growthPct}%
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-zinc-500">Depois disso, você gera tese + plano e executa.</div>
                </Card>
              ) : null}

              {selectedSignal ? (
                <Card className="mt-6 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">passo 3</div>
                      <div className="mt-2 text-lg font-semibold text-zinc-100">Transformar em dinheiro</div>
                      <div className="mt-2 text-sm text-zinc-300">Escolhido: {selectedSignal.title}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => void generate(selectedSignal.id)} disabled={loadingInsight}>
                        {loadingInsight ? "Gerando…" : "Gerar tese + plano"}
                      </Button>
                      <Button href="/visao-estrategica" variant="ghost">
                        Ver na Visão Estratégica
                      </Button>
                    </div>
                  </div>

                  {insightRes && "error" in insightRes ? (
                    <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-black/40 p-4 text-sm text-zinc-200">
                      {insightRes.error === "upgrade_required"
                        ? "Upgrade necessário para gerar a tese + plano."
                        : insightRes.error === "ai_not_configured"
                          ? (insightRes.message ?? "IA não configurada.")
                          : insightRes.error === "ai_failed"
                            ? (insightRes.message ?? "IA indisponível agora.")
                            : "Falha ao gerar."}
                      <div className="mt-3 flex gap-2">
                        <Button href="/plans" variant="ghost">
                          Ver planos
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {insightRes && !("error" in insightRes) ? (
                    <div className="mt-4 rounded-2xl border border-emerald-500/15 bg-black/40 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">tese + plano</div>
                        <ZairixAvatar className="h-5 w-5 text-white/60" />
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">Confiança: {insightRes.insight.confidence}</div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div>
                          <div className="text-xs text-zinc-400">Resumo</div>
                          {(() => {
                            const strategic = sanitizeCopy(insightRes.insight.strategic);
                            const blocks = parseFiveBlocks(strategic);
                            if (!blocks) {
                              return <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{strategic}</div>;
                            }
                            return (
                              <div className="mt-2 space-y-3">
                                {blocks.map((b) => (
                                  <div key={b.title} className="rounded-xl border border-emerald-500/15 bg-black/40 p-3">
                                    <div className="text-xs font-medium text-zinc-200">{b.title}</div>
                                    <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{b.body}</div>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        <div>
                          <div className="text-xs text-zinc-400">Ação sugerida</div>
                          <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-200">{sanitizeCopy(insightRes.insight.actionable)}</div>

                          <div className="mt-4 rounded-xl border border-emerald-500/15 bg-black/40 p-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">plano de execução (7 dias)</div>
                            <div className="mt-3 space-y-3">
                              <div>
                                <div className="text-xs text-zinc-400">Hipótese</div>
                                <textarea
                                  value={draft.hypothesis}
                                  onChange={(e) => setDraft((p) => ({ ...p, hypothesis: e.target.value }))}
                                  className="mt-2 min-h-[84px] w-full rounded-xl border border-emerald-500/15 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                  placeholder="Se eu atacar X com Y, espero ver Z."
                                />
                              </div>
                              <div>
                                <div className="text-xs text-zinc-400">Experimento</div>
                                <textarea
                                  value={draft.experiment}
                                  onChange={(e) => setDraft((p) => ({ ...p, experiment: e.target.value }))}
                                  className="mt-2 min-h-[96px] w-full rounded-xl border border-emerald-500/15 bg-black px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                  placeholder="Passo 1… Passo 2… Passo 3…"
                                />
                              </div>
                              <div>
                                <div className="text-xs text-zinc-400">Métrica (7 dias)</div>
                                <input
                                  value={draft.metric}
                                  onChange={(e) => setDraft((p) => ({ ...p, metric: e.target.value }))}
                                  className="mt-2 h-11 w-full rounded-xl border border-emerald-500/15 bg-black px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                  placeholder="ex.: 10 respostas qualificadas, 3 calls"
                                />
                              </div>

                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  onClick={() => void save(selectedSignal.id)}
                                  disabled={
                                    saving ||
                                    draft.hypothesis.trim().length < 8 ||
                                    draft.experiment.trim().length < 8 ||
                                    draft.metric.trim().length < 4
                                  }
                                >
                                  {saving ? "Salvando…" : playbook ? "Atualizar playbook" : "Salvar playbook"}
                                </Button>
                                {playbook ? <div className="text-xs text-zinc-400">Salvo.</div> : null}
                              </div>
                              <div className="text-xs text-zinc-500">Critério: se não bater a métrica, ajusta ou mata.</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </Card>
              ) : null}
            </>
          )}
        </Container>
      </main>
    </div>
  );
}
