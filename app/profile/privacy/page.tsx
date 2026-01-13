"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
import {
  CONSENT_COOKIE_NAME,
  LEGAL_VERSION,
  getCookieValueFromDocument,
  parseConsent,
} from "@/lib/consent";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function PrivacySettingsPage() {
  const existing = useMemo(() => {
    const raw = getCookieValueFromDocument(CONSENT_COOKIE_NAME);
    return parseConsent(raw);
  }, []);

  const [metrics, setMetrics] = useState(!!existing?.categories.metrics);
  const [personalization, setPersonalization] = useState(!!existing?.categories.personalization);
  const [state, setState] = useState<SaveState>("idle");

  async function save(next: { metrics: boolean; personalization: boolean }) {
    setState("saving");
    try {
      const res = await fetch("/api/legal/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...next, source: "settings" }),
      });

      if (!res.ok) {
        setState("error");
        return;
      }

      setState("saved");
      setTimeout(() => setState("idle"), 1200);
    } catch {
      setState("error");
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Privacidade & Consentimento</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Controle cookies não essenciais. Essenciais (autenticação e segurança) ficam sempre ativos.
              </p>

              <div className="mt-6 space-y-3">
                <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-200">Métricas</div>
                    <div className="mt-1 text-xs text-zinc-400">Uso do produto e qualidade (ex.: funil e performance).</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={metrics}
                    onChange={(e) => setMetrics(e.target.checked)}
                    className="mt-1"
                  />
                </label>

                <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div>
                    <div className="text-sm font-medium text-zinc-200">Personalização</div>
                    <div className="mt-1 text-xs text-zinc-400">Preferências e experiência (ex.: atalhos e recomendações).</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={personalization}
                    onChange={(e) => setPersonalization(e.target.checked)}
                    className="mt-1"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMetrics(false);
                    setPersonalization(false);
                    void save({ metrics: false, personalization: false });
                  }}
                >
                  Revogar não essenciais
                </Button>
                <Button variant="primary" onClick={() => void save({ metrics, personalization })}>
                  Salvar preferências
                </Button>
              </div>

              <div className="mt-3 text-xs text-zinc-500">
                Versão legal vigente: v{LEGAL_VERSION}
                {state === "saving" ? " • salvando…" : ""}
                {state === "saved" ? " • salvo" : ""}
                {state === "error" ? " • erro ao salvar" : ""}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button href="/terms" variant="ghost">
                  Termos
                </Button>
                <Button href="/privacy" variant="ghost">
                  Privacidade
                </Button>
                <Button href="/cookies" variant="ghost">
                  Cookies
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
