import { AppHeader } from "@/components/AppHeader";
import { Card, Container } from "@/components/ui";

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl">
            <Card className="p-6">
              <h1 className="text-xl font-semibold tracking-tight">Admin</h1>
              <p className="mt-2 text-sm text-zinc-300">Área reservada (exemplo). Controle via middleware (role=ADMIN).</p>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
