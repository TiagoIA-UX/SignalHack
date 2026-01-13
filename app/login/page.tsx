"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 8 && status !== "loading", [email, password, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      if (res.ok) {
        setStatus("ok");
        window.location.href = "/dashboard";
        return;
      }

      setStatus("error");
      if (res.status === 401) {
        setErrorMsg("Credenciais inválidas. Confira email e senha.");
      } else {
        setErrorMsg("Não foi possível entrar agora. Tente novamente em instantes.");
      }
    } catch (err) {
      setStatus("error");
      if ((err as { name?: unknown })?.name === "AbortError") {
        setErrorMsg("Está demorando mais que o normal. Tente novamente.");
      } else {
        setErrorMsg("Não foi possível conectar agora. Tente novamente em instantes.");
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
              <p className="mt-2 text-sm text-zinc-300">Entre com email e senha.</p>

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

                <div>
                  <label className="text-xs text-zinc-400">Senha</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="senha"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                  <div className="mt-2">
                    <a href="/forgot" className="text-xs text-zinc-400 hover:text-zinc-200 hover:underline">
                      Esqueci minha senha
                    </a>
                  </div>
                </div>

                <Button type="submit" disabled={!canSubmit}>
                  {status === "loading" ? "Entrando…" : "Entrar"}
                </Button>

                {status === "ok" ? (
                  <div className="text-sm text-zinc-300">Logado com sucesso. Redirecionando...</div>
                ) : null}
                {status === "error" ? <div className="text-sm text-zinc-300">{errorMsg ?? "Não foi possível entrar."}</div> : null}
              </form>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
