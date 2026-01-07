"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 8 && status !== "loading", [email, password, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    setStatus(res.ok ? "success" : "error");
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Criar conta</h1>
              <p className="mt-2 text-sm text-zinc-300">Crie uma conta com email, senha e 2FA.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-zinc-400">Nome</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                    type="text"
                    autoComplete="name"
                  />
                </div>

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

                <div>
                  <label className="text-xs text-zinc-400">Senha (mínimo 8 caracteres)</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="*******"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <Button type="submit" disabled={!canSubmit}>
                  Criar conta
                </Button>

                {status === "success" ? (
                  <div className="text-sm text-zinc-300">Conta criada. Você foi autenticado.</div>
                ) : null}
                {status === "error" ? (
                  <div className="text-sm text-zinc-300">Não foi possível criar conta. Tente novamente.</div>
                ) : null}
              </form>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
