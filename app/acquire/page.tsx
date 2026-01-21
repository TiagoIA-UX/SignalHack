import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

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
    <div className="min-h-screen">
      <AppHeader />
      <main className="pt-24 pb-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">aquisição externa</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Acesso por nível</h1>
            <p className="mt-3 text-sm text-zinc-300">
              O acesso é liberado por código. Pagamento externo valida o nível (Observer / Operator / Strategist) e ativa o painel.
            </p>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-zinc-300">
                  <strong>Fluxo:</strong> pagamento externo → código de acesso → ativação no painel.
                </div>

                {links.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {links.map((l) => (
                      <a
                        key={l.label}
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl border border-emerald-500/15 bg-black/35 p-4 hover:border-emerald-500/25"
                      >
                        <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Abrir</div>
                        <div className="mt-2 text-base font-semibold text-emerald-100">{l.label}</div>
                        <div className="mt-2 text-xs text-zinc-500">Link externo</div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-300">
                    Nenhum link externo foi configurado ainda.
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button href="/app">Abrir o app</Button>
                      <Button href="/support" variant="ghost">
                        Falar com suporte
                      </Button>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-zinc-400">
                  <details>
                    <summary className="cursor-pointer text-zinc-200 font-semibold">O que entra no acesso?</summary>
                    <div className="mt-3 space-y-2 text-sm text-zinc-300">
                      <p>Você escolhe o nível e o formato de ajuda.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Código de acesso por nível</li>
                        <li>Implantação e operação assistida</li>
                        <li>Customização de módulos</li>
                        <li>Integrações sob demanda</li>
                        <li>Parceria com royalties</li>
                      </ul>
                    </div>
                  </details>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}

