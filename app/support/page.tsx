"use client";

import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { AFFILIATE_COPY } from "@/lib/support";
import { getAffiliateHostingUrl, getSupportEmail, getPixKey, isDonationEnabled, getDonationCopyVariant } from "@/lib/env";
import { AppHeader } from "@/components/AppHeader";
import { useState } from "react";

export default function SupportPage() {
  const affiliateUrl = getAffiliateHostingUrl();
  const supportEmail = getSupportEmail();
  const pixKey = getPixKey();
  const donationsEnabled = isDonationEnabled();
  const donationVariant = getDonationCopyVariant();

  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (amount < 1) return;

    setLoading(true);
    try {
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("Erro ao criar checkout. Tente novamente.");
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-200">Doação via Mercado Pago</label>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-zinc-400">R$</span>
                          <input
                            type="number"
                            min="1"
                            max="10000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-24 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-zinc-200"
                          />
                          <button
                            onClick={handleDonate}
                            disabled={loading}
                            className="rounded bg-emerald-600 px-4 py-1 text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            {loading ? "Processando..." : "Doar"}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">Valor mínimo: R$ 1,00 | Máximo: R$ 10.000,00</p>
                      </div>

                      <ul className="space-y-2 text-sm text-zinc-200">
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
                      </ul>
                    </div>
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
