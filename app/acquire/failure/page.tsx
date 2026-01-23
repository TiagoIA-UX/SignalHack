import { Container } from "@/components/ui";
import { AppHeader } from "@/components/AppHeader";

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-black">
      <AppHeader />
      <main className="pt-24 pb-10">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-2xl font-semibold text-zinc-100">Pagamento não concluído</h1>
            <p className="mt-3 text-zinc-300">O pagamento não foi concluído. Se precisar de ajuda, entre em contato com suporte.</p>
          </div>
        </Container>
      </main>
    </div>
  );
}
