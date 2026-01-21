import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="pt-24 pb-16">
        <section id="visao-geral" className="py-10">
          <Container>
            <div className="mx-auto max-w-5xl space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="uppercase tracking-[0.2em]">sem login • sem cadastro • uso imediato</span>
                <span className="text-zinc-600">•</span>
                <Badge>Documentação viva na interface</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">SIGNALHACK é um sistema de trabalho, não um SaaS.</h1>
              <p className="text-zinc-300">
                Ele organiza sinais, reduz ruído e ajuda você a decidir o próximo passo sem depender de ninguém.
                Tudo é explicado dentro do próprio sistema.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="p-4">
                  <div className="text-sm font-semibold text-zinc-100">O que é</div>
                  <div className="mt-2 text-sm text-zinc-300">Um painel simples para registrar sinais, entender e agir.</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-semibold text-zinc-100">Para quem serve</div>
                  <div className="mt-2 text-sm text-zinc-300">Quem precisa decidir rápido com pouca informação.</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm font-semibold text-zinc-100">O que resolve</div>
                  <div className="mt-2 text-sm text-zinc-300">Dúvida, dispersão e ações sem direção.</div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section id="como-funciona" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como funciona (passo a passo)</div>
              <div className="mt-5 grid gap-4 md:grid-cols-5">
                {[
                  { t: "1) Acessa o sistema", d: "Sem login ou cadastro." },
                  { t: "2) Escolhe um nicho", d: "Negócio, conteúdo, estudo, etc." },
                  { t: "3) Escolhe uma função", d: "Registrar sinal, analisar, planejar." },
                  { t: "4) Usa imediatamente", d: "Tudo está liberado." },
                  { t: "5) Obtém resultado", d: "Decisão clara e ação definida." },
                ].map((s) => (
                  <Card key={s.t} className="p-4">
                    <div className="text-sm font-semibold text-zinc-100">{s.t}</div>
                    <div className="mt-2 text-sm text-zinc-300">{s.d}</div>
                  </Card>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-300">
                Reforço: <strong>não existe login</strong>, <strong>não existe cadastro</strong>, <strong>não existe bloqueio</strong>.
              </div>
            </div>
          </Container>
        </section>

        <section id="nichos" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-6">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Nichos de uso</div>
              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">🔹 NICHO: NEGÓCIOS / EMPREENDEDORES</div>
                <div className="mt-2 text-sm text-zinc-300">Precisa decidir onde investir tempo e dinheiro.</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Registrar sinais de demanda real.</li>
                  <li>- Analisar o porquê agora.</li>
                  <li>- Criar um plano de 7 dias com métrica.</li>
                  <li>- Agente relacionado: <strong>Strategist</strong> (define a próxima ação).</li>
                </ul>
                <div className="mt-4">
                  <Button href="/app">Usar agora</Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">🔹 NICHO: CRIADORES DE CONTEÚDO</div>
                <div className="mt-2 text-sm text-zinc-300">Precisa escolher tema com interesse real.</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Registrar sinais de audiência.</li>
                  <li>- Transformar sinal em decisão de pauta.</li>
                  <li>- Definir experimento de 7 dias.</li>
                  <li>- Agente relacionado: <strong>Scout</strong> (encontra sinais).</li>
                </ul>
                <div className="mt-4">
                  <Button href="/app">Abrir ferramenta</Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">🔹 NICHO: EDUCAÇÃO / ESTUDO</div>
                <div className="mt-2 text-sm text-zinc-300">Precisa organizar estudo e avaliar progresso.</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Registrar temas e sinais de dificuldade.</li>
                  <li>- Analisar onde focar.</li>
                  <li>- Criar plano curto com meta.</li>
                  <li>- Agente relacionado: <strong>Decoder</strong> (interpreta o que o sinal significa).</li>
                </ul>
                <div className="mt-4">
                  <Button href="/app">Começar</Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">🔹 NICHO: MARKETING / COMUNICAÇÃO</div>
                <div className="mt-2 text-sm text-zinc-300">Precisa priorizar o que comunicar agora.</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Registrar sinais de mercado.</li>
                  <li>- Entender intenção e urgência.</li>
                  <li>- Definir mensagem e canal.</li>
                  <li>- Agente relacionado: <strong>Noise Killer</strong> (remove o que não importa).</li>
                </ul>
                <div className="mt-4">
                  <Button href="/app">Usar função</Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">🔹 NICHO: USO GERAL / PESSOAL</div>
                <div className="mt-2 text-sm text-zinc-300">Precisa clareza em decisões do dia a dia.</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Registrar sinais simples.</li>
                  <li>- Analisar e decidir sem complicar.</li>
                  <li>- Definir uma ação objetiva.</li>
                  <li>- Agente relacionado: <strong>Strategist</strong> (decisão prática).</li>
                </ul>
                <div className="mt-4">
                  <Button href="/app">Executar</Button>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section id="agentes" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Agentes (explicados como pessoas)</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-5">
                  <div className="text-sm font-semibold text-emerald-100">Scout</div>
                  <div className="mt-2 text-sm text-zinc-300">Observa sinais e traz o que parece relevante.</div>
                  <div className="mt-2 text-xs text-zinc-400">Use quando você precisa encontrar “o que está acontecendo”.</div>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-semibold text-emerald-100">Decoder</div>
                  <div className="mt-2 text-sm text-zinc-300">Traduz o sinal em significado simples.</div>
                  <div className="mt-2 text-xs text-zinc-400">Use quando você precisa entender o “por quê”.</div>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-semibold text-emerald-100">Noise Killer</div>
                  <div className="mt-2 text-sm text-zinc-300">Remove o que distrai e mantém o essencial.</div>
                  <div className="mt-2 text-xs text-zinc-400">Use quando há informação demais.</div>
                </Card>
                <Card className="p-5">
                  <div className="text-sm font-semibold text-emerald-100">Strategist</div>
                  <div className="mt-2 text-sm text-zinc-300">Transforma o sinal em um próximo passo claro.</div>
                  <div className="mt-2 text-xs text-zinc-400">Use quando você precisa decidir e agir.</div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section id="funcionalidades" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl space-y-4">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Funcionalidades</div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { t: "Registrar sinal", d: "Anote algo que você observou no mercado ou no cotidiano.", w: "Quando surge uma dúvida real." },
                  { t: "Analisar sinal", d: "Veja contexto, risco e oportunidade em linguagem simples.", w: "Quando precisa entender o que fazer." },
                  { t: "Criar playbook (7 dias)", d: "Defina hipótese, experimento e métrica.", w: "Quando quer testar rápido." },
                  { t: "Exportar dados", d: "Baixe seus registros em JSON.", w: "Quando precisa levar para outro lugar." },
                ].map((f) => (
                  <Card key={f.t} className="p-5">
                    <div className="text-sm font-semibold text-emerald-100">{f.t}</div>
                    <div className="mt-2 text-sm text-zinc-300">{f.d}</div>
                    <div className="mt-2 text-xs text-zinc-400">Use quando: {f.w}</div>
                    <div className="mt-3">
                      <Button href="/app">Usar agora</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section id="comecar" className="py-10 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <Card className="p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Começar agora</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Button href="/#nichos">Escolher um nicho</Button>
                  <Button href="/#agentes" variant="ghost">
                    Usar um agente
                  </Button>
                  <Button href="/app" variant="ghost">
                    Abrir o painel
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
                  <li>- Comece com um sinal real, não com suposição.</li>
                  <li>- Escreva em frases simples, sem termos técnicos.</li>
                  <li>- Use o playbook de 7 dias para decidir rápido.</li>
                </ul>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">O que o sistema NÃO faz</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  <li>- Não prevê o futuro.</li>
                  <li>- Não substitui decisão humana.</li>
                  <li>- Não executa ações sozinho.</li>
                </ul>
              </Card>
              <Card className="p-6">
                <div className="text-sm font-semibold text-emerald-100">Limites claros</div>
                <p className="mt-2 text-sm text-zinc-300">
                  O sistema organiza e orienta. Ele não garante resultados e não depende de banco, login ou integração externa.
                </p>
              </Card>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}

