import { AppHeader } from "@/components/AppHeader";
import { Card, Container } from "@/components/ui";

export default function PrivacyPage() {
  const controllerName = process.env.LEGAL_CONTROLLER_NAME ?? "ZAIRIX";
  const contactEmail = process.env.LEGAL_CONTACT_EMAIL ?? process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">política de privacidade</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Política de Privacidade</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  Este software foi projetado para funcionar em modo <strong>FULL</strong>: sem login, sem cadastro e sem identificação de usuário.
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
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">o que é armazenado</div>
                  <ul className="space-y-2">
                    <li>• Dados do app (sinais e playbooks) ficam no seu navegador via LocalStorage.</li>
                    <li>• O app pode usar cache do navegador para funcionamento offline (quando possível).</li>
                    <li>• Não há “conta”, “plano”, “sessão” ou “perfil” dentro do software.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">finalidade</div>
                  <p>Permitir que você use o sistema imediatamente e volte depois sem perder seu rascunho.</p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">como apagar</div>
                  <p>
                    Você pode apagar tudo a qualquer momento pelo botão <strong>“Limpar tudo”</strong> dentro do app, ou limpando
                    dados do site no seu navegador.
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

