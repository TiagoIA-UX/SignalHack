"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
import { ModuleBadge } from "@/components/ModuleBadge";
import { ZairixAvatar } from "@/components/ZairixAvatar";
import { getStrategyDailyLimit, readStrategyUsed } from "@/lib/strategyLimit";

type MeResponse =
  | { user: null }
  | { user: { id: string; email: string; plan: "FREE" | "PRO" | "ELITE"; role: "USER" | "ADMIN" } };

type StatsResponse = {
  user: { id: string; email: string; plan: "FREE" | "PRO" | "ELITE"; role: "USER" | "ADMIN" };
  points: {
    today: number;
    total: number;
    level: "Iniciante" | "Operador" | "Insider";
    nextAt: number | null;
    rankLabel: string;
    top10Position: number | null;
  };
  badges: Array<{ key: string; createdAt: string }>;
};

function badgeLabel(key: string) {
  if (key === "first_login") return "Primeiro acesso";
  if (key === "first_insight") return "Primeiro sinal de compra";
  return key;
}

function badgeAttribution(key: string) {
  if (key === "first_login") return "Primeiro sinal registrado (fontes públicas)";
  if (key === "first_insight") return "Primeira priorização com plano de execução";
  return "Fluxo operacional";
}

export default function ProfilePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [strategyUsed, setStrategyUsed] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        setMe(j);
        const id = j?.user?.id ?? null;
        if (id) setStrategyUsed(readStrategyUsed(id));
      })
      .catch(() => setMe({ user: null }));

    fetch("/api/profile/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => (j ? setStats(j) : null))
      .catch(() => null);
  }, []);

  const plan = me?.user ? me.user.plan : null;
  const strategyLimit = useMemo(() => (plan ? getStrategyDailyLimit(plan) : 0), [plan]);
  const strategyBlocked = plan === "FREE";
  const strategyLimited = plan === "PRO";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Perfil</h1>
              <div className="mt-4 text-sm text-zinc-300">
                {me?.user ? (
                  <>
                    <div>Email: {me.user.email}</div>
                    <div className="mt-1">Plano: {me.user.plan}</div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <ZairixAvatar className="h-5 w-5 animate-pulse text-white/60" />
                    <span>Carregando seu perfil…</span>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">módulos ativos</div>
                  <ZairixAvatar className="h-5 w-5 text-white/60" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ModuleBadge id="atlas" />
                  <ModuleBadge id="nexus" />
                  <ModuleBadge id="pulse" locked={plan === "FREE"} rightLabel={plan === "FREE" ? "bloqueado" : undefined} />
                  <ModuleBadge
                    id="artisan"
                    locked={strategyBlocked}
                    rightLabel={
                      strategyBlocked
                        ? "bloqueado"
                        : strategyLimited && strategyLimit !== null
                          ? `${strategyUsed}/${strategyLimit}`
                          : plan === "ELITE"
                            ? "ilimitado"
                            : undefined
                    }
                  />
                </div>
                <div className="mt-3 text-xs text-zinc-400">
                  Fontes públicas detectam • Validação organiza • Filtro de ruído reduz falsos positivos • Estratégia sugere plano
                </div>
                {strategyBlocked ? (
                  <div className="mt-3 text-xs text-zinc-400">Estratégia (priorização + plano) disponível no Pro.</div>
                ) : null}
                {strategyLimited && strategyLimit !== null ? (
                  <div className="mt-3 text-xs text-zinc-400">Você usou {strategyUsed}/{strategyLimit} teses estratégicas hoje.</div>
                ) : null}
                {plan === "ELITE" ? (
                  <div className="mt-3 text-xs text-zinc-400">Acesso total ao fluxo operacional do SignalForge.</div>
                ) : null}
              </div>

              {stats ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">gamificação</div>
                  <div className="mt-2 grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-zinc-400">Pontos (hoje)</div>
                      <div className="text-lg font-semibold">{stats.points.today}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Total</div>
                      <div className="text-lg font-semibold">{stats.points.total}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400">Nível</div>
                      <div className="text-lg font-semibold">{stats.points.level}</div>
                      {stats.points.nextAt ? (
                        <div className="text-xs text-zinc-400">Próximo em {stats.points.nextAt} pts</div>
                      ) : (
                        <div className="text-xs text-zinc-400">Topo atual</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-zinc-400">
                    Ranking simbólico: {stats.points.rankLabel}
                    {stats.points.top10Position ? ` • top 10: #${stats.points.top10Position}` : ""}
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-zinc-400">Badges</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {stats.badges.length ? (
                        stats.badges.map((b) => (
                          <span key={b.key} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black px-2 py-0.5 text-xs">
                            <span className="text-zinc-200">{badgeLabel(b.key)}</span>
                            <span className="text-zinc-500">•</span>
                            <span className="text-zinc-400">{badgeAttribution(b.key)}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-400">Sem badges ainda. Comece pelo primeiro sinal.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-center gap-3 text-sm text-zinc-300">
                  <ZairixAvatar className="h-5 w-5 animate-pulse text-white/60" />
                  <span>Carregando métricas e histórico…</span>
                </div>
              )}
              <div className="mt-6">
                <Button href="/profile/privacy" variant="ghost">
                  Privacidade & consentimento
                </Button>
              </div>
              <div className="mt-2">
                <Button onClick={logout} variant="ghost">
                  Sair
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
