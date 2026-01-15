"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

function LoginContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  const oauthError = (() => {
    if (!errorCode) return null;
    if (errorCode === "oauth_not_configured") return "Login Google não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET.";
    if (errorCode === "oauth_invalid") return "Link de login inválido. Tente novamente.";
    if (errorCode === "oauth_failed") return "Não foi possível autenticar com o Google.";
    if (errorCode === "auth_not_configured") return "Autenticação não configurada. Verifique AUTH_SECRET.";
    if (errorCode === "db_unavailable") return "Banco indisponível agora.";
    return "Não foi possível autenticar.";
  })();

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
              <p className="mt-2 text-sm text-zinc-300">Entre com sua conta Google.</p>
              <div className="mt-4">
                <Button href="/api/auth/google" variant="ghost">
                  Continuar com Google
                </Button>
              </div>
              {oauthError ? <div className="mt-4 text-sm text-zinc-300">{oauthError}</div> : null}
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
