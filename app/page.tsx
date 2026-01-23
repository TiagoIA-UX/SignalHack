
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
    agents: ["Scout", "Strategist"],
  },
  {
    id: "criadores",
    title: "Criadores de Conteúdo",
    needs: "Encontrar formatos que vendem e validar ideias.",
    features: [
      { name: "Análise de sinal", desc: "Identifique tópicos com tração." },
      { name: "Playbook curto", desc: "Plano de teste para conteúdo que converte." },
    ],
    agents: ["Decoder", "Noise Killer"],
  },
  {
    id: "educacao",
    title: "Educação / Estudo",
    needs: "Planejar experimentos de ensino e medir engajamento.",
    features: [
      { name: "Playbooks de curso", desc: "Roteiros para testar módulos." },
      { name: "Agente Educacional", desc: "Apoio para criar exercícios e métricas." },
    ],
    agents: ["Strategist", "Decoder"],
  },
  {
    id: "marketing",
    title: "Marketing / Comunicação",
    needs: "Priorizar campanhas com sinal real e ROI mensurável.",
    features: [
      { name: "Priorizador de canais", desc: "Escolha onde investir os primeiros 20 contatos." },
      { name: "Templates de campanha", desc: "Mensagens com motivo e ângulo." },
    ],
    agents: ["Scout", "Decoder"],
  },
  {
    id: "geral",
    title: "Uso Geral / Pessoal",
    needs: "Ferramentas práticas para trabalho diário e decisões rápidas.",
    features: [
      { name: "Export JSON", desc: "Baixe sinais e playbooks para compartilhar." },
      { name: "Checklist de execução", desc: "Passos claros para ação imediata." },
    ],
    agents: ["Noise Killer"],
  },
];

const AGENTS = [
  { name: "Scout", what: "Encontra sinais e evidências públicas.", when: "Use quando quiser achar oportunidades reais." },
  { name: "Decoder", what: "Traduz sinais em hipóteses e potenciais compradores.", when: "Use ao precisar entender contexto rapidamente." },
  { name: "Noise Killer", what: "Filtra ruído e destaca sinais repetidos.", when: "Use para evitar armadilhas de hype." },
  { name: "Strategist", what: "Define métrica e plano de 7 dias.", when: "Use para transformar sinal em experimento executável." },
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
        <section id="visao-geral" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-3xl font-semibold">Teste se clientes reais pagam em 7 dias</h1>
              <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
                Experimento prático: envie 20 contatos, conte respostas, conclua com um número concreto. <strong>Sem conta. Sem teoria. Resultado.</strong>
              </p>

              <div className="mt-6">
                <Button href="/acquire" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-emerald-400 text-black font-bold shadow-lg">Começar o piloto de 7 dias</Button>
              </div>

              <div className="mt-2 text-xs text-zinc-400">Sem conta. Resultados concretos em 7 dias.</div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <div className="text-sm font-semibold text-emerald-100">Decisão</div>
                  <div className="mt-2 text-sm text-zinc-300">Ao final de 7 dias você decide: continuar, ajustar ou parar — com números.</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-semibold text-emerald-100">Risco reduzido</div>
                  <div className="mt-2 text-sm text-zinc-300">Teste com ≤20 contatos antes de gastar tempo ou dinheiro.</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-semibold text-emerald-100">Ação inicial</div>
                  <div className="mt-2 text-sm text-zinc-300">Comece agora com templates prontos e um playbook de 7 dias.</div>
                </Card>
              </div>
            </div>
          </Container>
        </section>"

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Como funciona — experimento de 7 dias</h2>
              <ol className="mt-4 list-decimal pl-5 space-y-3 text-sm text-zinc-300">
                <li><strong>Dia 0:</strong> escolha nicho e mensagem (use um template pronto).</li>
                <li><strong>Dias 1–2:</strong> envie 20 mensagens (email/DM) — registre respostas na ferramenta.</li>
                <li><strong>Dias 3–5:</strong> filtre respostas, marque reuniões e registre intenções de compra.</li>
                <li><strong>Dias 6–7:</strong> conte métricas (respostas qualificadas, reuniões, vendas) e decida: escalar, ajustar ou parar.</li>
              </ol>

              <div className="mt-4 text-sm text-zinc-400">Não precisa de conta para testar. Salve/exporte apenas se quiser conservar os resultados.</div>
            </div>
          </Container>
        </section>

        {/* MÉTRICAS */}
        <section id="metricas" className="py-12 border-b border-white/5">
          <Container>
            <div className="mx-auto max-w-4xl">
              <h2 className="text-2xl font-semibold">Métricas concretas</h2>
              <ul className="mt-4 list-disc pl-5 text-sm text-zinc-300">
                <li><strong>Respostas qualificadas:</strong> 3+ em 20 → sinal forte; 0–1 → reavaliar alvo/mensagem.</li>
                <li><strong>Reuniões marcadas:</strong> ≥1 reunião marcada = progresso operacional.</li>
                <li><strong>Vendas / Receita:</strong> total de vendas atribuíveis ao teste (valor e número).</li>
              </ul>
            </div>
          </Container>
        </section>"

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
              </div>"
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

