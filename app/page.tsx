import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

type RealDashboardExample = {
  source: string;
  title: string;
  summary: string;
  score: number;
  intent: string;
  hypothesis: string;
  offer?: string;
  funnel?: string;
  experiment: string;
  metric: string;
  updatedAt: Date;
};

export default async function Home() {
  const session = await getSessionFromCookies();
  const publicExampleEmail = process.env.PUBLIC_EXAMPLE_USER_EMAIL;

  const seedExample: RealDashboardExample = {
    source: "Radar (seed) — sinais públicos",
    title: "Aumento súbito de vagas: RevOps + automação interna",
    summary:
      "Times de receita estão correndo para automatizar operações (lead routing, follow-up, billing e dunning) com automação interna — orçamento existe e a urgência é agora.",
    score: 88,
    intent: "HIGH",
    hypothesis:
      "Se entregarmos uma oferta produtizada de automação de operações de receita (RevOps) em 7 dias, heads de receita pagam ticket médio/alto para reduzir SLA e recuperar receita perdida.",
    offer: "Oferta: Diagnóstico + implementação em 7 dias, preço fechado, com foco em reduzir SLA e recuperar receita.",
    funnel:
      "Funil: Landing com promessa + prova (antes/depois) → outbound para heads de receita/founders (50 contatos) → 2 calls de diagnóstico → 1 piloto pago.",
    experiment:
      "1) Landing com promessa + prova (antes/depois) • 2) Outbound para RevOps/Founders (50 contatos) • 3) Oferta de implementação em 7 dias com preço fechado • 4) 2 calls de diagnóstico e 1 piloto pago.",
    metric: "Métrica (7 dias): 10 respostas qualificadas e 2 calls. Decisão: dobrar, ajustar ou matar.",
    updatedAt: new Date("2026-01-11T00:00:00.000Z"),
  };

  let realExample: RealDashboardExample | null = null;
  if (publicExampleEmail || session) {
    try {
      const plan = await prisma.executionPlan.findFirst({
        where: publicExampleEmail ? { user: { email: publicExampleEmail } } : { userId: session!.sub },
        orderBy: { updatedAt: "desc" },
        include: { signal: true },
      });

      if (plan) {
        realExample = {
          source: plan.signal.source,
          title: plan.signal.title,
          summary: plan.signal.summary,
          score: plan.signal.score,
          intent: plan.signal.intent,
          hypothesis: plan.hypothesis,
          offer: undefined,
          funnel: undefined,
          experiment: plan.experiment,
          metric: plan.metric,
          updatedAt: plan.updatedAt,
        };
      }
    } catch {
      realExample = null;
    }
  }

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);

  const fmtIntent = (intent: string) => {
    if (intent === "HIGH") return "alta";
    if (intent === "MEDIUM") return "média";
    if (intent === "LOW") return "baixa";
    return intent;
  };

  const example = realExample ?? seedExample;
  const exampleKind = realExample ? "real" : "seed";

  const deriveOffer = (hypothesis: string, experiment: string) => {
    const h = `${hypothesis ?? ""}`.trim();
    const e = `${experiment ?? ""}`.trim();
    if (h.toLowerCase().includes("oferta")) return h;
    if (e.toLowerCase().includes("oferta")) return `Oferta: ${e}`;
    if (h) return `Oferta: ${h}`;
    return "Oferta: entrega em 7 dias com preço fechado (teste enxuto).";
  };

  const deriveFunnel = (experiment: string) => {
    const e = `${experiment ?? ""}`.trim();
    if (!e) return "Funil: landing → abordagem → calls → piloto pago.";
    if (e.toLowerCase().includes("funil")) return e;
    return `Funil: ${e}`;
  };

  const offer = example.offer ?? deriveOffer(example.hypothesis, example.experiment);
  const funnel = example.funnel ?? deriveFunnel(example.experiment);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">demanda • tese • execução • monetização</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Descubra, crie e monetize negócios digitais usando sinais reais de mercado.
                </h1>
                <p className="mt-4 text-zinc-300">
                  SignalForge transforma <span className="text-zinc-100">sinais públicos</span> (Google, buscas, fóruns, vagas, comunidades) em
                  <span className="text-zinc-100"> demanda</span>: dor, comprador, ticket e urgência. Você escolhe o alvo e executa um ciclo curto
                  com critério de decisão.
                </p>
                <p className="mt-4 text-zinc-300">
                  Em vez de “inspiração” e promessas vazias, você executa um ciclo curto: demanda → oferta → teste enxuto → funil → métrica em 7 dias →
                  iteração. A decisão final é humana; a vantagem vem de velocidade e evidência.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/login">Entrar</Button>
                  <Button href="/plans" variant="ghost">
                    Ver planos
                  </Button>
                </div>

                <Card className="mt-8 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                        {exampleKind === "real"
                          ? `exemplo real — ${publicExampleEmail ? "do nosso dashboard" : "do seu dashboard"}`
                          : "exemplo seedado — do sinal à receita"}
                      </div>
                      <div className="mt-2 text-sm font-medium text-zinc-100">{example.title}</div>
                      <div className="mt-2 text-sm text-zinc-300">{example.summary}</div>
                      <div className="mt-2 text-xs text-zinc-400">
                        Fonte: {example.source} • Score: {example.score} • Sinal de compra: {fmtIntent(example.intent)}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400">
                      {exampleKind === "real" ? `atualizado em ${fmtDate(example.updatedAt)}` : "seed"}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">1) Sinal real</div>
                      <div className="mt-2 text-sm text-zinc-200">{example.title}</div>
                      <div className="mt-2 text-xs text-zinc-400">{example.summary}</div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">2) Tese de dinheiro</div>
                      <div className="mt-2 text-sm text-zinc-200">{example.hypothesis}</div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">3) Oferta</div>
                      <div className="mt-2 text-sm text-zinc-200">{offer}</div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                      <div className="text-xs font-medium text-zinc-200">4) Funil</div>
                      <div className="mt-2 text-sm text-zinc-200">{funnel}</div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 md:col-span-2">
                      <div className="text-xs font-medium text-zinc-200">5) Métrica de 7 dias</div>
                      <div className="mt-2 text-sm text-zinc-200">{example.metric}</div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-emerald-500/15 bg-black/30 p-4">
                    <div className="text-xs font-medium text-zinc-200">6) Decisão</div>
                    <div className="mt-2 text-sm text-zinc-200">
                      SINAL → TESE → EXPERIMENTO → MÉTRICA (7 DIAS) → <span className="text-emerald-200">DECIDIR</span>
                    </div>
                    <div className="mt-2 text-xs text-zinc-400">Sem “ideias”: ou vira receita, ou vira aprendizado rápido.</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button href={session ? "/dashboard" : "/login"}>
                      {session ? "Abrir Dashboard" : "Entrar para ver o seu"}
                    </Button>
                    <Button href="/plans" variant="ghost">
                      Ver planos
                    </Button>
                  </div>
                </Card>

                <div className="mt-8 space-y-2 text-sm text-zinc-200">
                  {[
                    "Descubra demanda: intenção + dor + orçamento (não 'ideias').",
                    "Crie uma tese de dinheiro com comprador ideal, mecanismo, risco e primeira ação.",
                    "Gere oferta + teste enxuto para testar rápido.",
                    "Publique funil e assets de aquisição para medir conversão.",
                    "Otimize com métricas e repita até encontrar receita repetível.",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <Card className="p-5">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">quem compra</div>
                    <div className="mt-3 text-sm font-medium text-zinc-100">Operadores em execução</div>
                    <div className="mt-2 text-sm text-zinc-300">
                      Quem precisa transformar sinal em dinheiro com disciplina — não com “inspiração”.
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-zinc-200">
                      {["Founders", "Agências", "Operadores de marketing/growth", "Operadores de automação/RevOps"].map((t) => (
                        <div key={t} className="flex items-start gap-3">
                          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-5">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">quem não é</div>
                    <div className="mt-3 text-sm font-medium text-zinc-100">Curiosidade sem execução</div>
                    <div className="mt-2 text-sm text-zinc-300">
                      Se você quer “uma ideia perfeita” sem teste, sem conversa com cliente e sem métrica, isso vai frustrar.
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-zinc-200">
                      {["colecionar sinais sem execução", "depender de feed/hype", "querer garantia sem experimento", "construir antes de validar"].map((t) => (
                        <div key={t} className="flex items-start gap-3">
                          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/30" />
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">orquestração do fluxo</div>
                <div className="mt-3 text-sm text-zinc-200">
                  Cinco etapas executam o ciclo completo: mapear demanda → validar tese → construir oferta + teste enxuto → publicar funil → otimizar.
                </div>

                <div className="mt-5 space-y-3">
                  {[{
                    k: "ATLAS",
                    icon: "/modules/atlas.svg",
                    name: "caça demanda",
                    desc: "Busca avançada pública (Google, fóruns, vagas, comunidades) para achar dores recorrentes e compradores reais.",
                  }, {
                    k: "NEXUS",
                    icon: "/modules/nexus.svg",
                    name: "valida tese",
                    desc: "conecta sinais, filtra ruído e escolhe o que tem comprador + urgência + orçamento.",
                  }, {
                    k: "ARTISAN",
                    icon: "/modules/artisan.svg",
                    name: "cria oferta + teste enxuto",
                    desc: "gera proposta, diferenciação, preço e um teste enxuto para validar em dias.",
                  }, {
                    k: "PULSE",
                    icon: "/modules/pulse.svg",
                    name: "publica funil",
                    desc: "landing, emails, criativos e tracking para medir conversão com disciplina.",
                  }, {
                    k: "OPTIMA",
                    icon: "/modules/optima.svg",
                    name: "otimiza e escala",
                    desc: "métricas → hipótese → experimento → aprendizado. Repetir até achar receita repetível.",
                  }].map((a) => (
                    <div key={a.k} className="rounded-xl border border-emerald-500/15 bg-black/40 p-4">
                      <div className="flex items-center gap-3">
                        <Image src={a.icon} alt="" width={32} height={32} className="h-8 w-8 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-zinc-400">
                            <span className="font-mono text-emerald-200">{a.k}</span> • {a.name}
                          </div>
                          <div className="mt-1 text-sm text-zinc-200">{a.desc}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-xs text-zinc-400">Login com email e senha.</div>
                <div className="mt-2 text-xs text-zinc-400">Comunidade de operadores e founders: quem é pago entra em um ambiente focado em execução e evidência.</div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">como funciona</div>
                <div className="mt-3 text-sm text-zinc-200">Um ciclo curto e repetível.</div>
                <p className="mt-3 text-sm text-zinc-300">Demanda → tese → oferta/teste enxuto → funil → métrica (7 dias) → iteração.</p>
              </Card>
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">o que você cria</div>
                <div className="mt-3 text-sm text-zinc-200">Produtos, funis e receita.</div>
                <p className="mt-3 text-sm text-zinc-300">De micro-SaaS e automações B2B a ofertas produtizadas com entrega assistida.</p>
              </Card>
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">por que é diferente</div>
                <div className="mt-3 text-sm text-zinc-200">Execução com evidência.</div>
                <p className="mt-3 text-sm text-zinc-300">Você mede intenção, define hipótese e executa experimentos — sem promessas mágicas.</p>
              </Card>
            </div>

            <Card className="mt-8 p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">o que você recebe em 7 dias</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="text-sm font-medium text-zinc-100">1 tese de dinheiro</div>
                    <div className="mt-1 text-sm text-zinc-300">Comprador, dor, mecanismo, risco e primeira ação — escrito para executar.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="text-sm font-medium text-zinc-100">1 oferta + teste enxuto</div>
                    <div className="mt-1 text-sm text-zinc-300">Uma proposta clara + entregável mínimo para cobrar e aprender rápido.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="text-sm font-medium text-zinc-100">1 funil mensurável</div>
                  <div className="mt-1 text-sm text-zinc-300">Landing, mensagem e tracking para medir conversas, leads e calls.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="text-sm font-medium text-zinc-100">1 métrica para decidir</div>
                  <div className="mt-1 text-sm text-zinc-300">O que muda em 7 dias e o que fazer depois (dobrar, pivotar ou matar).</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-400">Sem promessa mágica: o valor está em reduzir ruído e acelerar aprendizado com evidência.</div>
            </Card>

            <Card className="mt-8 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">exemplo universal — do sinal à receita</div>
                  <div className="mt-2 text-sm font-medium text-zinc-100">Automação de cobrança (dunning) para SaaS</div>
                  <div className="mt-2 text-sm text-zinc-300">Um exemplo ilustrativo de playbook (para entender o método).</div>
                </div>
                <div className="text-xs text-zinc-400">resultado ilustrativo</div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs font-medium text-zinc-200">1) Sinal detectado (Atlas)</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    Padrões repetidos em buscas e posts: “failed payments”, “dunning”, “recover revenue”.
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">Leitura: SaaS pequeno perde receita silenciosa e quer recuperação automática.</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs font-medium text-zinc-200">2) Tese de dinheiro (Nexus)</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    Se entregarmos um fluxo que recupera pagamentos falhos via e-mail/WhatsApp, founders pagam $49–$199/mês.
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">Hipótese testável: “recuperar X% do MRR perdido em 7 dias”.</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs font-medium text-zinc-200">3) Oferta + teste enxuto (Artisan)</div>
                  <div className="mt-2 text-sm text-zinc-200">Landing + promessa clara + integração mínima (webhook) para provar valor rápido.</div>
                  <div className="mt-2 text-xs text-zinc-400">Entrega: 1 fluxo que roda e gera evidência.</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs font-medium text-zinc-200">4) Aquisição (Pulse)</div>
                  <div className="mt-2 text-sm text-zinc-200">Outbound para founders + comunidades + tracking de conversas e trials.</div>
                  <div className="mt-2 text-xs text-zinc-400">Sem tráfego, não existe validação.</div>
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-emerald-500/15 bg-black/30 p-4">
                <div className="text-xs font-medium text-zinc-200">5) Métrica (Optima)</div>
                <div className="mt-2 text-sm text-zinc-200">Em 7 dias, você decide com números: visitas → trials → clientes → MRR.</div>
                <div className="mt-2 text-xs text-zinc-400">
                  Exemplo de alvo: 300 visitas, 25 trials, 5 clientes — sem promessa, só critério de decisão.
                </div>
              </div>
            </Card>

            <div className="mt-10">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">onde o signalforge encontra dinheiro</div>
              <div className="mt-2 text-sm text-zinc-300">
                Sete mercados com dores recorrentes, compradores reais e orçamento.
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    title: "Automação B2B (Ops/RevOps/Finance/Suporte)",
                    pain: "trabalho manual caro, SLA estourando, dados espalhados",
                    buyer: "PMEs e mid-market (Ops, CS, Finance)",
                    build: "automação interna, rotinas, copilotos",
                  },
                  {
                    title: "Compliance, risco e privacidade (LGPD/auditoria)",
                    pain: "risco jurídico, exposição de dados, governança fraca",
                    buyer: "saúde, fintech, SaaS, e-commerce",
                    build: "revisores, monitores, checklists automatizados",
                  },
                  {
                    title: "Conteúdo que vende (SEO/funis/criativos/vídeo)",
                    pain: "CAC subindo, conteúdo sem conversão",
                    buyer: "SaaS B2B, creators, e-commerce",
                    build: "motor de tópicos, assets, SEO programático",
                  },
                  {
                    title: "E-commerce e retenção (LTV/recompras/margem)",
                    pain: "abandono, promoções que derrubam margem",
                    buyer: "DTC e operadores",
                    build: "bundles, segmentação, suporte automatizado",
                  },
                  {
                    title: "Educação profissional orientada a resultado",
                    pain: "aprendizado longo sem aplicação",
                    buyer: "profissionais em transição e times",
                    build: "trilhas, laboratórios, playbooks",
                  },
                  {
                    title: "Negócios locais (leads/agenda/reputação)",
                    pain: "demanda instável, no-show, follow-up fraco",
                    buyer: "clínicas, serviços, imobiliárias",
                    build: "WhatsApp, agendamento, reviews",
                  },
                  {
                    title: "Finanças de PMEs (caixa/crédito/precificação)",
                    pain: "caixa caótico, decisão sem números",
                    buyer: "MEIs/PMEs e autônomos",
                    build: "assistente de caixa, alertas, margem",
                  },
                ].map((c) => (
                  <Card key={c.title} className="p-6">
                    <div className="text-sm font-semibold text-zinc-100">{c.title}</div>
                    <div className="mt-3 text-xs text-zinc-400">Dor</div>
                    <div className="mt-1 text-sm text-zinc-200">{c.pain}</div>
                    <div className="mt-3 text-xs text-zinc-400">Comprador</div>
                    <div className="mt-1 text-sm text-zinc-200">{c.buyer}</div>
                    <div className="mt-3 text-xs text-zinc-400">O que criar</div>
                    <div className="mt-1 text-sm text-zinc-200">{c.build}</div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="mt-10 p-6">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">manifesto</div>
              <div className="mt-3 text-sm text-zinc-200">
                Você não procura trabalho. Você caça demanda.
                <br />
                Você não tem “ideias”. Você testa teses.
                <br />
                Você não depende de feeds. Você cria sistemas que geram, monetizam e escalam com disciplina.
              </div>
              <div className="mt-5 flex gap-3">
                <Button href="/register" variant="ghost">
                  Criar conta
                </Button>
                <Button href="/plans">Ver planos</Button>
              </div>
            </Card>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/15 bg-black/30 p-6">
              <div>
                <div className="text-sm font-medium text-zinc-100">Pronto para rodar o ciclo completo?</div>
                <div className="mt-1 text-sm text-zinc-300">Entre, gere uma tese e publique um primeiro experimento em minutos.</div>
              </div>
              <div className="flex gap-3">
                <Button href="/login">Entrar</Button>
                <Button href="/plans" variant="ghost">Ver planos</Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
