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
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">aquisição externa (opcional)</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Suporte e licença (fora do software)</h1>
            <p className="mt-3 text-sm text-zinc-300">
              Este software é <strong>100% liberado</strong> e não bloqueia nada. Se você quiser suporte, licença comercial,
              implantação ou parceria, você compra fora (Hotmart / Mercado Livre / Gumroad / Stripe Link / checkout próprio).
            </p>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-zinc-300">
                  <strong>Importante:</strong> comprar não “libera acesso” — porque o acesso já é liberado.
                  <br />
                  A compra é para <strong>suporte</strong>, <strong>licença</strong> e/ou <strong>serviços</strong> externos.
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
                    Nenhum link externo foi configurado ainda. Mesmo assim, você pode usar o app normalmente.
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
                    <summary className="cursor-pointer text-zinc-200 font-semibold">O que entra em “suporte/licença”?</summary>
                    <div className="mt-3 space-y-2 text-sm text-zinc-300">
                      <p>Você escolhe o nível de ajuda fora do sistema (sem travas internas).</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Instalação em VPS/KVM e hardening</li>
                        <li>Treinamento de uso (operacional)</li>
                        <li>Customização de copy e módulos</li>
                        <li>Integrações (se você quiser)</li>
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

