import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="py-14">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="uppercase tracking-[0.2em]">sem login • sem bloqueio • uso imediato</span>
                <span className="text-zinc-600">•</span>
                <Badge>Orquestração de agentes de IA</Badge>
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Encontre demanda real, transforme em ação e execute em ciclos curtos.
              </h1>
              <p className="mt-4 text-zinc-300">
                ZAIRIX é um sistema que organiza o trabalho de vários agentes (Radar → Validador → Estrategista → Operador) para você sair de
                “achismo” e ir direto para decisão e execução.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/app">Abrir o app agora</Button>
                <Button href="/acquire" variant="ghost">
                  Suporte/licença (opcional)
                </Button>
              </div>

              <Card className="mt-10 p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Garantia psicológica</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-200">
                    <strong>Você pode usar sem pagar.</strong>
                    <div className="mt-2 text-zinc-300">Nada será bloqueado dentro do software.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-200">
                    <strong>Sem cadastro, sem senha.</strong>
                    <div className="mt-2 text-zinc-300">Você abre e já começa.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-200">
                    <strong>Senso de controle.</strong>
                    <div className="mt-2 text-zinc-300">Seus dados ficam no seu navegador (armazenamento local).</div>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="py-12 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">O que é / Para quem é</div>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">O que o software faz</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- **Radar**: reúne sinais que indicam intenção (dor, urgência, orçamento, risco).</li>
                    <li>- **Validador**: transforma o sinal em leitura simples (“o que isso significa?”).</li>
                    <li>- **Estrategista**: cria um playbook curto (hipótese, experimento, métrica).</li>
                    <li>- **Operador**: coloca tudo em ação (7 dias) e decide continuar/ajustar/parar.</li>
                  </ul>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Para quem ele serve</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- **Founder / Solopreneur**: validar e vender sem travar em planejamento.</li>
                    <li>- **Growth / Performance**: priorizar ações com evidência.</li>
                    <li>- **SDR / RevOps**: escolher alvo e entrar com motivo + ângulo.</li>
                    <li>- **Agência / Consultoria**: empacotar oferta e fechar mais rápido.</li>
                  </ul>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como funciona (passo a passo)</div>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {[
                  { t: "1) Você abre", d: "Sem login. Comece agora." },
                  { t: "2) Você escolhe um sinal", d: "Um tema com intenção real." },
                  { t: "3) Você gera o playbook", d: "Hipótese + experimento + métrica." },
                  { t: "4) Você executa em 7 dias", d: "Decide com dados: continuar, ajustar ou parar." },
                ].map((s) => (
                  <Card key={s.t} className="p-5">
                    <div className="text-sm font-semibold text-zinc-100">{s.t}</div>
                    <div className="mt-2 text-sm text-zinc-300">{s.d}</div>
                  </Card>
                ))}
              </div>

              <Card className="mt-8 p-6">
                <div className="text-sm font-semibold text-emerald-100">Explicação por nível (clareza progressiva)</div>
                <div className="mt-4 grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Leigo</div>
                    <div className="mt-2 text-sm text-zinc-200">
                      Você escolhe um assunto, o sistema te ajuda a entender se aquilo parece dar dinheiro e te dá um plano simples para testar.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Intermediário</div>
                    <div className="mt-2 text-sm text-zinc-200">
                      Você pega sinais públicos, transforma em tese e roda um experimento curto (7 dias) com métrica clara para decidir.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-300">
                    <details>
                      <summary className="cursor-pointer text-zinc-200 font-semibold">Técnico (opcional)</summary>
                      <div className="mt-3 space-y-2 text-sm">
                        <p>App Next.js (App Router) com estado local e persistência via LocalStorage.</p>
                        <p>Sem dependência de sessão, cookies, tokens, roles ou banco para abrir.</p>
                        <p>Quando possível, funciona offline (PWA).</p>
                      </div>
                    </details>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="py-12 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como adquirir (externo)</div>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Você usa tudo sem comprar</div>
                  <p className="mt-2 text-sm text-zinc-300">
                    A compra não muda o acesso. O software <strong>não tem bloqueio</strong>. Se você quiser, compra suporte/licença fora do sistema.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button href="/app">Usar agora</Button>
                    <Button href="/acquire" variant="ghost">
                      Ver opções externas
                    </Button>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">O que você pode comprar fora</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- **Suporte**: instalação, configuração e troubleshooting.</li>
                    <li>- **Licença comercial**: uso corporativo, termos e documentação.</li>
                    <li>- **Serviços**: customizações, integrações e treinamento.</li>
                  </ul>
                  <div className="mt-4 text-xs text-zinc-400">
                    Sem pressão. Sem urgência falsa. Você decide se faz sentido.
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}

