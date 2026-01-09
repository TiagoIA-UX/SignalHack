"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";
import { AgentBadge } from "@/components/AgentBadge";
import { SignalHackAvatar } from "@/components/SignalHackAvatar";
import { UpgradeModal, type UpgradeModalVariant } from "@/components/UpgradeModal";
import { getStrategistDailyLimit, incrementStrategistUsed, readStrategistUsed } from "@/lib/strategistLimit";

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

function parseFiveBlocks(text: string): Array<{ title: string; body: string }> | null {
  if (!text || typeof text !== "string") return null;
  const titles = [
    "1. Contexto essencial",
    "2. O que o sinal realmente indica",
    "3. Risco principal",
    "4. Oportunidade principal",
    "5. Próximo passo sugerido",
  ];
  if (!titles.every((t) => text.includes(t))) return null;

  // Split mantendo o título como delimitador.
  const parts = text.split(/\n(?=\d\. )/g);
  const out: Array<{ title: string; body: string }> = [];
  for (const part of parts) {
    const trimmed = part.trim();
    const firstLineEnd = trimmed.indexOf("\n");
    const title = (firstLineEnd >= 0 ? trimmed.slice(0, firstLineEnd) : trimmed).trim();
    if (!titles.includes(title)) continue;
    const body = (firstLineEnd >= 0 ? trimmed.slice(firstLineEnd + 1) : "").trim();
    out.push({ title, body });
  }
  return out.length === 5 ? out : null;
}

function hasInsight(res: InsightResponse): res is { insight: { id: string; strategic: string; actionable: string; confidence: number }; cached: boolean } {
  return "insight" in res;
}

function isUpgradeRequired(res: InsightResponse): res is { error: "upgrade_required" } {
  return typeof res === "object" && !!res && "error" in res && (res as { error?: unknown }).error === "upgrade_required";
}

export default function DashboardPage() {
  const [data, setData] = useState<SignalsResponse | null>(null);
  const [insightBySignalId, setInsightBySignalId] = useState<Record<string, InsightResponse>>({});
  const [loadingInsightId, setLoadingInsightId] = useState<string | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeVariant, setUpgradeVariant] = useState<UpgradeModalVariant>("strategist_locked");
  const [strategistUsed, setStrategistUsed] = useState(0);
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
        if (id) setStrategistUsed(readStrategistUsed(id));
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

  const strategistLimit = useMemo(() => (plan ? getStrategistDailyLimit(plan) : 0), [plan]);
  const strategistBlocked = plan === "FREE" && !isAdmin;
  const strategistLimited = plan === "PRO" && !isAdmin;

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

    if (strategistBlocked) {
      setUpgradeVariant("strategist_locked");
      setUpgradeOpen(true);
      return;
    }

    if (strategistLimited && strategistLimit !== null && meId) {
      const used = readStrategistUsed(meId);
      if (used >= strategistLimit) {
        setStrategistUsed(used);
        setUpgradeVariant("strategist_limit");
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
      setUpgradeVariant(plan === "PRO" ? "strategist_limit" : "strategist_locked");
      setUpgradeOpen(true);
    }
    if (res.ok && strategistLimited && strategistLimit !== null && meId) {
      const maybeCached = "cached" in json ? (json as { cached?: boolean }).cached : undefined;
      if (!maybeCached) {
        const next = incrementStrategistUsed(meId);
        setStrategistUsed(next);
      }
    }
    setLoadingInsightId(null);
  }

  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-10">
        <Container>
          {briefRes && !("error" in briefRes) ? (
            <Card className="mb-6 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">brief semanal</div>
                  <div className="mt-1 text-base font-semibold text-zinc-100">{briefRes.brief.headline}</div>
                </div>
                <div className="text-xs text-zinc-400">Semana: {new Date(briefRes.weekStart).toLocaleDateString("pt-BR")}</div>
              </div>
              <div className="mt-3 text-sm text-zinc-200">{briefRes.brief.summary}</div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs font-medium text-zinc-200">Janelas abrindo</div>
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
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-xs font-medium text-zinc-200">Janelas fechando</div>
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
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">prioridades</div>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {briefRes.brief.priorities.slice(0, 3).map((p, idx) => (
                      <div key={idx} className="rounded-xl border border-white/10 bg-black p-3">
                        <div className="text-sm font-medium text-zinc-100">{p.signalTitle}</div>
                        <div className="mt-2 text-xs text-zinc-400">Por que agora</div>
                        <div className="mt-1 text-sm text-zinc-200">{p.whyNow}</div>
                        <div className="mt-2 text-xs text-zinc-400">Primeira ação</div>
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

              <div className="mt-4 text-xs text-zinc-400">{briefRes.brief.disclaimer}</div>
            </Card>
          ) : briefRes && "error" in briefRes ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
              {briefRes.error === "upgrade_required"
                ? "Brief semanal disponível no Pro."
                : briefRes.error === "ai_not_configured"
                  ? (briefRes.message ?? "IA não configurada para gerar o brief semanal.")
                  : "Brief semanal indisponível."}
            </div>
          ) : null}

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-300">Sinais ordenados por score. IA interpreta, você decide.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <AgentBadge id="scout" />
                <AgentBadge id="decoder" />
                <AgentBadge id="noise_killer" locked={plan === "FREE" && !isAdmin} rightLabel={plan === "FREE" && !isAdmin ? "bloqueado" : undefined} />
                <AgentBadge
                  id="strategist"
                  locked={plan === "FREE" && !isAdmin}
                  rightLabel={
                    plan === "FREE" && !isAdmin
                      ? "bloqueado"
                      : plan === "PRO" && strategistLimit !== null
                        ? `${strategistUsed}/${strategistLimit}`
                        : plan === "ELITE"
                          ? "ilimitado"
                          : undefined
                  }
                />
                <span className="text-xs text-zinc-400">rede de agentes especializada (conceitual; insights exigem IA configurada)</span>
              </div>
              {plan === "ELITE" ? (
                <div className="mt-2 text-xs text-zinc-400">Acesso total à rede de agentes Signal Hacker.</div>
              ) : null}
            </div>
            <Button href="/plans" variant="ghost">
              Upgrade
            </Button>
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
              <div className="mt-3 text-xs text-zinc-400">Mostrando resultados para: <span className="text-zinc-200">{queryActive}</span></div>
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
              return (
                <Card key={s.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight">{s.title}</h2>
                        <Badge>
                          intenção {s.intent === "HIGH" ? "alta" : s.intent === "MEDIUM" ? "média" : "baixa"}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">{s.source}</div>
                      <div className="mt-2 text-xs text-zinc-400">
                        Detectado pelo <span className="text-zinc-200">Scout Agent</span> • Decodificado pelo{" "}
                        <span className="text-zinc-200">Decoder Agent</span>
                        {plan === "FREE" ? (
                          <>
                            {" "}• Filtro avançado (Noise Killer): <span className="text-zinc-200">Pro</span>
                          </>
                        ) : (
                          <>
                            {" "}• Filtrado pelo <span className="text-zinc-200">Noise Killer</span>
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
                  <p className="mt-3 text-sm text-zinc-200">{s.summary}</p>
                  <div className="mt-3 text-xs text-zinc-400">
                    Registro do sinal: <span className="text-zinc-200">Scout Agent</span> • Classificação: {" "}
                    <span className="text-zinc-200">Decoder Agent</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => loadInsight(s.id)} variant="ghost" disabled={loadingInsightId === s.id}>
                      {loadingInsightId === s.id
                        ? "Strategist Agent em execução…"
                        : plan === "FREE"
                          ? "Gerar insight acionável"
                          : plan === "PRO" && strategistLimit !== null
                            ? `Gerar insight acionável (${strategistUsed}/${strategistLimit})`
                            : "Gerar insight acionável"}
                    </Button>
                  </div>

                  {plan === "FREE" ? (
                    <div className="mt-3 text-xs text-zinc-400">Insight estratégico disponível no Pro.</div>
                  ) : null}

                  {plan === "PRO" && strategistLimit !== null ? (
                    <div className="mt-3 text-xs text-zinc-400">Você usou {strategistUsed}/{strategistLimit} insights estratégicos hoje.</div>
                  ) : null}

                  {insightRes && hasInsight(insightRes) ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">agent insight</div>
                        <SignalHackAvatar className="h-5 w-5 text-white/60" />
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">Estratégia sugerida pelo <span className="text-zinc-200">Strategist Agent</span></div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <div className="text-xs text-zinc-400">Resumo estratégico</div>
                          {(() => {
                            const blocks = parseFiveBlocks(insightRes.insight.strategic);
                            if (!blocks) {
                              return (
                                <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{insightRes.insight.strategic}</div>
                              );
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
                          <div className="text-xs text-zinc-400">Ação sugerida</div>
                          <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">{insightRes.insight.actionable}</div>

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
                                <Button
                                  variant="ghost"
                                  onClick={() => savePlaybook(s.id)}
                                  disabled={playbookSavingId === s.id}
                                >
                                  {playbookBySignalId[s.id] ? "Atualizar plano" : "Salvar plano"}
                                </Button>
                                {playbookBySignalId[s.id] ? (
                                  <div className="text-xs text-zinc-400">Salvo.</div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-zinc-400">
                        Confiança: {insightRes.insight.confidence}
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">IA interpreta, não decide sozinha.</div>
                    </div>
                  ) : null}

                  {insightRes && "error" in insightRes ? (
                    <div className="mt-4 text-sm text-zinc-300">
                      {insightRes.error === "ai_not_configured" ? (
                        <>
                          {insightRes.message ?? "IA não configurada para gerar insights."}
                          {isAdmin ? (
                            <>
                              {" "}
                              <a href="/admin/settings" className="underline underline-offset-4">
                                Abrir configurações
                              </a>
                            </>
                          ) : null}
                        </>
                      ) : insightRes.error === "upgrade_required" ? (
                        "Upgrade necessário para gerar insight."
                      ) : (
                        insightRes.message ?? "Insight indisponível."
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
                <SignalHackAvatar className="h-6 w-6 text-white/60" />
                <div>
                  <div className="text-sm font-medium">Nenhum sinal disponível ainda</div>
                  <div className="mt-1 text-xs text-zinc-400">Scout Agent não encontrou sinais relevantes no momento.</div>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Rodar varredura novamente
                </Button>
                <Button href="/plans" variant="ghost">
                  Ver planos
                </Button>
              </div>
            </div>
          ) : null}

          {!data ? (
            <div className="mt-6 flex items-center gap-3 text-sm text-zinc-300">
              <SignalHackAvatar className="h-5 w-5 animate-pulse text-white/60" />
              <span>Scout Agent varrendo sinais…</span>
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
        strategistUsed={strategistUsed}
        strategistLimit={strategistLimit === null ? undefined : strategistLimit}
      />
    </div>
  );
}
