"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import {
  CONSENT_COOKIE_NAME,
  LEGAL_VERSION,
  encodeCookieJson,
  getCookieValueFromDocument,
  makeConsent,
  parseConsent,
  setClientCookie,
} from "@/lib/consent";

type BannerMode = "compact" | "prefs";

export function CookieBanner() {
  // Importante: não ler `document.cookie` durante SSR para evitar mismatch de hidratação.
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<BannerMode>("compact");
  const [metrics, setMetrics] = useState(false);
  const [personalization, setPersonalization] = useState(false);

  useEffect(() => {
    const raw = getCookieValueFromDocument(CONSENT_COOKIE_NAME);
    const existing = parseConsent(raw);
    setVisible(!existing);
    setMetrics(!!existing?.categories.metrics);
    setPersonalization(!!existing?.categories.personalization);
  }, []);

  async function applyConsent(next: { metrics: boolean; personalization: boolean }) {
    try {
      const res = await fetch("/api/legal/consent", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...next, source: "banner" }),
      });

      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { consent?: unknown } | null;
        const consent = data && typeof data === "object" ? (data as { consent?: unknown }).consent : null;

        try {
          window.dispatchEvent(new CustomEvent("sf:consent", { detail: consent }));
        } catch {
          // noop
        }

        setVisible(false);
        setMode("compact");
        return;
      }
    } catch {
      // Fall through to client-side fallback.
    }

    // Fallback: client-only cookies (non-audited). This prevents hard blocks in case of transient issues.
    const consent = makeConsent({ metrics: next.metrics, personalization: next.personalization });
    setClientCookie(CONSENT_COOKIE_NAME, encodeCookieJson(consent), { maxAgeDays: 365 });
    setClientCookie("sf_legal_version", LEGAL_VERSION, { maxAgeDays: 365 });

    try {
      window.dispatchEvent(new CustomEvent("sf:consent", { detail: consent }));
    } catch {
      // noop
    }

    setVisible(false);
    setMode("compact");
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="p-4 bg-black/85 backdrop-blur-md shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-[240px] flex-1">
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">cookies & consentimento</div>
              <div className="mt-2 text-sm text-zinc-200">
                Usamos cookies essenciais para autenticação e segurança. Métricas e personalização só com seu consentimento.
              </div>
              <div className="mt-2 text-xs text-zinc-500">LGPD + GDPR • sem tracking sem consentimento</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => applyConsent({ metrics: false, personalization: false })}>
                Somente essenciais
              </Button>
              <Button variant="ghost" onClick={() => setMode((m) => (m === "prefs" ? "compact" : "prefs"))}>
                Preferências
              </Button>
              <Button variant="primary" onClick={() => applyConsent({ metrics: true, personalization: true })}>
                Aceitar tudo
              </Button>
            </div>
          </div>

          {mode === "prefs" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/60 p-4">
                <input type="checkbox" checked={metrics} onChange={(e) => setMetrics(e.target.checked)} className="mt-1" />
                <span className="text-sm text-zinc-200">Permitir cookies de métricas (opcional).</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/60 p-4">
                <input
                  type="checkbox"
                  checked={personalization}
                  onChange={(e) => setPersonalization(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-zinc-200">Permitir cookies de personalização (opcional).</span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
                <div className="text-xs text-zinc-500">Essenciais são sempre ativos.</div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setMode("compact")}>
                    Cancelar
                  </Button>
                  <Button variant="primary" onClick={() => applyConsent({ metrics, personalization })}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
