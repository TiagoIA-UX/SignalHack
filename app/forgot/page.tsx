"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const canSubmit = useMemo(() => email.trim().length > 3 && status !== "loading", [email, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Recuperar senha</h1>
              <p className="mt-2 text-sm text-zinc-300">Enviaremos um link para redefinir sua senha.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-zinc-400">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@empresa.com"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </div>

                <Button type="submit" disabled={!canSubmit}>
                  Enviar link de recuperação
                </Button>

                {status === "sent" ? (
                  <div className="text-sm text-zinc-300">Se o e-mail existir, enviamos o link.</div>
                ) : null}
                {status === "error" ? (
                  <div className="text-sm text-zinc-300">Erro ao enviar. Tente novamente.</div>
                ) : null}
              </form>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
