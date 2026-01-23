import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
import MercadoPagoCheckoutButton from "@/components/MercadoPagoCheckoutButton";

type AcquireLink = { label: string; href: string };

function getAcquireLinks(): AcquireLink[] {
  const links: AcquireLink[] = [];
  const hotmart = process.env.NEXT_PUBLIC_ACQUIRE_HOTMART_URL;
  const gumroad = process.env.NEXT_PUBLIC_ACQUIRE_GUMROAD_URL;
  const stripe = process.env.NEXT_PUBLIC_ACQUIRE_STRIPE_LINK_URL;
  const mercadolivre = process.env.NEXT_PUBLIC_ACQUIRE_MERCADOLIVRE_URL;
  const checkout = process.env.NEXT_PUBLIC_ACQUIRE_CHECKOUT_URL;

  if (hotmart) links.push({ label: "Hotmart", href: hotmart });
  if (mercadolivre) links.push({ label: "Mercado Livre", href: mercadolivre });
  if (gumroad) links.push({ label: "Gumroad", href: gumroad });
  if (stripe) links.push({ label: "Stripe Link", href: stripe });
  if (checkout) links.push({ label: "Checkout externo", href: checkout });

  return links;
}

export default function AcquirePage() {
  const links = getAcquireLinks();

  return (
    <div className="min-h-screen bg-black">
      <AppHeader />
      <main className="pt-24 pb-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Oferta</div>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">Pilot: validação de demanda — 7 dias</h1>
            <p className="mt-3 text-sm text-zinc-300">Implantação curta, métrica clara e decisão objetiva. Ideal para founders, RevOps e agências que precisam testar hipóteses com resultado mensurável.</p>

            <Card className="mt-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-emerald-100 font-semibold">Preço sugerido</div>
                  <div className="mt-2 text-2xl font-bold text-zinc-100">R$ 2.500</div>
                  <div className="mt-4 text-sm text-zinc-300">Valor para pilot padrão (7 dias). Podemos ajustar por escopo ou ICP.</div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
                    {links.length > 0 ? (
                      links.map((l) => (
                        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full sm:w-auto">Comprar via {l.label}</Button>
                        </a>
                      ))
                    ) : (
                      <>
                        <Button href="#contact" className="w-full sm:w-auto">Comprar Pilot — placeholder</Button>
                        <Button href="/support" variant="ghost" className="w-full sm:w-auto">Falar com suporte</Button>
                      </>
                    )}

                    {/* Mercado Pago checkout (API) */}
                    <div className="w-full sm:w-auto">
                      {process.env.MERCADOPAGO_ACCESS_TOKEN ? (
                        <MercadoPagoCheckoutButton className="w-full sm:w-auto" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-emerald-100 font-semibold">O que está incluído</div>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                    <li>• Identificação e documentação do sinal (contexto e evidência).</li>
                    <li>• Avaliação de potencial (urgência, comprador, orçamento).</li>
                    <li>• Experimento de 7 dias com métrica definida.</li>
                    <li>• Relatório final com decisão e próximos passos.</li>
                    <li>• Templates de outreach e material de prova (email, pitch).</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-sm text-zinc-400">
                Observação: este é um serviço de validação e não bloqueia o acesso ao software; serve para acelerar a geração de receita e reduzir risco.
              </div>
            </Card>

            {/* FAQ */}
            <section className="mt-8">
              <div className="text-sm text-zinc-400">Perguntas frequentes</div>
              <div className="mt-4 grid gap-3">
                <Card className="p-4">
                  <details>
                    <summary className="cursor-pointer font-semibold text-zinc-100">Como funciona o pilot?</summary>
                    <div className="mt-2 text-sm text-zinc-300">Definimos 1 sinal, rodamos um experimento simples por 7 dias com métrica clara (respostas/testes/receita) e entregamos um relatório com decisão.</div>
                  </details>
                </Card>

                <Card className="p-4">
                  <details>
                    <summary className="cursor-pointer font-semibold text-zinc-100">Posso pedir customizações?</summary>
                    <div className="mt-2 text-sm text-zinc-300">Sim — ajustes de escopo são possíveis e cobrados à parte. Se precisar, fale com suporte antes de comprar.</div>
                  </details>
                </Card>

                <Card className="p-4">
                  <details>
                    <summary className="cursor-pointer font-semibold text-zinc-100">Como recebo o resultado?</summary>
                    <div className="mt-2 text-sm text-zinc-300">Recebe um relatório claro: o sinal, métricas coletadas, aprendizado e recomendação (continuar/ajustar/parar).</div>
                  </details>
                </Card>
              </div>
            </section>

            <Card id="contact" className="mt-8 p-6">
              <div className="text-sm font-semibold text-emerald-100">Quer que eu te ajude a escolher o pilot?</div>
              <div className="mt-2 text-sm text-zinc-300">Envie um e-mail ou agende uma conversa. Podemos ajustar o piloto ao seu contexto.</div>
              <div className="mt-4 flex gap-3">
                <a href="mailto:tiagorocha1777@gmail.com">
                  <Button>Enviar e-mail</Button>
                </a>
                <Button href="/support" variant="ghost">Falar com suporte</Button>
              </div>
            </Card>

          </div>
        </Container>
      </main>
    </div>
  );
}

