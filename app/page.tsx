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
                <span className="uppercase tracking-[0.2em]">demanda pagante • compradores reais • uso imediato</span>
                <span className="text-zinc-600">•</span>
                <Badge>Orquestração de agentes de IA</Badge>
              </div>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Descubra o que vende de verdade — antes de gastar tempo e dinheiro.
              </h1>
              <p className="mt-4 text-zinc-300">
                ZAIRIX é um sistema de agentes (Radar → Validador → Estrategista → Operador) que corta o “achismo” e te coloca direto na
                decisão: demanda → tese → experimento → receita.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/app">Operar agora</Button>
                <Button href="/acquire" variant="ghost">
                  Licença/Parceria (opcional)
                </Button>
              </div>

              <Card className="mt-10 p-6">
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Sem desculpa para travar</div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-200">
                    <strong>Você usa sem pedir permissão.</strong>
                    <div className="mt-2 text-zinc-300">Sem login, sem bloqueio, sem desculpa técnica.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-200">
                    <strong>Você testa receita em 7 dias.</strong>
                    <div className="mt-2 text-zinc-300">Hipótese, experimento e métrica claros.</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-200">
                    <strong>Você controla o risco.</strong>
                    <div className="mt-2 text-zinc-300">Dados locais no navegador, offline quando possível.</div>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="py-12 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Foco em compradores</div>
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">O que o software entrega</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- **Radar**: sinais com intenção + orçamento (dor real).</li>
                    <li>- **Validador**: leitura direta do “por que comprariam”.</li>
                    <li>- **Estrategista**: playbook curto com foco em receita.</li>
                    <li>- **Operador**: execução e decisão objetiva em 7 dias.</li>
                  </ul>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Para quem tem orçamento</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- **Founder / Solopreneur**: parar de apostar e vender.</li>
                    <li>- **Growth / Performance**: cortar ruído e priorizar ROI.</li>
                    <li>- **SDR / RevOps**: atacar alvo com motivo real.</li>
                    <li>- **Agência / Consultoria**: empacotar oferta que fecha.</li>
                  </ul>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 border-t border-white/5">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como vira dinheiro (passo a passo)</div>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                {[
                  { t: "1) Você abre", d: "Sem login. Zero bloqueio." },
                  { t: "2) Você escolhe o sinal", d: "Intenção + orçamento." },
                  { t: "3) Você gera o playbook", d: "Plano curto e métrica dura." },
                  { t: "4) Você executa em 7 dias", d: "Decisão fria: continua ou mata." },
                ].map((s) => (
                  <Card key={s.t} className="p-5">
                    <div className="text-sm font-semibold text-zinc-100">{s.t}</div>
                    <div className="mt-2 text-sm text-zinc-300">{s.d}</div>
                  </Card>
                ))}
              </div>

              <Card className="mt-8 p-6">
                <div className="text-sm font-semibold text-emerald-100">Explicação rápida por nível</div>
                <div className="mt-4 grid gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Leigo</div>
                    <div className="mt-2 text-sm text-zinc-200">
                      Você escolhe um assunto, o sistema mostra se tem comprador e te dá um plano simples para testar.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Intermediário</div>
                    <div className="mt-2 text-sm text-zinc-200">
                      Você pega sinais públicos, transforma em tese e roda experimento curto (7 dias) com métrica clara.
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
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Monetização (fora do app)</div>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">Uso livre. Receita vem de fora.</div>
                  <p className="mt-2 text-sm text-zinc-300">
                    A compra não muda o acesso. O software <strong>não tem bloqueio</strong>. Receita entra via suporte, licença ou parceria externa.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button href="/app">Operar agora</Button>
                    <Button href="/acquire" variant="ghost">
                      Ver licença/parceria
                    </Button>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="text-sm font-semibold text-emerald-100">O que vira dinheiro</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>- **Suporte**: implantação e operação para clientes.</li>
                    <li>- **Licença comercial**: empresas pagam para usar.</li>
                    <li>- **Parceria/royalties**: percentual por cliente ativo.</li>
                  </ul>
                  <div className="mt-4 text-xs text-zinc-400">
                    Sem promessas vazias. Só execução e resultado.
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

