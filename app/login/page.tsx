"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

function LoginContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => email.trim().length > 3 && status !== "loading", [email, status]);

  const oauthError = (() => {
    if (!errorCode) return null;
    if (errorCode === "oauth_not_configured") return "Login Google não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.";
    if (errorCode === "oauth_invalid") return "Link de login inválido. Tente novamente.";
    if (errorCode === "oauth_failed") return "Não foi possível autenticar com o Google.";
    if (errorCode === "auth_not_configured") return "Autenticação não configurada. Verifique AUTH_SECRET.";
    if (errorCode === "db_unavailable") return "Banco indisponível agora.";
    return "Não foi possível autenticar.";
  })();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, next: "/dashboard" }),
        signal: controller.signal,
      });

      if (res.ok) {
        setStatus("ok");
        return;
      }

      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      if (payload?.error === "rate_limited") {
        setErrorMsg("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else if (payload?.error === "email_not_configured") {
        setErrorMsg("Email não configurado. Defina SMTP_* no ambiente.");
      } else if (payload?.error === "not_configured") {
        setErrorMsg("Autenticação não configurada. Verifique AUTH_TOKEN_PEPPER.");
      } else {
        setErrorMsg("Não foi possível enviar o link agora. Tente novamente.");
      }
    } catch (err) {
      setStatus("error");
      if ((err as { name?: unknown })?.name === "AbortError") {
        setErrorMsg("Está demorando mais que o normal. Tente novamente.");
      } else {
        setErrorMsg("Não foi possível conectar agora. Tente novamente.");
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
              <p className="mt-2 text-sm text-zinc-300">Receba um link mágico no seu email.</p>

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
                  {status === "loading" ? "Enviando…" : "Enviar link"}
                </Button>

                {status === "ok" ? (
                  <div className="text-sm text-zinc-300">Se o email existir, enviaremos o link agora.</div>
                ) : null}
                {status === "error" ? <div className="text-sm text-zinc-300">{errorMsg ?? "Não foi possível enviar."}</div> : null}
                {oauthError ? <div className="text-sm text-zinc-300">{oauthError}</div> : null}
              </form>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}
