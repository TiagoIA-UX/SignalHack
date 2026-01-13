import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { AFFILIATE_HOSTINGER, AFFILIATE_COPY } from "@/lib/support";
import { AppHeader } from "@/components/AppHeader";

export default function SupportPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">apoio ao projeto</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Apoie o Projeto</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  Este software é desenvolvido e mantido de forma independente. Atualmente não há investidores, empresa por
                  trás ou financiamento externo. Qualquer apoio financeiro é voluntário e destinado exclusivamente a custos
                  de infraestrutura, domínio e hospedagem.
                </p>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como ajudar</div>
                  <ul className="mt-2 space-y-2">
                    <li>
                      • Doação: se preferir doar diretamente, você pode usar Pix, PayPal ou Stripe — usamos esses canais para
                      facilitar doações (links/contas a critério do mantenedor).
                    </li>
                    <li>
                      • Apoio indireto: contratar serviços de infraestrutura pelo link de afiliado abaixo ajuda o projeto sem
                      custo adicional para você.
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Hostinger (afiliado)</div>
                  <p className="mt-2 text-sm text-zinc-200">{AFFILIATE_COPY}</p>
                  <Link
                    href={AFFILIATE_HOSTINGER}
                    className="inline-block mt-3 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visitar Hostinger
                  </Link>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-zinc-400">
                  <strong>Importante:</strong> o uso do software não depende de contribuição financeira. Apoios são
                  voluntários e transparentes.
                </div>

                <div className="text-xs text-zinc-500">Agradecemos seu interesse em manter este projeto ativo.</div>
              </div>
            </Card>

            <div className="mt-6 text-sm text-zinc-300">
              <Link className="text-emerald-200 hover:underline" href="/">
                Voltar à página inicial
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
