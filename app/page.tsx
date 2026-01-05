import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <section className="py-16">
          <Container>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">poder silencioso • vantagem informacional</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight">SignalHack</h1>
                <p className="mt-4 text-zinc-300">
                  Hackeie os sinais antes do mercado.
                </p>
                <div className="mt-8 flex gap-3">
                  <Button href="/register">Começar grátis</Button>
                  <Button href="/plans" variant="ghost">
                    Ver planos
                  </Button>
                </div>
              </div>
              <Card className="p-6">
                <div className="text-sm text-zinc-300">O que você recebe no MVP</div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• Sinais ordenados por score (0–100)</li>
                  <li>• Badge de intenção (baixa/média/alta)</li>
                  <li>• Resumo estratégico + insight acionável (IA)</li>
                  <li>• Limites por plano + CTA de upgrade</li>
                </ul>
              </Card>
            </div>
          </Container>
        </section>
      </main>
    </div>
  );
}
