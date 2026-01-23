import { Container } from "@/components/ui";
import { AppHeader } from "@/components/AppHeader";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black">
      <AppHeader />
      <main className="pt-24 pb-10">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-semibold text-emerald-100">Pagamento recebido</h1>
            <p className="mt-3 text-zinc-300">Obrigado! Recebemos seu pagamento e em breve entraremos em contato para agendar o kickoff do pilot.</p>
          </div>
        </Container>
      </main>
    </div>
  );
}
