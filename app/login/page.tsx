"use client";

import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-lg">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Entrar</h1>
              <p className="mt-2 text-sm text-zinc-300">Login desativado. Acesse direto o app.</p>
              <div className="mt-6">
                <Button href="/dashboard">Abrir sistema</Button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
