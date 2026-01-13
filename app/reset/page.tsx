"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function ResetPage() {
  const params = useMemo(() => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search), []);
  const token = params.get("token") ?? "";
  const emailFromQuery = params.get("email") ?? "";

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "ok" | "error">("idle");

  async function submit() {
    setState("saving");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      if (res.ok) {
        setState("ok");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 600);
        return;
      }

      setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Redefinir senha</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Defina uma nova senha para recuperar acesso. Este link expira por segurança.
              </p>

              {!token ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
                  Link inválido ou ausente. Solicite um novo link em <a className="text-emerald-200 hover:underline" href="/forgot">Recuperar acesso</a>.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-white/20"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">nova senha</label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-white/20"
                      autoComplete="new-password"
                    />
                    <div className="mt-2 text-xs text-zinc-500">Mínimo 8 caracteres.</div>
                  </div>

                  {state === "error" ? (
                    <div className="text-xs text-zinc-400">
                      Não foi possível redefinir. O link pode ter expirado. Solicite um novo link.
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={submit} disabled={!email || !password || state === "saving"}>
                      {state === "saving" ? "Salvando…" : state === "ok" ? "Confirmado" : "Confirmar nova senha"}
                    </Button>
                    <Button href="/login" variant="ghost">
                      Voltar para login
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
