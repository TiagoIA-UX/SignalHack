"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function ResetPage() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const canSubmit = useMemo(() => password.length >= 8 && status !== "loading", [password, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });
    setStatus(res.ok ? "ok" : "error");
    if (res.ok) window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Redefinir senha</h1>
              <p className="mt-2 text-sm text-zinc-300">Defina sua nova senha.</p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-zinc-400">Nova senha</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="nova senha"
                    className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none focus:ring-2 focus:ring-white/10"
                    type="password"
                    required
                  />
                </div>

                <Button type="submit" disabled={!canSubmit}>
                  Redefinir senha
                </Button>

                {status === "ok" ? (
                  <div className="text-sm text-zinc-300">Senha atualizada. Redirecionando...</div>
                ) : null}
                {status === "error" ? (
                  <div className="text-sm text-zinc-300">Erro: link inválido ou expirado.</div>
                ) : null}
              </form>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
