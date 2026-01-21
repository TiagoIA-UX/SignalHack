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
                Transforme sinais em decisão (e dinheiro) em 7 dias — sem achismo.
              </h1>
              <p className="text-zinc-300 max-w-3xl">
                Para operadores B2B que precisam decidir rápido: você registra um sinal real, define o potencial, escolhe a métrica e decide.
                Se não mexeu a métrica, você descarta. Se mexeu, você dobra a aposta.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button href="/app?wizard=1">Avaliar potencial agora</Button>
                <Button href="/app" variant="ghost">
                  Entrar
                </Button>
                <Button href="/#como-funciona" variant="ghost">
                  Ver como funciona
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Inimigo</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    Ideias, achismo e hype que viram semanas perdidas.
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Prazo</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    7 dias para validar ou matar com critério.
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Critério</div>
                  <div className="mt-2 text-sm text-zinc-200">
                    Métrica mexeu = continua. Não mexeu = descarta.
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* PROBLEMA */}
        <section id="problema" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Problema (dor real)</div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Card className="p-5">
                  <div className="text-sm font-semibold text-zinc-100">Você está ocupado — mas não está certo.</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    O time executa, mas sem critério. Resultado: retrabalho.
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-semibold text-zinc-100">A decisão vira debate infinito.</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Opinião vence métrica. E o custo é tempo + pipeline.
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-semibold text-zinc-100">O risco real é perda.</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Semana perdida em ideia fraca custa mais que qualquer ferramenta.
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        {/* COMO FUNCIONA + MÉTODO */}
        <section id="como-funciona" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como funciona</div>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                {[
                  { t: "1) Registre um sinal", d: "Algo observável: mercado, buyer, time, operação." },
                  { t: "2) Defina o potencial", d: "Existe comprador, urgência e orçamento?" },
                  { t: "3) Escolha a métrica", d: "O que valida ou invalida em 7 dias." },
                  { t: "4) Decida", d: "Métrica mexeu? continua. Não mexeu? descarta." },
                ].map((s) => (
                  <Card key={s.t} className="p-5">
                    <div className="text-sm font-semibold text-zinc-100">{s.t}</div>
                    <div className="mt-2 text-sm text-zinc-300">{s.d}</div>
                  </Card>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Método (uma frase por etapa)</div>
                <div className="mt-3 grid gap-3 md:grid-cols-5">
                  {[
                    { t: "SINAL", d: "O que você viu." },
                    { t: "POTENCIAL", d: "Comprador, urgência, orçamento." },
                    { t: "MÉTRICA", d: "Como medir objetivamente." },
                    { t: "DECISÃO", d: "Continuar ou matar." },
                  ].map((s) => (
                    <Card key={s.t} className="p-4">
                      <div className="text-sm font-semibold text-zinc-100">{s.t}</div>
                      <div className="mt-2 text-sm text-zinc-300">{s.d}</div>
                    </Card>
                  ))}
                </div>
              </div>
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
                    <li>- Teste mínimo (7 dias).</li>
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

        {/* PARA QUEM É / PARA QUEM NÃO É */}
        <section id="para-quem-e" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Filtro</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Para quem é</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- Operador B2B impaciente com ruído.</li>
                    <li>- Founder/Growth/RevOps/SDR com meta real.</li>
                    <li>- Quem decide por métrica e executa teste curto.</li>
                  </ul>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Para quem NÃO é</div>
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
                <div className="mt-2 text-xl font-semibold text-zinc-100">Abra o painel. Registre 1 sinal. Rode 1 teste.</div>
                <div className="mt-2 text-sm text-zinc-300">
                  Você não precisa de mais informação. Você precisa de critério.
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/app">Entrar e começar</Button>
                  <Button href="/#como-funciona" variant="ghost">
                    Ver o método
                  </Button>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section id="comecar" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Começar</div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button href="/app">Registrar um sinal</Button>
                  <Button href="/app" variant="ghost">
                    Avaliar potencial
                  </Button>
                  <Button href="/app" variant="ghost">
                    Definir métrica
                  </Button>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section id="ajuda" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Ajuda / orientação</div>
              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">Como usar melhor</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Use sinais reais, não suposições vagas.</li>
                  <li>- Defina um teste que caiba em 7 dias.</li>
                  <li>- Se a métrica não mexer, descarte sem apego.</li>
                </ul>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">O que o sistema NÃO faz</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Não prevê o futuro.</li>
                  <li>- Não substitui decisão humana.</li>
                  <li>- Não executa por você.</li>
                </ul>
              </Card>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}

