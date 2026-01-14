import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button, Card, Container } from "@/components/ui";
import { LEGAL_VERSION, WELCOME_COOKIE_NAME, hasValidWelcomeAcceptance } from "@/lib/consent";
import { acceptWelcome } from "./actions";

function safeNextPath(next?: string | null) {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  return next;
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next ?? null);

  const jar = await cookies();
  const accepted = hasValidWelcomeAcceptance(jar.get(WELCOME_COOKIE_NAME)?.value);
  if (accepted) redirect(next);

  const hasError = sp.error === "missing";

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">signalforge • acesso corporativo</div>
              <h1 className="h1 mt-3">Bem-vindo ao sistema</h1>
              <p className="p mt-3 text-zinc-200">
                <span className="font-bold">Antes de operar, você aceita um contrato simples:</span><br />
                <span className="font-bold text-emerald-300">Privacidade</span>, <span className="font-bold text-emerald-300">responsabilidade</span> e <span className="font-bold text-emerald-300">cookies com consentimento</span>.<br />
                <span className="block mt-2 text-zinc-400">Tudo transparente, sem pegadinhas.</span>
              </p>
            </div>

            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">confiança</div>
                  <div className="mt-2 text-sm text-zinc-200">Sem “site”. Um sistema fechado, com regras claras.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">compliance</div>
                  <div className="mt-2 text-sm text-zinc-200">LGPD + GDPR por padrão (consentimento e transparência).</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">operação</div>
                  <div className="mt-2 text-sm text-zinc-200">Entrou → escolhe alvo → escolhe sinal → executa playbook.</div>
                </div>
              </div>
            </Card>

            {hasError ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-black/40 p-4 text-sm text-zinc-200">
                Para continuar, marque os três aceites obrigatórios.
              </div>
            ) : null}

            <form action={acceptWelcome} className="mt-6 space-y-5">
              <input type="hidden" name="next" value={next} />

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">aceite obrigatório</div>
                <div className="mt-3 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                    <input name="acceptTerms" type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-200">
                      Eu li e aceito os{" "}
                      <Link className="text-emerald-200 hover:underline" href="/terms">
                        Termos de Uso
                      </Link>
                      .
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                    <input name="acceptPrivacy" type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-200">
                      Eu li e aceito a{" "}
                      <Link className="text-emerald-200 hover:underline" href="/privacy">
                        Política de Privacidade
                      </Link>
                      .
                    </span>
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                    <input name="acceptEssentialCookies" type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-200">
                      Eu autorizo o uso de cookies essenciais (login e segurança). Veja{" "}
                      <Link className="text-emerald-200 hover:underline" href="/cookies">
                        Política de Cookies
                      </Link>
                      .
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">preferências opcionais</div>
                <div className="mt-3 space-y-3">
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <input name="metrics" type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-200">Permitir cookies de métricas (para melhorar o produto).</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <input name="personalization" type="checkbox" className="mt-1" />
                    <span className="text-sm text-zinc-200">Permitir cookies de personalização (preferências e atalhos).</span>
                  </label>
                </div>
                <div className="mt-3 text-xs text-zinc-500">
                  Sem consentimento, nada de tracking. Essenciais são apenas para autenticação e proteção.
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-500">Versão legal: {LEGAL_VERSION}</div>
                <div className="flex gap-2">
                  <Button href="/" variant="ghost">
                    Voltar
                  </Button>
                  <Button type="submit" variant="primary">
                    Entrar no sistema
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </Container>
      </main>
    </div>
  );
}
