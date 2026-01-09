"use client";

import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function ForgotPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Recuperar senha</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Recuperação de senha está desativada neste MVP (sem SMTP/email). Guarde sua senha com segurança.
              </p>

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
