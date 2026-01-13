import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { AFFILIATE_COPY } from "@/lib/support";
import { getAffiliateHostingUrl, getSupportEmail, getPixKey, isDonationEnabled, getDonationCopyVariant } from "@/lib/env";
import { AppHeader } from "@/components/AppHeader";

export default function SupportPage() {
  const affiliateUrl = getAffiliateHostingUrl();
  const supportEmail = getSupportEmail();
  const pixKey = getPixKey();
  const donationsEnabled = isDonationEnabled();
  const donationVariant = getDonationCopyVariant();

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
                  ZAIRIX é uma plataforma independente, construída com foco em clareza, controle e responsabilidade. Para
                  manter a infraestrutura, evolução contínua e acesso público, disponibilizamos formas transparentes de apoio.
                </p>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Como o apoio ajuda</div>
                  <ul className="mt-2 space-y-2">
                    <li>• Infraestrutura: servidores, banco de dados e domínio.</li>
                    <li>• Segurança e monitoramento: Sentry, backups e rotinas operacionais.</li>
                    <li>• Evolução: melhorias, manutenção e testes.</li>
                    <li>• Apoio é sempre voluntário e nunca condiciona recursos ou privilégios.</li>
                  </ul>
                </div>

                {donationsEnabled ? (
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Apoio financeiro</div>
                    <ul className="mt-2 space-y-2 text-sm text-zinc-200">
                      <li>• PIX: {pixKey ? <strong>{pixKey}</strong> : "Disponível mediante contato"}.</li>
                      <li>
                        • PayPal: {supportEmail ? (
                          <a
                            className="text-emerald-200 hover:underline"
                            href={`https://www.paypal.com/donate?business=${encodeURIComponent(supportEmail ?? "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Doar via PayPal
                          </a>
                        ) : (
                          "Disponível mediante contato"
                        )}.
                      </li>
                      <li>• Nota: Stripe não está disponível no momento.</li>
                    </ul>
                  </div>
                ) : null}

                {affiliateUrl ? (
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Infraestrutura recomendada</div>
                    <p className="mt-2 text-sm text-zinc-200">{AFFILIATE_COPY}</p>
                    <Link href={affiliateUrl} className="text-emerald-200 hover:underline" target="_blank" rel="noopener noreferrer">
                      Ver provedores recomendados
                    </Link>
                  </div>
                ) : null}

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
