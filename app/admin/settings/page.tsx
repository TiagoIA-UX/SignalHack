"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";

type StatusResponse =
  | { ok: true; status: { groq: boolean; mercadopago: boolean } }
  | { error: string; message?: string };

function StatusBadge(props: { ok: boolean; labelOk: string; labelNo: string }) {
  return (
    <Badge className={props.ok ? "" : "border-white/10 bg-transparent text-zinc-500"}>
      {props.ok ? props.labelOk : props.labelNo}
    </Badge>
  );
}

export default function AdminSettingsPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groqApiKey, setGroqApiKey] = useState("");
  const [mpToken, setMpToken] = useState("");

  async function refresh() {
    setError(null);
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    const json = (await res.json().catch(() => null)) as StatusResponse | null;
    setStatus(json);
    if (!res.ok) {
      setError((json && "message" in json && json.message) || "Falha ao carregar status");
    }
  }

  useEffect(() => {
    refresh().catch(() => null);
  }, []);

  const statusOk = useMemo(() => (status && "ok" in status ? status.status : null), [status]);

  async function save(payload: unknown) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => null)) as StatusResponse | null;
      setStatus(json);
      if (!res.ok) {
        setError((json && "message" in json && json.message) || "Falha ao salvar");
        return;
      }
      // limpa inputs sensíveis após salvar
      setGroqApiKey("");
      setMpToken("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Admin • Credenciais</h1>
                <p className="mt-2 text-sm text-zinc-300">
                  Área restrita. Aqui você configura integrações opcionais (Groq, Mercado Pago).
                  <span className="text-zinc-500"> DATABASE_URL/AUTH_SECRET continuam sendo env vars da Vercel.</span>
                </p>
              </div>
              <Button variant="ghost" onClick={() => refresh()} disabled={saving}>
                Atualizar
              </Button>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div className="mt-8 grid gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">LLM</div>
                    <div className="mt-1 text-base font-semibold">Groq API</div>
                  </div>
                  <StatusBadge ok={!!statusOk?.groq} labelOk="configurado" labelNo="não configurado" />
                </div>

                <div className="mt-4">
                  <label className="text-xs text-zinc-400">GROQ_API_KEY</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-emerald-500/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/30"
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="cole a chave e salve"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => save({ groqApiKey: groqApiKey.trim() || undefined })}
                      disabled={saving || !groqApiKey.trim()}
                    >
                      Salvar Groq
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">billing</div>
                    <div className="mt-1 text-base font-semibold">Mercado Pago</div>
                  </div>
                  <StatusBadge ok={!!statusOk?.mercadopago} labelOk="configurado" labelNo="não configurado" />
                </div>

                <div className="mt-4">
                  <label className="text-xs text-zinc-400">MERCADOPAGO_ACCESS_TOKEN</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-emerald-500/15 bg-black/50 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/30"
                    type="password"
                    value={mpToken}
                    onChange={(e) => setMpToken(e.target.value)}
                    placeholder="cole o token e salve"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={() => save({ mercadopagoAccessToken: mpToken.trim() || undefined })}
                      disabled={saving || !mpToken.trim()}
                    >
                      Salvar Mercado Pago
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <p className="mt-6 text-xs text-zinc-500">
              Segurança: valores são enviados apenas no submit e armazenados criptografados no banco. A UI não exibe o valor salvo.
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
