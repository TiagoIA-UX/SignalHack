import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="pt-24 pb-16">
        {/* HERO */}
        <section id="home" className="py-12">
          <Container>
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="uppercase tracking-[0.2em]">sem login • sem cadastro • sem bloqueio</span>
                <span className="text-zinc-600">•</span>
                <Badge>Sistema de decisão</Badge>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Transforme sinais reais de mercado em decisões de dinheiro em 7 dias
              </h1>
              <p className="text-zinc-300 max-w-2xl">
                Sem achismo. Sem ideias soltas. Um fluxo simples para saber se algo tem potencial real ou não.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button href="/app?wizard=1">Avaliar potencial agora</Button>
                <Button href="/#como-funciona" variant="ghost">Como funciona</Button>
              </div>

              <Card className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Ganho</div>
                    <div className="mt-2 text-sm text-zinc-200">Clareza + critério + próxima ação.</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Perda evitada</div>
                    <div className="mt-2 text-sm text-zinc-200">Tempo, energia e dinheiro desperdiçados.</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Regra</div>
                    <div className="mt-2 text-sm text-zinc-200">Métrica mexeu: dobra/ajusta. Não mexeu: mata.</div>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        {/* O QUE VOCÊ RECEBE */}
        <section id="o-que-recebe" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">O que você recebe em 7 dias</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Entrega objetiva</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Um sinal claro e documentado.</li>
                    <li>- Avaliação objetiva de potencial.</li>
                    <li>- Um critério mensurável de validação.</li>
                    <li>- Uma decisão consciente.</li>
                    <li>- Um próximo passo executável.</li>
                  </ul>
                  <div className="mt-4 text-sm text-zinc-300">
                    Sem promessas mágicas. Apenas clareza.
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">O que o SignalHack é</div>
                  <p className="mt-3 text-sm text-zinc-300">
                    Um sistema de decisão. Ele transforma sinais públicos de mercado em clareza, critério e próxima ação.
                  </p>
                  <p className="mt-3 text-sm text-zinc-300">
                    Ou vira potencial real de dinheiro, ou vira aprendizado rápido. Nada fica no meio do caminho.
                  </p>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* COMO FUNCIONA (3 passos) */}
        <section id="como-funciona" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como funciona</div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">1) Sinal</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Você parte de algo real: buscas, vagas, dores repetidas, comportamentos públicos.
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">2) Potencial</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Você avalia se existe comprador real, urgência e possibilidade de pagamento.
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">3) Métrica</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Você define o que prova ou mata em 7 dias (respostas, leads, conversas, receita).
                  </div>
                </Card>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button href="/app?wizard=1">Avaliar potencial agora</Button>
                <Button href="/app" variant="ghost">Entrar</Button>
              </div>
            </div>
          </Container>
        </section>

        {/* PARA QUEM É / PARA QUEM NÃO É */}
        <section id="para-quem-e" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Para quem é</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Para quem é</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Founders.</li>
                    <li>- Operadores de Growth, Marketing, RevOps.</li>
                    <li>- Pessoas que querem decidir rápido.</li>
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
                <div className="mt-2 text-2xl font-semibold text-zinc-100">Pare de acumular ideias. Comece a tomar decisões.</div>
                <div className="mt-2 text-sm text-zinc-300">Sem login. Direto para o fluxo guiado.</div>
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

