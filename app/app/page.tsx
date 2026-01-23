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
  createdAt: string; // ISO date
  collectedBy?: string; // quem registrou/credit
  validUntil?: string; // ISO date - data até quando o sinal é considerado recente
};

type Playbook = {
  signalId: string;
  signalTitle: string;
  hypothesis: string;
  experiment: string;
  metric: string;
  updatedAt: string;
};

const STORAGE_SIGNALS = "signalhack_signals_v1";
const STORAGE_PLAYBOOK = "signalhack_playbook_v1";

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
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    collectedBy: "Demo",
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
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    collectedBy: "Demo",
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
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    collectedBy: "Demo",
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

function addDays(dateIso: string, days: number) {
  const d = new Date(dateIso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
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
  const hypothesis = `Se eu oferecer uma prova de valor curta para "${signal.title}", parte do público vai responder porque o benefício é claro e o risco é baixo.`;
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

export default function HomePage() {
  const [signals, setSignals] = useState<Signal[]>(DEMO_SIGNALS);
  const [selectedId, setSelectedId] = useState<string>(DEMO_SIGNALS[0]?.id ?? "");
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [draft, setDraft] = useState<{ hypothesis: string; experiment: string; metric: string }>({ hypothesis: "", experiment: "", metric: "" });

  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newCollectedBy, setNewCollectedBy] = useState("");
  const [newIntent, setNewIntent] = useState<Intent>("MÉDIA");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizSignal, setWizSignal] = useState("");
  const [wizBuyer, setWizBuyer] = useState("");
  const [wizWhy, setWizWhy] = useState("");
  const [wizUrgency, setWizUrgency] = useState("");
  const [wizBudget, setWizBudget] = useState("");
  const [wizMetric, setWizMetric] = useState("");

  const [online, setOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    if (typeof window !== "undefined") {
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      }
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

  function resetWizard() {
    setWizardStep(1);
    setWizSignal("");
    setWizBuyer("");
    setWizUrgency("");
    setWizBudget("");
    setWizMetric("");
  }

  function yesCount() {
    return [wizBuyer, wizUrgency, wizBudget].filter((v) => v === "SIM").length;
  }

  function inferredIntent(): Intent {
    const c = yesCount();
    if (c >= 3) return "ALTA";
    if (c === 2) return "MÉDIA";
    return "BAIXA";
  }

function metricValid(text: string) {
      const s = text.toLowerCase();
      const hasNumber = /\d+/.test(s);
      const keywords = ["contat", "lead", "respost", "reuni", "call", "venda", "sales"]; 
      const hasKeyword = keywords.some((k) => s.includes(k));
      return hasNumber || hasKeyword;
    }

    function finishWizard() {
    const signalText = wizSignal.trim();
    const metricText = wizMetric.trim();
    if (signalText.length < 12) return;
    if (!wizBuyer || !wizUrgency || !wizBudget) return;
    if (!metricValid(metricText) || metricText.length < 6) return;

    const title = signalText.length > 72 ? `${signalText.slice(0, 72).trim()}…` : signalText;
    const potential = `Potencial: ${wizWhy.trim()} (comprador=${wizBuyer}; urgência=${wizUrgency}; orçamento=${wizBudget}).`;
    const summary = `${signalText}\n\n${potential}\nMétrica (7 dias): ${metricText}`;
    const intent = inferredIntent();
    const now = new Date().toISOString();
    const s: Signal = {
      id: uid("signal"),
      title,
      summary,
      source: "Wizard",
      intent,
      score: scoreFromText(title, summary, intent),
      growthPct: clamp(Math.round(10 + Math.random() * 45), 10, 55),
      createdAt: now,
      validUntil: addDays(now, 7),
      collectedBy: "Você",
    };

    setSignals((prev) => [s, ...prev]);
    setSelectedId(s.id);
    setDraft((p) => ({ ...p, hypothesis: potential, metric: metricText }));
    setWizardOpen(false);
    resetWizard();
  }

  function addSignal() {
    const title = newTitle.trim();
    const summary = newSummary.trim();
    const source = newSource.trim() || "Manual";
    if (title.length < 6 || summary.length < 10) return;

    const now = new Date().toISOString();
    const s: Signal = {
      id: uid("signal"),
      title,
      summary,
      source,
      intent: newIntent,
      score: scoreFromText(title, summary, newIntent),
      growthPct: clamp(Math.round(10 + Math.random() * 45), 10, 55),
      createdAt: now,
      validUntil: addDays(now, 7),
      collectedBy: newCollectedBy || "Você",
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

  function generateRecommendations(signal: Signal) {
    const recs: string[] = [];
    if (signal.intent === "ALTA" && signal.score >= 80) {
      recs.push("Prioridade ALTA: rodar teste nas próximas 48h; alvo: 20 contatos.");
      recs.push("Mensagem sugerida: enviar Mensagem A e Mensagem B (A/B) — foco em preço/benefício.");
    } else if (signal.intent === "MÉDIA") {
      recs.push("Prioridade MÉDIA: refine ICP e envie 20 contatos para verificar resposta.");
    } else {
      recs.push("Prioridade BAIXA: use para narrativa, não para venda imediata.");
    }
    if (signal.growthPct > 30) recs.push("Sinal com crescimento forte — priorizar contato rápido.");
    return recs;
  }

  function generatePlaybookSuggestion(signal: Signal) {
    // Returns a playbook suggestion object { opportunity, experiment, metric }
    const short = signal.title.length > 72 ? `${signal.title.slice(0, 72).trim()}…` : signal.title;
    const opportunity = `${short} — oferta: serviço que resolve o problema identificado e gera valor claro.`;
    const experiment = `Enviar 20 mensagens A/B direcionadas; filtrar respostas em 48h; marcar reuniões com interessados.`;
    let metric = "20 contatos → 3 respostas → 1 reunião";
    if (signal.intent === "ALTA") metric = "20 contatos → 6 respostas → 3 reuniões (ou 1 venda)";
    if (signal.intent === "MÉDIA") metric = "20 contatos → 3 respostas → 1 reunião";
    if (signal.intent === "BAIXA") metric = "20 contatos → 1 resposta → 0 reuniões (usar para narrativa)";
    return { opportunity, experiment, metric };
  }

  function savePlaybook() {
    if (!selected) return;
    const hypothesis = draft.hypothesis.trim();
    const experiment = draft.experiment.trim();
    const metric = draft.metric.trim();
    // require metric to be valid (number or keywords)
    if (hypothesis.length < 8 || experiment.length < 8 || !metricValid(metric)) return;
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
    a.download = "signalhack-export.json";
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
      <main className="pt-24 pb-10">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">sinal → potencial → métrica → decisão</div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">Painel de decisão em 7 dias</h1>
                <p className="mt-2 text-sm text-zinc-300">
                  Registre um sinal real, avalie o potencial, defina a métrica e decida. Se não moveu a métrica, descarte.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{online ? "Online" : "Offline"}</Badge>
                <Button variant="ghost" onClick={() => setWizardOpen(true)}>
                  Avaliar potencial agora
                </Button>
                <Button variant="ghost" onClick={exportJson}>
                  Exportar
                </Button>
                <Button variant="ghost" onClick={resetLocal}>
                  Limpar tudo
                </Button>
              </div>
            </div>

            {wizardOpen ? (
              <Card className="mt-6 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">wizard — processo fechado</div>
                    <div className="mt-1 text-lg font-semibold text-zinc-100">Encontrar Negócios em Potencial</div>
                    <div className="mt-1 text-sm text-zinc-300">
                      Três passos objetivos. Saia com uma oportunidade vendável e métricas claras em 7 dias.
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge>Buscador</Badge>
                      <Badge>Tradutor</Badge>
                      <Badge>Filtro</Badge>
                      <Badge>Planejador</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => (resetWizard(), setWizardOpen(false))}>
                      Fechar
                    </Button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className={`rounded-2xl border px-4 py-3 ${wizardStep === 1 ? "border-emerald-500/35 bg-emerald-500/10" : "border-white/10 bg-black/30"}`}>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Passo 1</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-100">Sinal (Scout)</div>
                  </div>
                  <div className={`rounded-2xl border px-4 py-3 ${wizardStep === 2 ? "border-emerald-500/35 bg-emerald-500/10" : "border-white/10 bg-black/30"}`}>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Passo 2</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-100">Potencial (Decoder + Noise Killer)</div>
                  </div>
                  <div className={`rounded-2xl border px-4 py-3 ${wizardStep === 3 ? "border-emerald-500/35 bg-emerald-500/10" : "border-white/10 bg-black/30"}`}>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Passo 3</div>
                    <div className="mt-1 text-sm font-semibold text-zinc-100">Métrica (Strategist)</div>
                  </div>
                </div>

                {wizardStep === 1 ? (
                  <div className="mt-6">
                    <label className="text-xs text-zinc-400">Qual problema empresas estão tentando resolver agora?</label>
                    <textarea
                      value={wizSignal}
                      onChange={(e) => setWizSignal(e.target.value)}
                      placeholder="Ex: clientes reclamam de churn alto, posts pedindo automação de follow-up — copie este exemplo"
                      className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                    />
                    <div className="mt-2 text-xs text-zinc-400">Exemplo copiado acima — ajuste para seu cliente alvo.</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        onClick={() => setWizardStep(2)}
                        disabled={wizSignal.trim().length < 12}
                      >
                        Próximo: por que pagam
                      </Button>
                      <Button variant="ghost" onClick={resetWizard}>
                        Limpar
                      </Button>
                    </div>
                  </div>
                ) : null}

                {wizardStep === 2 ? (
                  <div className="mt-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Por que empresas pagariam para resolver esse problema?</div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <div className="text-sm font-semibold text-zinc-100">Existe comprador?</div>
                        <div className="mt-3 flex gap-2">
                          <Button variant={wizBuyer === "SIM" ? "primary" : "ghost"} onClick={() => setWizBuyer("SIM")}>Sim</Button>
                          <Button variant={wizBuyer === "NÃO" ? "primary" : "ghost"} onClick={() => setWizBuyer("NÃO")}>Não</Button>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <div className="text-sm font-semibold text-zinc-100">Existe urgência?</div>
                        <div className="mt-3 flex gap-2">
                          <Button variant={wizUrgency === "SIM" ? "primary" : "ghost"} onClick={() => setWizUrgency("SIM")}>Sim</Button>
                          <Button variant={wizUrgency === "NÃO" ? "primary" : "ghost"} onClick={() => setWizUrgency("NÃO")}>Não</Button>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                        <div className="text-sm font-semibold text-zinc-100">Existe orçamento?</div>
                        <div className="mt-3 flex gap-2">
                          <Button variant={wizBudget === "SIM" ? "primary" : "ghost"} onClick={() => setWizBudget("SIM")}>Sim</Button>
                          <Button variant={wizBudget === "NÃO" ? "primary" : "ghost"} onClick={() => setWizBudget("NÃO")}>Não</Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-zinc-300">
                      Potencial atual: <strong>{yesCount()}</strong>/3 sinais positivos.
                    </div>

                    <div className="mt-4">
                      <label className="text-xs text-zinc-400">Em uma frase comercial — por que empresas pagariam?</label>
                      <input
                        value={wizWhy}
                        onChange={(e) => setWizWhy(e.target.value)}
                        placeholder="Ex: pagam para reduzir churn e economizar 30% no custo de aquisição"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                      />
                      <div className="mt-2 text-xs text-zinc-400">Texto comercial obrigatório (ex.: reduzir churn, economizar X% ou gerar R$).</div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => setWizardStep(1)}>
                        Voltar
                      </Button>
                      <Button onClick={() => setWizardStep(3)} disabled={!wizWhy || !wizUrgency || !wizBudget || wizWhy.trim().length < 12}>
                        Próximo: resultado em 7 dias
                      </Button>
                    </div>
                  </div>
                ) : null}

                {wizardStep === 3 ? (
                  <div className="mt-6">
                    <label className="text-xs text-zinc-400">Qual métrica valida ou invalida em 7 dias?</label>
                    <input
                      value={wizMetric}
                      onChange={(e) => setWizMetric(e.target.value)}
                      placeholder="Ex: 20 contatos → 6 respostas → 3 calls (ou 1 venda)"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                    />
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-300">
                      <strong>Resumo:</strong> sinal + potencial + métrica vão virar um item no seu painel.
                      <div className="mt-2">
                        Próxima ação sugerida: {yesCount() >= 2 ? (
                          <strong>rodar o teste nas próximas 48h.</strong>
                        ) : (
                          <strong>refinar o sinal (comprador/urgência/orçamento) antes de insistir.</strong>
                        )}
                      </div>
                      <div className="mt-2 text-xs text-zinc-400">
                        Conta/sincronização pode vir depois do valor percebido. Por enquanto, tudo fica no seu navegador e você pode exportar.
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => setWizardStep(2)}>
                        Voltar
                      </Button>
                      <Button onClick={finishWizard} disabled={!metricValid(wizMetric) || wizMetric.trim().length < 6}>
                        Confirmar Negócio em Potencial
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-1">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">1) Buscador (sinais)</div>
                <p className="mt-2 text-sm text-zinc-300">Registre o que você viu. Evite opinião solta.</p>

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
                      <div className="mt-2 text-xs text-zinc-400">Coletado por: {s.collectedBy ?? '—'} • {new Date(s.createdAt).toLocaleDateString()} até {new Date(s.validUntil ?? s.createdAt).toLocaleDateString()}</div>
                      <div className="mt-2 text-sm text-zinc-300">{s.summary}</div>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6 lg:col-span-2">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">2) Decoder + 3) Strategist</div>
                {!selected ? (
                  <p className="mt-3 text-sm text-zinc-300">Escolha um sinal à esquerda.</p>
                ) : (
                  <>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge>Sem login</Badge>
                      <Badge>Uso imediato</Badge>
                      <Badge>Critério claro</Badge>
                      <Badge>Orquestração de agentes de IA</Badge>
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

                    {/* Recomendações automáticas */}
                    <div className="mt-6">
                      <div className="text-xs font-bold text-emerald-200">Recomendações</div>
                      {generateRecommendations(selected).map((r, i) => (
                        <div key={i} className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-200">{r}</div>
                      ))}
                    </div>

                    <div className="mt-8 border-t border-white/5 pt-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Playbook (7 dias)</div>
                          <div className="mt-1 text-sm text-zinc-300">Preencha 3 campos claros: oportunidade, ação em 7 dias e métrica que prova o negócio.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={loadDefaultPlaybook}>
                            Carregar exemplo
                          </Button>
                          <Button variant="ghost" onClick={() => {
                            if (selected) {
                              const s = generatePlaybookSuggestion(selected);
                              setDraft({ hypothesis: s.opportunity, experiment: s.experiment, metric: s.metric });
                            }
                          }}>
                            Auto-recomendar playbook
                          </Button>
                          <Button onClick={savePlaybook} disabled={!metricValid(draft.metric)}>
                            Salvar playbook
                          </Button>
                        </div>
                        <div className="mt-1">
                          {!metricValid(draft.metric) ? (
                            <div className="text-xs text-rose-400">Métrica inválida: inclua número ou palavra-chave (ex.: '6 respostas' ou '3 reuniões').</div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        <div>
                          <label className="text-xs text-zinc-400">Oportunidade (o que vamos vender?)</label>
                          <textarea
                            value={draft.hypothesis}
                            onChange={(e) => setDraft((p) => ({ ...p, hypothesis: e.target.value }))}
                            placeholder="Ex: serviço de automação de follow‑up para RevOps — reduz churn em 20%"
                            className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                          />
                          <div className="mt-1 text-xs text-zinc-400">Descreva o benefício que justifica pagamento (ex.: reduzir churn, gerar receita direta).</div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Ação em 7 dias (passos concretos)</label>
                          <textarea
                            value={draft.experiment}
                            onChange={(e) => setDraft((p) => ({ ...p, experiment: e.target.value }))}
                            placeholder="Ex: enviar 20 mensagens A/B; filtrar respostas; marcar reuniões"
                            className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                          />
                          <div className="mt-1 text-xs text-zinc-400">Passos executáveis — o que exatamente será feito nesta semana.</div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Métrica alvo (o que prova que funciona)</label>
                          <input
                            value={draft.metric}
                            onChange={(e) => setDraft((p) => ({ ...p, metric: e.target.value }))}
                            placeholder="Ex: 20 contatos → 6 respostas → 3 calls ou 1 venda"
                            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                          />
                          <div className="mt-1 text-xs text-zinc-400">Use números claros: leads, respostas, reuniões ou vendas atribuíveis.</div>
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
                          <strong>Nenhum playbook salvo.</strong>
                          <div className="mt-1 text-xs text-zinc-400">Salve quando tiver uma métrica alvo clara para executar (ex.: 6 respostas em 20 contatos).</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </Container>

        {/* MINHAS VALIDAÇÕES */}
        <section id="minhas-validacoes" className="py-8 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-6xl">
              <h3 className="text-lg font-semibold">Minhas Validações</h3>
              <p className="mt-2 text-sm text-zinc-300">Sinais que você confirmou como oportunidades. Clique para exportar ou transformar em playbook.</p>
            </div>
          </Container>
        </section>

        {/* RESULTADOS */}
        <section id="resultados" className="py-8 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-6xl">
              <h3 className="text-lg font-semibold">Resultados</h3>
              <p className="mt-2 text-sm text-zinc-300">Resumo das métricas por validação: respostas, reuniões e receita atribuível.</p>
            </div>
          </Container>
        </section>

        {/* PLANO */}
        <section id="plano" className="py-8 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-6xl">
              <h3 className="text-lg font-semibold">Plano</h3>
              <p className="mt-2 text-sm text-zinc-300">Opções para contratar execução (outreach, monitoramento e relatórios). Contrate apenas quando quiser escalar.</p>
            </div>
          </Container>
        </section>

      </main>
    </div>
  );
}

