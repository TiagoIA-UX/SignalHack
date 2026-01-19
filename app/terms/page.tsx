import { AppHeader } from "@/components/AppHeader";
import { Card, Container } from "@/components/ui";

export default function TermsPage() {
  const controllerName = process.env.LEGAL_CONTROLLER_NAME ?? "ZAIRIX";
  const contactEmail = process.env.LEGAL_CONTACT_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">termos de uso</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Termos de Uso</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  Estes Termos regulam o uso do ZAIRIX (o “Serviço”). Ao usar o Serviço, você confirma que leu e aceita estes Termos e a Política de
                  Privacidade.
                </p>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">controlador e contato</div>
                  <div className="mt-3 space-y-2">
                    <div>
                      <span className="text-zinc-100">Controlador</span>: {controllerName}.
                    </div>
                    <div>
                      <span className="text-zinc-100">Canal</span>: {contactEmail ? contactEmail : "contato disponível pelo canal de suporte da sua instância"}.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">uso imediato (sem bloqueio)</div>
                  <p>
                    O Serviço é liberado e não exige login. A monetização, quando existir, ocorre fora do software (suporte/licença/serviços externos) e não
                    bloqueia funcionalidades.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">limitação</div>
                  <p>
                    O Serviço ajuda a organizar sinais e planos de execução. Ele não substitui decisão humana e não fornece consultoria jurídica, contábil,
                    financeira ou de investimentos.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">uso aceitável</div>
                  <p>
                    Você concorda em não usar o Serviço para violar leis, explorar vulnerabilidades, realizar abuso de infraestrutura ou infringir direitos de
                    terceiros.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">responsabilidade</div>
                  <p>
                    O Serviço é fornecido “como está”. Na extensão máxima permitida por lei, não nos responsabilizamos por decisões de negócio tomadas com base
                    no uso do Serviço.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}

