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

            {wizardOpen ? (
              <Card className="mt-6 p-6 max-w-lg mx-auto">
                <div className="mb-6 flex items-center justify-between">
                  <div className="text-xs text-zinc-400">{wizardStep}/3</div>
                  <Button variant="ghost" onClick={() => (resetWizard(), setWizardOpen(false))}>Fechar</Button>
                </div>

                {wizardStep === 1 && (
                  <div>
                    <div className="text-lg font-bold text-zinc-100 mb-2">O que você vê acontecendo no seu mercado?</div>
                    <div className="text-sm text-zinc-400 mb-2">Exemplo: Lojas reclamando de queda nas vendas</div>
                    <textarea
                      value={wizSignal}
                      onChange={(e) => setWizSignal(e.target.value)}
                      placeholder="Ex: Pequenos e-commerces reclamando de abandono de carrinho."
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                    />
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => setWizardStep(2)} disabled={wizSignal.trim().length < 8}>Avançar</Button>
                      <Button variant="ghost" onClick={resetWizard}>Limpar</Button>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div>
                    <div className="text-lg font-bold text-zinc-100 mb-2">Quem pagaria para resolver isso?</div>
                    <div className="text-sm text-zinc-400 mb-2">Exemplo: Donos de e-commerce</div>
                    <input
                      value={wizBuyer || ""}
                      onChange={(e) => setWizBuyer(e.target.value)}
                      placeholder="Ex: Donos de e-commerce"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                    />
                    <div className="mt-4 flex gap-2">
                      <Button variant="ghost" onClick={() => setWizardStep(1)}>Voltar</Button>
                      <Button onClick={() => setWizardStep(3)} disabled={!wizBuyer || wizBuyer.trim().length < 3}>Avançar</Button>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div>
                    <div className="text-lg font-bold text-zinc-100 mb-2">Como saber se funcionou?</div>
                    <div className="text-sm text-zinc-400 mb-2">Exemplo: Vendas recuperadas em 7 dias</div>
                    <input
                      value={wizMetric}
                      onChange={(e) => setWizMetric(e.target.value)}
                      placeholder="Ex: Vendas recuperadas na primeira semana."
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                    />
                    <div className="mt-4 flex gap-2">
                      <Button variant="ghost" onClick={() => setWizardStep(2)}>Voltar</Button>
                      <Button onClick={finishWizard} disabled={wizMetric.trim().length < 3}>Validar e Começar</Button>
                    </div>
                  </div>
                )}
              </Card>
            )}


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

  function finishWizard() {
    const signalText = wizSignal.trim();
    const metricText = wizMetric.trim();
    if (signalText.length < 12) return;
    if (!wizBuyer || !wizUrgency || !wizBudget) return;
    if (metricText.length < 8) return;

    const title = signalText.length > 72 ? `${signalText.slice(0, 72).trim()}…` : signalText;
    const potential = `Potencial: comprador=${wizBuyer}; urgência=${wizUrgency}; orçamento=${wizBudget}.`;
    const summary = `${signalText}\n\n${potential}\nMétrica (7 dias): ${metricText}`;
    const intent = inferredIntent();
    const s: Signal = {
      id: uid("signal"),
      title,
      summary,
      source: "Wizard",
      intent,
      score: scoreFromText(title, summary, intent),
      growthPct: clamp(Math.round(10 + Math.random() * 45), 10, 55),
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
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">wizard (60s)</div>
                    <div className="mt-1 text-lg font-semibold text-zinc-100">Avaliar potencial</div>
                    <div className="mt-1 text-sm text-zinc-300">
                      Sem login. Três passos. Resultado: potencial + métrica + decisão.
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge>Scout</Badge>
                      <Badge>Decoder</Badge>
                      <Badge>Noise Killer</Badge>
                      <Badge>Strategist</Badge>
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
                    <label className="text-xs text-zinc-400">Descreva o sinal observado</label>
                    <textarea
                      value={wizSignal}
                      onChange={(e) => setWizSignal(e.target.value)}
                      placeholder="Ex: aumento de vagas para RevOps + posts pedindo automação de follow-up"
                      className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        onClick={() => setWizardStep(2)}
                        disabled={wizSignal.trim().length < 12}
                      >
                        Próximo: potencial
                      </Button>
                      <Button variant="ghost" onClick={resetWizard}>
                        Limpar
                      </Button>
                    </div>
                  </div>
                ) : null}

                {wizardStep === 2 ? (
                  <div className="mt-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Perguntas objetivas</div>
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

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="ghost" onClick={() => setWizardStep(1)}>
                        Voltar
                      </Button>
                      <Button onClick={() => setWizardStep(3)} disabled={!wizBuyer || !wizUrgency || !wizBudget}>
                        Próximo: métrica
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
                        Próxima ação sugerida:{" "}
                        {yesCount() >= 2 ? (
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
                      <Button onClick={finishWizard} disabled={wizMetric.trim().length < 8}>
                        Criar no painel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <Card className="p-6 lg:col-span-1">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">1) Scout (sinais)</div>
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

                    <div className="mt-8 border-t border-white/5 pt-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Playbook (7 dias)</div>
                          <div className="mt-1 text-sm text-zinc-300">Potencial, teste e métrica em uma tela.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" onClick={loadDefaultPlaybook}>
                            Preencher exemplo
                          </Button>
                          <Button onClick={savePlaybook}>
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3">
                        <div>
                          <label className="text-xs text-zinc-400">Potencial</label>
                          <textarea
                            value={draft.hypothesis}
                            onChange={(e) => setDraft((p) => ({ ...p, hypothesis: e.target.value }))}
                            className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400">Teste (7 dias)</label>
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
                          Nada salvo ainda.
                        </div>
                      )}
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

