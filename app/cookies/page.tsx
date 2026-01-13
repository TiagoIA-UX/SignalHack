import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Card, Container } from "@/components/ui";
import { LEGAL_VERSION } from "@/lib/consent";

export default function CookiesPolicyPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">política de cookies • v{LEGAL_VERSION}</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Política de Cookies</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  Usamos cookies para autenticação, segurança e (opcionalmente) métricas/personalização. Cookies não essenciais
                  só são ativados mediante consentimento.
                </p>
                <p>
                  Você pode ajustar ou revogar consentimento a qualquer momento em
                  <Link className="text-emerald-200 hover:underline" href="/profile/privacy">
                    {" "}Privacidade &amp; Consentimento
                  </Link>
                  .
                </p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">categorias</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-100">Essenciais</span> — login, segurança e operação.
                    </div>
                    <div>
                      <span className="text-zinc-100">Métricas</span> — melhoria do produto (opcional).
                    </div>
                    <div>
                      <span className="text-zinc-100">Personalização</span> — preferências e atalhos (opcional).
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">cookies usados</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <div className="text-zinc-100">em_session</div>
                      <div className="text-zinc-400">Categoria: Essencial • Finalidade: autenticação (sessão) • Tipo: HTTP-only</div>
                    </div>
                    <div>
                      <div className="text-zinc-100">sf_welcome_accepted</div>
                      <div className="text-zinc-400">Categoria: Essencial • Finalidade: prova de aceite do gate • Tipo: HTTP-only</div>
                    </div>
                    <div>
                      <div className="text-zinc-100">sf_acceptance_id</div>
                      <div className="text-zinc-400">Categoria: Essencial • Finalidade: correlacionar aceite/consentimento na auditoria • Tipo: HTTP-only</div>
                    </div>
                    <div>
                      <div className="text-zinc-100">sf_cookie_consent</div>
                      <div className="text-zinc-400">Categoria: Preferências • Finalidade: armazenar sua escolha (métricas/personalização)</div>
                    </div>
                    <div>
                      <div className="text-zinc-100">sf_legal_version</div>
                      <div className="text-zinc-400">Categoria: Preferências • Finalidade: versão legal vigente aceita/registrada</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">retenção</div>
                  <p>
                    Por padrão, cookies podem permanecer por até 12 meses (ou até você limpar cookies no navegador). A retenção
                    exata pode variar por configuração e requisitos de segurança.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">subprocessadores</div>
                  <p>
                    Se métricas/personalização forem habilitadas via consentimento, integrações de terceiros podem ser ativadas
                    conforme a stack do Serviço (detalhadas na Política de Privacidade).
                  </p>
                </div>
              </div>

              <div className="mt-6 text-sm text-zinc-300">
                <Link className="text-emerald-200 hover:underline" href="/welcome">
                  Voltar para o aceite
                </Link>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
