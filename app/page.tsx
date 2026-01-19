import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
import Image from "next/image";
import { headers } from "next/headers";

type Lang = "pt" | "en" | "es";

function pickLangFromAcceptLanguage(acceptLanguage: string): Lang {
  const s = (acceptLanguage || "").toLowerCase();
  if (s.includes("pt")) return "pt";
  if (s.includes("es")) return "es";
  return "en";
}

export default async function Home(props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const searchParams = (await props.searchParams) ?? {};
  const rawLang = searchParams.lang;
  const langParam = Array.isArray(rawLang) ? rawLang[0] : rawLang;

  const hdrs = await headers();
  const acceptLang = hdrs.get("accept-language") ?? "";
  const lang: Lang =
    langParam === "pt" || langParam === "en" || langParam === "es" ? langParam : pickLangFromAcceptLanguage(acceptLang);

  const t = {
    pt: {
      top: "demanda • potencial de retorno • execução • monetização",
      h1: "Pare de apostar em “ideia”. Encontre demanda real e transforme em receita.",
      sub1:
        "ZAIRIX é uma orquestração de agentes de IA: cada agente faz um pedaço do trabalho (radar, validação, estratégia e execução) e você recebe o resultado em forma de ação.",
      sub2:
        "Você escolhe um alvo e roda um ciclo curto: sinal → tese → playbook → métrica de 7 dias. Linguagem de operação: CAC, LTV, pipeline, ticket.",
      ctaPrimary: "Abrir app",
      ctaSecondary: "Ver planos",
      diffTitle: "Diferenciais (sem marketing vazio)",
      diffs: [
        { t: "Orquestração de agentes", d: "Em vez de um “chat”, você usa agentes especializados: Radar → Validador → Estrategista → Operador." },
        { t: "Sinal de compra, não “insight”", d: "A saída é ação: quem compra, por quê, e como testar." },
        { t: "Playbook de 7 dias", d: "Hipótese + experimento + métrica — com critério de decisão." },
        { t: "Timing e narrativa", d: "Você chega antes, com motivo claro e ângulo de abordagem." },
        { t: "Feito para execução", d: "Do sinal ao teste em minutos, não em semanas." },
      ],
      whoTitle: "Para quem é",
      who: [
        { t: "Founder / Solopreneur", d: "Validar rápido e vender sem meses de “achismo”." },
        { t: "Growth / Performance", d: "Pauta de aquisição baseada em evidência e timing." },
        { t: "SDR / RevOps", d: "Alvos + motivo + ângulo de outbound pronto." },
        { t: "Agência / Consultoria", d: "Empacotar oferta e fechar com demanda mais quente." },
      ],
      flowTitle: "Como funciona (4 passos)",
      steps: [
        { t: "1) Radar", d: "Coleta sinais públicos e destaca intenção." },
        { t: "2) Seleção", d: "Você escolhe 1 alvo (top 3) para atacar agora." },
        { t: "3) Estratégia", d: "Gera tese + plano de execução (7 dias)." },
        { t: "4) Execução", d: "Mede e decide: dobrar, ajustar ou parar." },
      ],
      faqTitle: "Perguntas rápidas",
      faq: [
        { q: "Isso substitui minha decisão?", a: "Não. O ZAIRIX reduz ruído e acelera a decisão com evidência." },
        { q: "Serve para B2B?", a: "Sim — especialmente outbound, revops e oferta produtizada." },
        { q: "Precisa de integração?", a: "Não. Você pode começar só com Radar e playbooks." },
      ],
      ctaBoxTitle: "Pronto para operar?",
      ctaBoxText: "Abra o app, escolha um alvo e gere um playbook de 7 dias. Se não fizer sentido em 7 dias, você mata — e segue.",
    },
    en: {
      top: "demand • ROI potential • execution • monetization",
      h1: "Stop betting on “ideas”. Find real demand and turn it into revenue.",
      sub1:
        "ZAIRIX is an AI agent orchestration: each agent handles one job (radar, validation, strategy, execution) so you get actionable output.",
      sub2: "Pick a target and run a short loop: signal → thesis → playbook → 7‑day metric. Operator language: CAC, LTV, pipeline, ticket.",
      ctaPrimary: "Open app",
      ctaSecondary: "See plans",
      diffTitle: "What’s different (no fluff)",
      diffs: [
        { t: "Agent orchestration", d: "Not a single chat: specialized agents run Radar → Validator → Strategist → Operator." },
        { t: "Buying signal, not “insight”", d: "Output is action: who buys, why, and how to test." },
        { t: "7‑day playbook", d: "Hypothesis + experiment + metric — with a decision rule." },
        { t: "Timing + narrative", d: "Show up early, with a clear reason and outreach angle." },
        { t: "Built for execution", d: "From signal to test in minutes, not weeks." },
      ],
      whoTitle: "Who it’s for",
      who: [
        { t: "Founder / Solopreneur", d: "Validate fast and sell without months of guesswork." },
        { t: "Growth / Performance", d: "Acquisition angles backed by evidence and timing." },
        { t: "SDR / RevOps", d: "Targets + reason + outreach angle, ready to use." },
        { t: "Agency / Consulting", d: "Package offers and close with warmer demand." },
      ],
      flowTitle: "How it works (4 steps)",
      steps: [
        { t: "1) Radar", d: "Collects public signals and highlights intent." },
        { t: "2) Pick", d: "Choose 1 target (top 3) to attack now." },
        { t: "3) Strategy", d: "Generates thesis + 7‑day execution plan." },
        { t: "4) Execute", d: "Measure and decide: double down, adjust, or stop." },
      ],
      faqTitle: "Quick FAQ",
      faq: [
        { q: "Does it replace my judgment?", a: "No. ZAIRIX cuts noise and speeds decisions with evidence." },
        { q: "Is it for B2B?", a: "Yes — especially outbound, revops and productized offers." },
        { q: "Do I need integrations?", a: "No. You can start with Radar + playbooks only." },
      ],
      ctaBoxTitle: "Ready to operate?",
      ctaBoxText: "Open the app, pick a target and generate a 7‑day playbook. If it doesn’t move in 7 days, kill it — and move on.",
    },
    es: {
      top: "demanda • ROI • ejecución • monetización",
      h1: "Deja de apostar por “ideas”. Encuentra demanda real y conviértela en ingresos.",
      sub1:
        "ZAIRIX es una orquestación de agentes de IA: cada agente hace una parte (radar, validación, estrategia, ejecución) para darte salida accionable.",
      sub2:
        "Elige un objetivo y ejecuta un ciclo corto: señal → tesis → playbook → métrica de 7 días. Lenguaje de operación: CAC, LTV, pipeline, ticket.",
      ctaPrimary: "Abrir app",
      ctaSecondary: "Ver planes",
      diffTitle: "Diferenciales (sin humo)",
      diffs: [
        { t: "Orquestación de agentes", d: "No es un solo chat: agentes especializados corren Radar → Validador → Estratega → Operador." },
        { t: "Señal de compra, no “insight”", d: "Salida accionable: quién compra, por qué y cómo testear." },
        { t: "Playbook de 7 días", d: "Hipótesis + experimento + métrica — con regla de decisión." },
        { t: "Timing y narrativa", d: "Llegas antes, con motivo claro y ángulo de outreach." },
        { t: "Hecho para ejecutar", d: "De señal a test en minutos, no semanas." },
      ],
      whoTitle: "Para quién es",
      who: [
        { t: "Founder / Solopreneur", d: "Validar rápido y vender sin meses de adivinanza." },
        { t: "Growth / Performance", d: "Ángulos de adquisición con evidencia y timing." },
        { t: "SDR / RevOps", d: "Targets + motivo + ángulo de outbound listo." },
        { t: "Agencia / Consultoría", d: "Empaquetar oferta y cerrar con demanda más caliente." },
      ],
      flowTitle: "Cómo funciona (4 pasos)",
      steps: [
        { t: "1) Radar", d: "Recolecta señales públicas y destaca intención." },
        { t: "2) Elegir", d: "Elige 1 objetivo (top 3) para atacar ahora." },
        { t: "3) Estrategia", d: "Genera tesis + plan de ejecución (7 días)." },
        { t: "4) Ejecutar", d: "Mide y decide: duplicar, ajustar o parar." },
      ],
      faqTitle: "FAQ rápido",
      faq: [
        { q: "¿Reemplaza mi decisión?", a: "No. ZAIRIX reduce ruido y acelera decisiones con evidencia." },
        { q: "¿Sirve para B2B?", a: "Sí — especialmente outbound, revops y oferta productizada." },
        { q: "¿Necesito integraciones?", a: "No. Puedes empezar solo con Radar y playbooks." },
      ],
      ctaBoxTitle: "¿Listo para operar?",
      ctaBoxText: "Abre la app, elige un objetivo y genera un playbook de 7 días. Si no se mueve en 7 días, lo matas — y sigues.",
    },
  }[lang];

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="uppercase tracking-[0.2em]">{t.top}</span>
                  <span className="text-zinc-600">•</span>
                  <div className="flex items-center gap-2">
                    <a className={`underline-offset-4 hover:underline ${lang === "pt" ? "text-zinc-200" : ""}`} href="/?lang=pt">
                      PT
                    </a>
                    <a className={`underline-offset-4 hover:underline ${lang === "en" ? "text-zinc-200" : ""}`} href="/?lang=en">
                      EN
                    </a>
                    <a className={`underline-offset-4 hover:underline ${lang === "es" ? "text-zinc-200" : ""}`} href="/?lang=es">
                      ES
                    </a>
                  </div>
                </div>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{t.h1}</h1>
                <p className="mt-4 text-zinc-300">{t.sub1}</p>
                <p className="mt-4 text-zinc-300">{t.sub2}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/dashboard">{t.ctaPrimary}</Button>
                  <Button href="/plans" variant="ghost">
                    {t.ctaSecondary}
                  </Button>
                </div>

                <Card className="mt-8 p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">exemplo — do sinal ao teste</div>
                  <div className="mt-2 text-sm font-medium text-zinc-100">RevOps + automação interna</div>
                  <div className="mt-2 text-sm text-zinc-300">
                    Times de receita estão correndo para automatizar operações (lead routing, follow‑up, billing e dunning) com automação interna.
                  </div>
                  <div className="mt-2 text-xs text-zinc-400">Fonte: sinais públicos • Intenção: alta • Score: 88</div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex gap-4 items-center">
                      <Image src="/images/evidencia-demanda.jpg" alt="Evidência real de demanda" width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                      <div>
                        <div className="text-xs font-medium text-zinc-200">1) Evidência</div>
                        <div className="mt-2 text-sm text-zinc-200">Vagas + conversas + stack</div>
                        <div className="mt-2 text-xs text-zinc-400">Indica urgência e orçamento.</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex gap-4 items-center">
                      <Image src="/images/potencial-retorno.jpg" alt="Potencial de retorno" width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                      <div>
                        <div className="text-xs font-medium text-zinc-200">2) Oferta</div>
                        <div className="mt-2 text-sm text-zinc-200">Implementação em 7 dias</div>
                        <div className="mt-2 text-xs text-zinc-400">Preço fechado, ROI claro.</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex gap-4 items-center">
                      <Image src="/images/teste-mercado.jpg" alt="Teste rápido de mercado" width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                      <div>
                        <div className="text-xs font-medium text-zinc-200">3) Teste</div>
                        <div className="mt-2 text-sm text-zinc-200">Landing + outbound</div>
                        <div className="mt-2 text-xs text-zinc-400">Ângulo e motivo prontos.</div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex gap-4 items-center">
                      <Image src="/images/indicador-decisao.jpg" alt="Indicador claro de decisão" width={80} height={80} className="rounded-lg object-cover w-20 h-20" />
                      <div>
                        <div className="text-xs font-medium text-zinc-200">4) Métrica</div>
                        <div className="mt-2 text-sm text-zinc-200">7 dias</div>
                        <div className="mt-2 text-xs text-zinc-400">Dobrar, ajustar ou parar.</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-transparent to-emerald-500/10 blur-2xl" />
                <Card className="relative overflow-hidden p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{t.flowTitle}</div>
                  <div className="mt-4 grid gap-3">
                    {t.steps.map((s) => (
                      <div key={s.t} className="rounded-xl border border-emerald-500/15 bg-black/40 p-4">
                        <div className="text-sm font-semibold text-zinc-100">{s.t}</div>
                        <div className="mt-2 text-sm text-zinc-200">{s.d}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </Container>
        </section>

        <section className="py-16 border-t border-emerald-500/10">
          <Container>
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{t.diffTitle}</div>
                  <div className="mt-4 space-y-3">
                    {t.diffs.map((d) => (
                      <div key={d.t} className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <div className="text-sm font-semibold text-zinc-100">{d.t}</div>
                        <div className="mt-2 text-sm text-zinc-200">{d.d}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{t.whoTitle}</div>
                  <div className="mt-4 space-y-3">
                    {t.who.map((w) => (
                      <div key={w.t} className="rounded-xl border border-white/10 bg-black/30 p-4">
                        <div className="text-sm font-semibold text-zinc-100">{w.t}</div>
                        <div className="mt-2 text-sm text-zinc-200">{w.d}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="mt-10 grid gap-4 lg:grid-cols-2">
                <Card className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">{t.faqTitle}</div>
                  <div className="mt-4 space-y-3">
                    {t.faq.map((f) => (
                      <div key={f.q} className="rounded-xl border border-emerald-500/10 bg-black/30 p-4">
                        <div className="text-sm font-semibold text-zinc-100">{f.q}</div>
                        <div className="mt-2 text-sm text-zinc-200">{f.a}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">CTA</div>
                  <div className="mt-3 text-lg font-semibold text-zinc-100">{t.ctaBoxTitle}</div>
                  <div className="mt-2 text-sm text-zinc-200">{t.ctaBoxText}</div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href="/dashboard">{t.ctaPrimary}</Button>
                    <Button href="/plans" variant="ghost">
                      {t.ctaSecondary}
                    </Button>
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

