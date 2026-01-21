"use client";

import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { AFFILIATE_COPY } from "@/lib/support";
import { getAffiliateHostingUrl, getSupportEmail, getPixKey } from "@/lib/env";
import { AppHeader } from "@/components/AppHeader";

export default function SupportPage() {
  const affiliateUrl = getAffiliateHostingUrl();
  const supportEmail = getSupportEmail();
  const pixKey = getPixKey();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="pt-24 pb-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">apoio ao projeto</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Suporte e contato</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  SIGNALHACK é um painel interno com acesso por nível. Suporte cobre implantação, evolução e operação assistida.
                </p>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">O que o suporte cobre</div>
                  <ul className="mt-2 space-y-2">
                    <li>• Infraestrutura: hospedagem, domínio e custos operacionais.</li>
                    <li>• Segurança e monitoramento: rotinas e boas práticas.</li>
                    <li>• Evolução: melhorias, manutenção e testes.</li>
                    <li>• Suporte não substitui o acesso por nível.</li>
                  </ul>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">Canais externos</div>
                  <p className="mt-2 text-sm text-zinc-200">
                    Pagamentos externos podem habilitar níveis de acesso ou suporte. Se quiser parceria/royalties, fale conosco.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                    <li>• PIX: {pixKey ? <strong>{pixKey}</strong> : "Disponível mediante contato"}.</li>
                    <li>
                      • Contato:{" "}
                      {supportEmail ? (
                        <a className="text-emerald-200 hover:underline" href={`mailto:${supportEmail}`}>
                          {supportEmail}
                        </a>
                      ) : (
                        "Disponível mediante contato"
                      )}
                      .
                    </li>
                    <li>
                      • Página de aquisição:{" "}
                      <Link className="text-emerald-200 hover:underline" href="/acquire">
                        /acquire
                      </Link>
                      .
                    </li>
                  </ul>
                </div>

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
                  <strong>Importante:</strong> acesso é sempre validado por código e nível.
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
