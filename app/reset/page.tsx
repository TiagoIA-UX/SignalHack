"use client";

import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function ResetPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Redefinir senha</h1>
              <p className="mt-2 text-sm text-zinc-300">
                Recuperação de senha está desativada neste MVP. Volte para o login.
              </p>

              <div className="mt-6">
                <Button href="/login">Ir para login</Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
