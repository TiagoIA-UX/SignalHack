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
                Transforme sinais reais em resultado em 7 dias.
              </h1>
              <p className="text-zinc-300 max-w-2xl">
                Sem teoria. Sem achismo. Você avalia o potencial, define a métrica e decide.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button href="/app?wizard=1">Avaliar potencial agora</Button>
                <Button href="/#como-funciona" variant="ghost">Como funciona</Button>
              </div>

              <Card className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Você ganha</div>
                    <div className="mt-2 text-sm text-zinc-200">Decisão rápida com critério (sem debate infinito).</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Você evita</div>
                    <div className="mt-2 text-sm text-zinc-200">Semanas perdidas em ideia fraca e hype.</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Regra</div>
                    <div className="mt-2 text-sm text-zinc-200">Métrica mexeu = continua. Não mexeu = descarta.</div>
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
                  <div className="text-sm font-semibold text-emerald-100">Pacote de decisão</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Sinais registrados (com contexto e fonte).</li>
                    <li>- Potencial definido (comprador, urgência, orçamento).</li>
                    <li>- Métrica definida.</li>
                    <li>- Decisão registrada: continuar / ajustar / descartar.</li>
                  </ul>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Redução de risco</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Menos semanas perdidas em ideia fraca.</li>
                    <li>- Menos decisão por opinião.</li>
                    <li>- Menos “vamos ver semana que vem”.</li>
                    <li>- Mais critério por métrica.</li>
                  </ul>
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
                  <div className="mt-2 text-sm text-zinc-300">Você registra algo observável (mercado, vaga, dor, comportamento).</div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">2) Potencial</div>
                  <div className="mt-2 text-sm text-zinc-300">Você responde: existe comprador, urgência e orçamento?</div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-zinc-100">3) Métrica</div>
                  <div className="mt-2 text-sm text-zinc-300">Você define o que valida ou invalida em 7 dias. E decide.</div>
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
                  <div className="text-sm font-semibold text-emerald-100">Ideal</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Operador B2B impaciente com ruído.</li>
                    <li>- Founder/Growth/RevOps/SDR com meta real.</li>
                    <li>- Quem decide por métrica e executa teste curto.</li>
                  </ul>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Não é</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Quem quer “inspiração” em vez de experimento.</li>
                    <li>- Quem busca promessa de milagre.</li>
                    <li>- Quem não vai medir nada.</li>
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
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Próximo passo</div>
                <div className="mt-2 text-xl font-semibold text-zinc-100">Avalie 1 sinal agora. Em 60 segundos você entende o potencial.</div>
                <div className="mt-2 text-sm text-zinc-300">Depois você decide em 7 dias com métrica. Sem fricção.</div>
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

