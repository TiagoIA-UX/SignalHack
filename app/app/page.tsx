"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";

type Intent = "BAIXA" | "MÉDIA" | "ALTA";

type Signal = {
  id: string;
  title: string;
  summary: string;
  source: string;
  intent: Intent;
  score: number; // 0..100 (heurístico)
  growthPct: number; // 0..100 (heurístico)
};

type Playbook = {
  signalId: string;
  signalTitle: string;
  hypothesis: string;
  experiment: string;
  metric: string;
  updatedAt: string;
};

const STORAGE_SIGNALS = "zairix_signals_v1";
const STORAGE_PLAYBOOK = "zairix_playbook_v1";

const DEMO_SIGNALS: Signal[] = [
  {
    id: "demo-1",
    title: "Times de RevOps correndo para automatizar follow‑up e roteamento",
    summary:
      "Quando a operação aperta, a prioridade vira eficiência e previsibilidade — isso costuma vir com orçamento e urgência.",
    source: "LinkedIn + vagas",
    intent: "ALTA",
    score: 91,
    growthPct: 38,
  },
  {
    id: "demo-2",
    title: "Busca crescente por “privacy-first analytics”",
    summary:
      "Empresas querem medir sem risco — janela boa para reposicionamento B2B com compliance claro e implantação rápida.",
    source: "Busca + comparativos",
    intent: "MÉDIA",
    score: 76,
    growthPct: 22,
  },
  {
    id: "demo-3",
    title: "Discussões sobre “workflows automatizados” nas comunidades",
    summary:
      "Muita atenção e pouca intenção direta: serve para narrativa e timing, mas exige recorte de ICP para converter.",
    source: "Comunidades",
    intent: "BAIXA",
    score: 63,
    growthPct: 14,
  },
];

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function uid(prefix = "s") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreFromText(title: string, summary: string, intent: Intent) {
  const text = `${title} ${summary}`.toLowerCase();
  const kw = ["orçamento", "budget", "revops", "pipeline", "crm", "dunning", "inadimpl", "compliance", "lgpd", "auditoria", "sdr", "outbound"];
  let hits = 0;
  for (const k of kw) if (text.includes(k)) hits += 1;
  const intentW = intent === "ALTA" ? 22 : intent === "MÉDIA" ? 12 : 5;
  const base = 45 + hits * 7 + intentW;
  return clamp(Math.round(base), 40, 98);
}

function defaultPlaybookFor(signal: Signal): Pick<Playbook, "hypothesis" | "experiment" | "metric"> {
  const hypothesis = `Se eu oferecer uma prova de valor curta para “${signal.title}”, parte do público vai responder porque o benefício é claro e o risco é baixo.`;
  const experiment =
    "Criar 1 página simples com promessa + caso de uso. Fazer 20 abordagens (email/DM) com motivo e ângulo. Medir resposta e agendar 3 conversas rápidas.";
  const metric = "Meta em 7 dias: 20 contatos → 6 respostas → 3 calls → 1 piloto.";
  return { hypothesis, experiment, metric };
}

function buildInsight(signal: Signal) {
  const contexto =
    "Este sinal aponta para gente com dor concreta (tempo, receita ou risco). Quando a dor é concreta, a conversa vira decisão mais rápido.";
  const indica =
    signal.intent === "ALTA"
      ? "Existe urgência e chance real de orçamento. Você pode propor um piloto curto com resultado medível."
      : signal.intent === "MÉDIA"
        ? "Existe interesse e comparação ativa. O recorte (ICP + promessa) precisa ser claro para converter."
        : "Existe curiosidade, mas ainda falta urgência. Use para narrativa e depois faça um recorte mais específico.";

  const risco =
    "O maior risco é ficar genérico demais (sem recorte). Outro risco é prometer demais sem um teste simples e mensurável.";

  const oportunidade =
    "Empacotar como oferta de implantação curta (7–14 dias), com um resultado explícito e um critério de decisão: continuar, ajustar ou parar.";

  const proximo =
    "Escolha 1 micro‑público, escreva 1 promessa, rode 20 contatos em 48h e ajuste pela taxa de resposta (não pela opinião).";

  return [
    { title: "1) Contexto essencial", body: contexto },
    { title: "2) O que o sinal realmente indica", body: indica },
    { title: "3) Risco principal", body: risco },
    { title: "4) Oportunidade de ganhar dinheiro", body: oportunidade },
    { title: "5) Próximo passo sugerido", body: proximo },
  ];
}

export default function AppPage() {
  const [online, setOnline] = useState(true);

  const [signals, setSignals] = useState<Signal[]>(DEMO_SIGNALS);
  const [selectedId, setSelectedId] = useState<string>(DEMO_SIGNALS[0]?.id ?? "");

  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newSource, setNewSource] = useState("Manual");
  const [newIntent, setNewIntent] = useState<Intent>("MÉDIA");

  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [draft, setDraft] = useState<{ hypothesis: string; experiment: string; metric: string }>({
    hypothesis: "",
    experiment: "",
    metric: "",
  });

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const savedSignals = safeJsonParse<Signal[]>(localStorage.getItem(STORAGE_SIGNALS));
    if (savedSignals && Array.isArray(savedSignals) && savedSignals.length > 0) {
      setSignals(savedSignals);
      setSelectedId(savedSignals[0]?.id ?? "");
    }
    const savedPlaybook = safeJsonParse<Playbook>(localStorage.getItem(STORAGE_PLAYBOOK));
    if (savedPlaybook) {
      setPlaybook(savedPlaybook);
      setDraft({ hypothesis: savedPlaybook.hypothesis, experiment: savedPlaybook.experiment, metric: savedPlaybook.metric });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_SIGNALS, JSON.stringify(signals));
  }, [signals]);

  useEffect(() => {
    if (playbook) localStorage.setItem(STORAGE_PLAYBOOK, JSON.stringify(playbook));
  }, [playbook]);

  const selected = useMemo(() => signals.find((s) => s.id === selectedId) ?? null, [signals, selectedId]);
  const insight = useMemo(() => (selected ? buildInsight(selected) : null), [selected]);

  function addSignal() {
    const title = newTitle.trim();
    const summary = newSummary.trim();
    const source = newSource.trim() || "Manual";
    if (title.length < 6 || summary.length < 10) return;

    const s: Signal = {
      id: uid("signal"),
      title,
      summary,
      source,
      intent: newIntent,
      score: scoreFromText(title, summary, newIntent),
      growthPct: clamp(Math.round(10 + Math.random() * 45), 10, 55),
    };
    setSignals((prev) => [s, ...prev]);
    setSelectedId(s.id);
    setNewTitle("");
    setNewSummary("");
  }

  function loadDefaultPlaybook() {
    if (!selected) return;
    const base = defaultPlaybookFor(selected);
    setDraft(base);
  }

  function savePlaybook() {
    if (!selected) return;
    const hypothesis = draft.hypothesis.trim();
    const experiment = draft.experiment.trim();
    const metric = draft.metric.trim();
    if (hypothesis.length < 8 || experiment.length < 8 || metric.length < 4) return;
    setPlaybook({
      signalId: selected.id,
      signalTitle: selected.title,
      hypothesis,
      experiment,
      metric,
      updatedAt: new Date().toISOString(),
    });
  }

  function exportJson() {
    const payload = { signals, playbook };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zairix-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetLocal() {
    localStorage.removeItem(STORAGE_SIGNALS);
    localStorage.removeItem(STORAGE_PLAYBOOK);
    setSignals(DEMO_SIGNALS);
    setSelectedId(DEMO_SIGNALS[0]?.id ?? "");
    setPlaybook(null);
    setDraft({ hypothesis: "", experiment: "", metric: "" });
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">app liberado • sem login • sem bloqueio</div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">Operação: sinal → decisão → ação</h1>
                <p className="mt-2 text-sm text-zinc-300">
                  Você pode usar agora. Seus dados ficam no seu navegador (local). Se estiver offline, o app continua funcionando.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{online ? "Online" : "Offline"}</Badge>
                <Button variant="ghost" onClick={exportJson}>
                  Exportar
                </Button>
                <Button variant="ghost" onClick={resetLocal}>
                  Limpar tudo
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-1">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">1) Radar (sinais)</div>
                <p className="mt-2 text-sm text-zinc-300">
                  Escolha um sinal e siga o passo a passo. Se quiser, adicione o seu próprio sinal.
                </p>

                <div className="mt-5 space-y-2">
                  <label className="text-xs text-zinc-400">Título</label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Empresas contratando RevOps + automação"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                  />
                  <label className="text-xs text-zinc-400">Resumo</label>
                  <textarea
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="O que você viu e por que isso importa?"
                    className="min-h-24 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-zinc-400">Fonte</label>
                      <input
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400">Intenção</label>
                      <select
                        value={newIntent}
                        onChange={(e) => setNewIntent(e.target.value as Intent)}
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                      >
                        <option value="BAIXA">Baixa</option>
                        <option value="MÉDIA">Média</option>
                        <option value="ALTA">Alta</option>
                      </select>
                    </div>
                  </div>
                  <Button onClick={addSignal} disabled={newTitle.trim().length < 6 || newSummary.trim().length < 10}>
                    Adicionar sinal
                  </Button>
                </div>

                <div className="mt-6 space-y-2">
                  {signals.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                        s.id === selectedId
                          ? "border-emerald-500/35 bg-emerald-500/10"
                          : "border-white/10 bg-black/30 hover:border-emerald-500/20"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-zinc-100">{s.title}</div>
                        <Badge className="shrink-0">{s.intent}</Badge>
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">
                        Fonte: {s.source} • Score: {s.score} • Cresc: {s.growthPct}%
                      </div>
                      <div className="mt-2 text-sm text-zinc-300">{s.summary}</div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">2) Validador + 3) Estratégia</div>
                {!selected ? (
                  <p className="mt-3 text-sm text-zinc-300">Escolha um sinal à esquerda.</p>
                ) : (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge>Orquestração de agentes</Badge>
                      <Badge>Zero login</Badge>
                      <Badge>Dados locais</Badge>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-emerald-100">{selected.title}</h2>
                    <p className="mt-2 text-sm text-zinc-300">{selected.summary}</p>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {insight?.map((b) => (
                        <div key={b.title} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                          <div className="text-xs font-bold text-emerald-200">{b.title}</div>
                          <div className="mt-2 text-sm text-zinc-200">{b.body}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 border-t border-white/5 pt-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Playbook (7 dias)</div>
                          <div className="mt-1 text-sm text-zinc-300">Escreva simples. Depois refine com a realidade.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={loadDefaultPlaybook}>
                            Preencher exemplo
                          </Button>
                          <Button onClick={savePlaybook}>Salvar</Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        <div>
                          <label className="text-xs text-zinc-400">Hipótese</label>
                          <textarea
                            value={draft.hypothesis}
                            onChange={(e) => setDraft((p) => ({ ...p, hypothesis: e.target.value }))}
                            className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Experimento</label>
                          <textarea
                            value={draft.experiment}
                            onChange={(e) => setDraft((p) => ({ ...p, experiment: e.target.value }))}
                            className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Métrica</label>
                          <input
                            value={draft.metric}
                            onChange={(e) => setDraft((p) => ({ ...p, metric: e.target.value }))}
                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                          />
                        </div>
                      </div>

                      {playbook ? (
                        <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-sm text-zinc-200">
                          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Salvo localmente</div>
                          <div className="mt-2">
                            <strong>Última atualização:</strong> {new Date(playbook.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-400">
                          Nada salvo ainda. Quando você clicar em <strong>Salvar</strong>, fica guardado no seu navegador.
                        </div>
                      )}

                      <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-300">
                        <strong>Garantia psicológica:</strong> aqui não existe bloqueio. Você usa tudo agora. Se quiser suporte/licença,
                        é fora do sistema — e você decide.
                        <div className="mt-2">
                          <Button href="/acquire" variant="ghost">
                            Ver opções externas
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}

