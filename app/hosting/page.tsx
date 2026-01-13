import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Container, Card } from "@/components/ui";
import { AFFILIATE_COPY } from "@/lib/support";
import { getAffiliateHostingUrl } from "@/lib/env";

export default function HostingPage() {
  const affiliateUrl = getAffiliateHostingUrl();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">infraestrutura recomendada</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Hospedagem e Infraestrutura</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  Para facilitar operações e reduzir custos, recomendamos provedores de hospedagem com bom custo/benefício.
                  Se preferir apoiar o projeto de forma indireta, considere usar o link de afiliado abaixo ao contratar a
                  hospedagem.
                </p>

                {affiliateUrl ? (
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Infraestrutura recomendada</div>
                    <p className="mt-2 text-sm text-zinc-200">{AFFILIATE_COPY}</p>
                    <Link href={affiliateUrl} className="text-emerald-200 hover:underline" target="_blank" rel="noopener noreferrer">
                      Ver provedores recomendados
                    </Link>
                  </div>
                ) : null}
              </div>
            </Card>

            <div className="mt-6 text-sm text-zinc-300">
              <Link className="text-emerald-200 hover:underline" href="/support">
                Ler sobre apoio ao projeto
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
