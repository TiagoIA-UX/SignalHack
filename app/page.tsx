import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="pt-24 pb-16">
        {/* HERO (promessa + resultado) */}
        <section id="home" className="py-12">
          <Container>
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="uppercase tracking-[0.2em]">sem login • sem cadastro • sem bloqueio</span>
                <span className="text-zinc-600">•</span>
                <Badge>Sistema de decisão</Badge>
                <span className="text-zinc-600">•</span>
                <Badge>Orquestração de agentes de IA</Badge>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Você ganha uma decisão de dinheiro em 7 dias — medida por métrica.
              </h1>
              <p className="text-zinc-300 max-w-2xl">
                Reduz incerteza e aumenta velocidade de decisão: sinal → potencial → métrica → decisão.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button href="/app?wizard=1">Avaliar potencial agora</Button>
                <Button href="/#como-funciona" variant="ghost">Como funciona</Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Benefício mensurável</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    A métrica que você define manda. Sem “opinião vencedora”.
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Aversão à perda</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    Menos semanas queimadas em potencial fraco.
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Critério</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    Mexeu a métrica: dobra/ajusta. Não mexeu: mata.
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* PROBLEMA (dor real em 3 frases) */}
        <section id="problema" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Problema</div>
              <Card className="p-6">
                <div className="space-y-2 text-sm text-zinc-300">
                  <div>Você perde tempo construindo sem saber se alguém compra.</div>
                  <div>Você segue hype e opinião porque não tem critério de entrada/saída.</div>
                  <div>Você adia a decisão por falta de métrica — e paga com foco, energia e dinheiro.</div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        {/* SOLUÇÃO (o que entrega) */}
        <section id="solucao" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Solução</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">O que o SignalHack entrega</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Um sinal documentado com contexto.</li>
                    <li>- Potencial avaliado de forma objetiva.</li>
                    <li>- Métrica definida para 7 dias.</li>
                    <li>- Decisão registrada: dobrar / ajustar / matar.</li>
                  </ul>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Orquestração de agentes de IA</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-zinc-300">
                    <div><strong>Scout</strong>: captura o sinal.</div>
                    <div><strong>Decoder</strong>: traduz o que significa.</div>
                    <div><strong>Noise Killer</strong>: corta ruído.</div>
                    <div><strong>Strategist</strong>: define métrica e ação.</div>
                  </div>
                  <div className="mt-3 text-sm text-zinc-400">
                    Você não conversa com bot. Você segue um fluxo e sai com decisão.
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* COMO FUNCIONA (3 passos simples) */}
        <section id="como-funciona" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como funciona</div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">1) Sinal</div>
                  <div className="mt-2 text-sm text-zinc-300">Algo real: busca, vaga, dor repetida, comportamento público.</div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">2) Potencial</div>
                  <div className="mt-2 text-sm text-zinc-300">Comprador? urgência? orçamento? Sem enrolação.</div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">3) Métrica</div>
                  <div className="mt-2 text-sm text-zinc-300">O que valida ou mata em 7 dias (respostas, calls, receita).</div>
                </Card>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button href="/app?wizard=1">Avaliar potencial agora</Button>
                <Button href="/app" variant="ghost">Entrar</Button>
              </div>
            </div>
          </Container>
        </section>

        {/* O QUE VOCÊ RECEBE */}
        <section id="o-que-recebe" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">O que você recebe</div>
              <Card className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold text-emerald-100">Em 7 dias</div>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      <li>- Sinal claro e documentado.</li>
                      <li>- Potencial avaliado com perguntas objetivas.</li>
                      <li>- Métrica definida (valida ou mata).</li>
                      <li>- Decisão consciente.</li>
                      <li>- Próxima ação executável.</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-emerald-100">Sem risco falso</div>
                    <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                      <li>- Sem promessas mágicas.</li>
                      <li>- Sem texto longo para “convencer”.</li>
                      <li>- Sem travas: você entra e usa.</li>
                    </ul>
                    <div className="mt-3 text-sm text-zinc-400">
                      Resultado bom ou ruim é útil — porque é medido.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>
                  <div className="text-sm font-semibold text-emerald-100">Ideal</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Founder.</li>
                    <li>- Growth/Marketing/RevOps/SDR.</li>
                    <li>- Quem decide rápido e mede.</li>
                    <li>- Quem prefere evidência a opinião.</li>
                  </ul>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Não é</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Quem quer “a ideia perfeita”.</li>
                    <li>- Quem não executa.</li>
                    <li>- Quem busca garantia sem teste.</li>
                    <li>- Quem gosta de teoria sem prática.</li>
                  </ul>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA FINAL */}
        <section id="cta" className="py-12 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">CTA</div>
                <div className="mt-2 text-2xl font-semibold text-zinc-100">Pare de acumular ideia. Decida com métrica.</div>
                <div className="mt-2 text-sm text-zinc-300">Clique e avalie o potencial em 60 segundos.</div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/app?wizard=1">Avaliar potencial agora</Button>
                  <Button href="/app" variant="ghost">Entrar</Button>
                </div>
              </Card>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}

