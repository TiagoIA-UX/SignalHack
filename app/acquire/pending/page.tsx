import { Container } from "@/components/ui";
import { AppHeader } from "@/components/AppHeader";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-black">
      <AppHeader />
      <main className="pt-24 pb-10">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-semibold text-emerald-100">Pagamento pendente</h1>
            <p className="mt-3 text-zinc-300">Seu pagamento está pendente. Assim que for confirmado, entraremos em contato.</p>
          </div>
        </Container>
      </main>
    </div>
  );
}
