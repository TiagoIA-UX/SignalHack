"use client";

import { useEffect, useMemo, useState } from "react";
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
  | { signals: Signal[]; plan: "FREE" | "PRO" | "ELITE"; usage: { signalsSeen: number; limit: number | null } };

type InsightResponse =
  | { error: string }
  | { insight: { id: string; strategic: string; actionable: string; confidence: number }; cached: boolean };

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

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch(() => setData({ error: "failed" }));

    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        const id = j?.user?.id ?? null;
        setMeId(id);
        if (id) setStrategistUsed(readStrategistUsed(id));
      })
      .catch(() => setMeId(null));
  }, []);

  const signals = useMemo(() => {
    if (!data || "error" in data) return [];
    return data.signals;
  }, [data]);

  const plan = data && !("error" in data) ? data.plan : null;
  const planLimited = data && "error" in data && data.error === "plan_limit";

  const strategistLimit = useMemo(() => (plan ? getStrategistDailyLimit(plan) : 0), [plan]);
  const strategistBlocked = plan === "FREE";
  const strategistLimited = plan === "PRO";

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
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="mt-1 text-sm text-zinc-300">Sinais ordenados por score. IA interpreta, você decide.</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <AgentBadge id="scout" />
                <AgentBadge id="decoder" />
                <AgentBadge id="noise_killer" locked={plan === "FREE"} rightLabel={plan === "FREE" ? "bloqueado" : undefined} />
                <AgentBadge
                  id="strategist"
                  locked={plan === "FREE"}
                  rightLabel={
                    plan === "FREE"
                      ? "bloqueado"
                      : plan === "PRO" && strategistLimit !== null
                        ? `${strategistUsed}/${strategistLimit}`
                        : plan === "ELITE"
                          ? "ilimitado"
                          : undefined
                  }
                />
                <span className="text-xs text-zinc-400">rede de agentes especializada (conceitual, com mocks quando necessário)</span>
              </div>
              {plan === "ELITE" ? (
                <div className="mt-2 text-xs text-zinc-400">Acesso total à rede de agentes SignalHack.</div>
              ) : null}
            </div>
            <Button href="/plans" variant="ghost">
              Upgrade
            </Button>
          </div>

          {planLimited ? (
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
                          <div className="mt-1 text-sm text-zinc-200">{insightRes.insight.strategic}</div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-400">Ação sugerida</div>
                          <div className="mt-1 text-sm text-zinc-200">{insightRes.insight.actionable}</div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-zinc-400">
                        Confiança: {insightRes.insight.confidence}
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">IA interpreta, não decide sozinha.</div>
                    </div>
                  ) : null}

                  {insightRes && "error" in insightRes ? (
                    <div className="mt-4 text-sm text-zinc-300">Insight indisponível.</div>
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
