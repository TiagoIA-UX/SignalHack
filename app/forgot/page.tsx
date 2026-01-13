"use client";

import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setState("sent");
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
              <h1 className="text-xl font-semibold tracking-tight">Recuperar senha</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Informe seu email corporativo. Se houver uma conta ativa, enviaremos um link de redefinição com expiração.
              </p>

              {state === "sent" ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
                  Se o email estiver cadastrado, o link foi enviado. Verifique sua caixa de entrada e spam.
                </div>
              ) : (
                <div className="mt-6">
                  <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu-email@empresa.com"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-white/20"
                    autoComplete="email"
                  />
                  {state === "error" ? (
                    <div className="mt-3 text-xs text-zinc-400">
                      Não foi possível enviar agora. Tente novamente em alguns minutos.
                    </div>
                  ) : null}
                  <div className="mt-4">
                    <Button onClick={submit} disabled={!email || state === "sending"}>
                      {state === "sending" ? "Enviando…" : "Enviar link"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button href="/login">Voltar para login</Button>
                <Button href="/register" variant="ghost">
                  Criar conta
                </Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
