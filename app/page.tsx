import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">sala interna • briefings • janela</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Intercepte antes do ruído.</h1>
                <p className="mt-4 text-zinc-300">
                  Você trabalha, testa, ajusta, segura o caixa e ainda precisa vender. Aí abre a internet e vê a mesma promessa:
                  “fórmula”, “método”, “milhares por dia”. Quando você tenta aplicar, já está saturado.
                </p>
                <p className="mt-4 text-zinc-300">
                  A verdade é simples: a janela existe — e fecha rápido. Quem pega cedo opera em silêncio. Quem chega depois compra o replay.
                </p>
                <p className="mt-4 text-zinc-300">
                  O SignalHack é a sala interna para mudar o jogo: identificar sinais reais, ler o cenário com frieza e agir enquanto ainda há vantagem.
                  Tudo com dados públicos e verificáveis — coleta e leitura por vias legais (OSINT), sem atalho e sem gambiarra.
                </p>

                <p className="mt-4 text-zinc-300">
                  Feito para quem depende de timing: donos de marketplaces, afiliados, e-commerce, creators, B2B. Você recebe alertas quando a janela abre.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/login">Solicitar credencial</Button>
                  <Button href="/plans" variant="ghost">
                    Ver planos
                  </Button>
                </div>

                <div className="mt-8 space-y-2 text-sm text-zinc-200">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Briefings prontos para execução — sem promessa vazia.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Prioridade clara e intenção de mercado: o que atacar primeiro.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Alertas inteligentes quando o sinal muda de patamar.</span>
                  </div>
                </div>
              </div>
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">rede de agentes</div>
                <div className="mt-3 text-sm text-zinc-200">Três agentes. Uma missão: reduzir ruído e acelerar decisão.</div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-4">
                    <div className="text-xs text-zinc-400">Agente Hacker de Sinal</div>
                    <div className="mt-1 text-sm text-zinc-200">Varre sinais públicos, classifica intenção e corta o que é só barulho.</div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-4">
                    <div className="text-xs text-zinc-400">Agente Hacker Estrategista</div>
                    <div className="mt-1 text-sm text-zinc-200">Transforma sinal em leitura estratégica: hipótese, risco e ação sugerida.</div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/15 bg-black/40 p-4">
                    <div className="text-xs text-zinc-400">Agente Hacker de Limites</div>
                    <div className="mt-1 text-sm text-zinc-200">Controla acesso e mantém a operação enxuta por nível de credencial.</div>
                  </div>
                </div>

                <div className="mt-6 text-xs text-zinc-400">Sem senha. Credencial por magic link.</div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="py-10">
          <Container>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">para quem</div>
                <div className="mt-3 text-sm text-zinc-200">Operadores, founders, growth, tráfego.</div>
                <p className="mt-3 text-sm text-zinc-300">Quem executa e precisa decidir com menos ruído e mais leitura.</p>
              </Card>
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">o que muda</div>
                <div className="mt-3 text-sm text-zinc-200">Você entra na janela.</div>
                <p className="mt-3 text-sm text-zinc-300">Briefings curtos te colocam na janela: prioridade, hipótese e execução.</p>
              </Card>
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">como entra</div>
                <div className="mt-3 text-sm text-zinc-200">Email → credencial → painel.</div>
                <p className="mt-3 text-sm text-zinc-300">Sem senha. Sem fricção. Entrada limpa e direta.</p>
              </Card>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/15 bg-black/30 p-6">
              <div>
                <div className="text-sm font-medium text-zinc-100">Pronto para operar do lado de dentro?</div>
                <div className="mt-1 text-sm text-zinc-300">Solicite a credencial. Entre no painel em minutos.</div>
              </div>
              <div className="flex gap-3">
                <Button href="/login">Solicitar credencial</Button>
                <Button href="/plans" variant="ghost">Ver planos</Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
