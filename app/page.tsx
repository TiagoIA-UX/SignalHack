
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, Card, Container } from "@/components/ui";
import AppHeader from "@/components/FunctionHeader";
import NicheCard from "@/components/NicheCard";
import AgentCard from "@/components/AgentCard";
import FeatureItem from "@/components/FeatureItem";

const NICHOS = [
  {
    id: "negocios",
    title: "Negócios / Empreendedores",
    needs: "Validar oferta, gerar primeiros clientes, testar preço.",
    features: [
      { name: "Piloto de 7 dias", desc: "Validação rápida com métrica clara.", href: "/acquire" },
      { name: "Templates de outreach", desc: "Modelos prontos para 20 contatos." },
    ],
    agents: ["Buscador", "Planejador"],
  },
  {
    id: "criadores",
    title: "Criadores de Conteúdo",
    needs: "Encontrar formatos que vendem e validar ideias.",
    features: [
      { name: "Análise de sinal", desc: "Identifique tópicos com tração." },
      { name: "Playbook curto", desc: "Plano de teste para conteúdo que converte." },
    ],
    agents: ["Tradutor", "Filtro"],
  },
  {
    id: "educacao",
    title: "Educação / Estudo",
    needs: "Planejar experimentos de ensino e medir engajamento.",
    features: [
      { name: "Playbooks de curso", desc: "Roteiros para testar módulos." },
      { name: "Agente Educacional", desc: "Apoio para criar exercícios e métricas." },
    ],
    agents: ["Planejador", "Tradutor"],
  },
  {
    id: "marketing",
    title: "Marketing / Comunicação",
    needs: "Priorizar campanhas com sinal real e ROI mensurável.",
    features: [
      { name: "Priorizador de canais", desc: "Escolha onde investir os primeiros 20 contatos." },
      { name: "Templates de campanha", desc: "Mensagens com motivo e ângulo." },
    ],
    agents: ["Buscador", "Tradutor"],
  },
  {
    id: "geral",
    title: "Uso Geral / Pessoal",
    needs: "Ferramentas práticas para trabalho diário e decisões rápidas.",
    features: [
      { name: "Export JSON", desc: "Baixe sinais e playbooks para compartilhar." },
      { name: "Checklist de execução", desc: "Passos claros para ação imediata." },
    ],
    agents: ["Filtro"],
  },
];

const AGENTS = [
  {
    name: "Buscador",
    what: "Encontra sinais e gera listas de leads com links e evidência.",
    when: "Use para achar oportunidades reais.",
    deliverables: [
      "CSV: 50 leads (nome, contato, link, motivo)",
      "Resumo de evidências com links e nota curta",
    ],
  },
  {
    name: "Tradutor",
    what: "Transforma sinais em perfis de comprador e mensagens que convertem.",
    when: "Use para preparar outreach que gera respostas.",
    deliverables: [
      "2 variações de mensagem prontas para enviar (A/B)",
      "Scripts de follow-up prontos para 48h e 7 dias",
    ],
  },
  {
    name: "Filtro",
    what: "Remove ruído, dedupe e destaca sinais repetidos e confiáveis.",
    when: "Use para evitar falso interesse.",
    deliverables: [
      "Lista filtrada e pontuada (CSV)",
      "Relatório de confiança por lead (alta/média/baixa)",
    ],
  },
  {
    name: "Planejador",
    what: "Monta um playbook com próximos passos e métricas acionáveis.",
    when: "Use para transformar sinais em ações imediatas.",
    deliverables: [
      "Playbook de 1 página com passos de 7 dias",
      "Métrica alvo sugerida e checklist de execução",
    ],
  },
];

export default function FunctionPage() {
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <AppHeader />

      <main className="pt-24 pb-20">
        {/* VISÃO GERAL */}
        <section id="o-que-faz" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-3xl font-semibold">Software de orquestração de agentes de Inteligência Artificial que identifica negócios em potencial a partir de sinais reais do mercado e entrega oportunidades prontas para execução e venda.</h1>
              <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
                Detecte oportunidades com entregáveis prontos (listas de leads com evidência, mensagens prontas e playbooks) — sem tentativa e erro. Use agora e converta em vendas reais. 
              </p>

              <div className="mt-6">
                <Button href="/app" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-emerald-400 text-black font-bold shadow-lg">Encontrar Negócios em Potencial Agora</Button>
              </div>

              <div className="mt-2 text-xs text-zinc-400">Sem cadastro antes de ver valor. Exporte e contrate apenas se quiser escalar.</div>
            </div>
          </Container>
        </section>

        {/* O QUE ENTREGA */}
        <section id="o-que-entrega" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">O que o software entrega</h2>
              <ul className="mt-4 list-disc pl-5 text-sm text-zinc-300">
                <li>Lista de negócios em potencial com demanda ativa (CSV com evidência e links).</li>
                <li>Problemas reais que empresas estão tentando resolver agora (mensagens com contexto).</li>
                <li>Oportunidades prontas para execução comercial (mensagens + lista + prioridade).</li>
                <li>Métrica objetiva para validar em 7 dias (leads, reuniões ou vendas atribuíveis).</li>
              </ul>
            </div>
          </Container>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Como o sistema funciona (4 passos)</h2>
              <ol className="mt-4 list-decimal pl-5 space-y-3 text-sm text-zinc-300">
                <li>Agentes analisam sinais públicos do mercado em tempo real.</li>
                <li>O sistema identifica padrões recorrentes de demanda pagante.</li>
                <li>A IA consolida oportunidades claras e vendáveis (lista + mensagens + prioridade).</li>
                <li>Você executa, valida com métricas e decide: escalar ou descartar.</li>
              </ol>
            </div>
          </Container>
        </section>

        {/* PARA QUEM */}
        <section id="para-quem" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Para quem é / para quem não é</h2>
              <div className="mt-4 text-sm text-zinc-300">
                <div><strong>É para:</strong> Agências, freelancers e operadores que vendem serviços ou soluções para empresas.</div>
                <div className="mt-2"><strong>Não é para:</strong> curiosos, estudantes ou pessoas que não vendem nada.</div>
              </div>
            </div>
          </Container>
        </section>

        {/* POR QUE GERA DINHEIRO */}
        <section id="por-que-gera" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Por que isso gera dinheiro</h2>
              <ul className="mt-4 list-disc pl-5 text-sm text-zinc-300">
                <li>A demanda já existe (sinais mostram intenção de compra).</li>
                <li>O orçamento para resolver o problema já existe em muitas empresas.</li>
                <li>Reduzimos risco: você valida com entregáveis antes de investir.</li>
                <li>Decisões rápidas: métricas claras aceleram a venda e o ROI.</li>
              </ul>
            </div>
          </Container>
        </section>

        {/* CTA FINAL */}
        <section id="cta" className="py-12">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <Button href="/app" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-emerald-400 text-black font-bold shadow-lg">Encontrar Negócios em Potencial Agora</Button>
            </div>
          </Container>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Como funciona — o que os agentes fazem</h2>
              <ul className="mt-4 list-disc pl-5 text-sm text-zinc-300">
                <li><strong>Buscador</strong> — pesquisa pública e gera listas de leads com links e evidência para você contactar.</li>
                <li><strong>Tradutor</strong> — transforma sinais em perfis de comprador e cria mensagens prontas para enviar.</li>
                <li><strong>Filtro</strong> — remove ruído, dedupe e destaca sinais repetidos e confiáveis.</li>
                <li><strong>Planejador</strong> — combina saídas e monta um playbook com priorização e KPIs para execução.</li>
                <li><strong>Orquestração</strong> — rode agentes em sequência, combine resultados e exporte listas, mensagens e playbooks.</li>
              </ul>

              <div className="mt-4 text-sm text-zinc-400">Nada de jargão: cada agente entrega artefatos concretos (lista com links, mensagens, arquivo exportável e um plano de ação).</div>
            </div>
          </Container>
        </section>

        {/* NICHOS */}
        <section id="nichos" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-6xl">
              <h2 className="text-2xl font-semibold">Nichos de uso</h2>
              <p className="mt-3 text-sm text-zinc-300">Escolha um nicho e veja as funcionalidades mais úteis para você.</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {NICHOS.map((n) => (
                  <NicheCard key={n.id} niche={n} />
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* AGENTES */}
        <section id="agentes" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Agentes (quem ajuda você)</h2>
              <p className="mt-3 text-sm text-zinc-300">Cada agente é descrito em linguagem humana — como uma pessoa que ajuda.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {AGENTS.map((a) => (
                  <AgentCard key={a.name} agent={a} />
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* FUNCIONALIDADES */}
        <section id="funcionalidades" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Funcionalidades</h2>
              <p className="mt-3 text-sm text-zinc-300">Ferramentas práticas, sem níveis ou permissões — escolha e execute.</p>

              <div className="mt-6 grid gap-3">
                <FeatureItem name="Export JSON" desc="Baixe seus sinais e playbooks para compartilhar." href="/app" />
                <FeatureItem name="Pilot (7 dias)" desc="Validação rápida com métricas." href="/acquire" />
                <FeatureItem name="Templates de outreach" desc="Modelos prontos para alcançar 20 contatos." />
                <FeatureItem name="Gerador de playbook" desc="Cria um plano de 7 dias com métrica e ações." />
              </div>
            </div>
          </Container>
        </section>

        {/* COMEÇAR AGORA */}
        <section id="comecar" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-2xl font-semibold">Começar agora</h2>
              <p className="mt-3 text-sm text-zinc-300">Escolha um nicho e clique em "Usar agora". Você será levado à ferramenta correspondente — sem formulário.</p>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {NICHOS.slice(0, 3).map((n) => (
                  <div key={n.id} className="text-left">
                    <div className="text-sm font-semibold text-zinc-100">{n.title}</div>
                    <div className="mt-1 text-sm text-zinc-300">{n.needs}</div>
                    <div className="mt-3">
                      <Link href="/app" className="text-sm text-emerald-300 hover:underline">Abrir ferramentas</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* AJUDA */}
        <section id="ajuda" className="py-12">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Ajuda e limites</h2>
              <ul className="mt-4 list-disc pl-5 text-sm text-zinc-300 space-y-2">
                <li>Como usar: Escolha um nicho, escolha um agente e rode o playbook de 7 dias.</li>
                <li>Dicas rápidas: nucleo=1, promessa clara=1 frase, 20 contatos em 48h.</li>
                <li>O que o sistema NÃO faz: não vende por você, não exige cadastro, não bloqueia recursos.</li>
                <li>Limites: trabalho offline em localStorage; recomendamos exportar os dados se quiser guardar.</li>
              </ul>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}

