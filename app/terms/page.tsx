import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Card, Container } from "@/components/ui";
import { LEGAL_VERSION } from "@/lib/consent";

export default function TermsPage() {
  const controllerName = process.env.LEGAL_CONTROLLER_NAME ?? "SignalForge";
  const contactEmail = process.env.LEGAL_CONTACT_EMAIL ?? process.env.SMTP_FROM ?? null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">termos de uso • v{LEGAL_VERSION}</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Termos de Uso</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  Estes Termos regulam o uso do SignalForge (&quot;Serviço&quot;). Ao acessar ou usar o Serviço, você confirma que leu e
                  aceita estes Termos e a Política de Privacidade.
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
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">finalidade do serviço</div>
                  <p>
                    O Serviço organiza sinais públicos e ajuda a criar hipóteses e planos operacionais. O Serviço não substitui
                    decisão humana e não fornece consultoria jurídica, contábil, financeira ou de investimentos.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">uso aceitável</div>
                  <p>
                    Você concorda em não usar o Serviço para: (a) violar leis (incluindo LGPD/GDPR), (b) coletar/usar dados de
                    terceiros sem base legal, (c) tentar explorar vulnerabilidades, (d) realizar scraping proibido ou abuso de
                    infraestrutura, (e) infringir direitos autorais, marcas ou segredos comerciais.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">contas e autenticação</div>
                  <p>
                    Você é responsável pela confidencialidade de credenciais e por toda atividade realizada em sua conta.
                    Suspenderemos ou bloquearemos acessos em caso de suspeita de abuso, fraude, ataques ou violação destes Termos.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">propriedade intelectual</div>
                  <p>
                    O Serviço (software, interface, marca, modelos, prompts, fluxos e documentação) é protegido por leis de
                    propriedade intelectual. Você recebe uma licença limitada, não exclusiva e revogável para usar o Serviço
                    conforme estes Termos.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">disponibilidade e alterações</div>
                  <p>
                    Podemos atualizar o Serviço (incluindo UI, módulos e integrações) para melhorar segurança, desempenho e
                    conformidade. A disponibilidade pode variar por manutenção, incidentes, limitações de provedores e eventos
                    fora do nosso controle.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">limitação de responsabilidade</div>
                  <p>
                    O Serviço é fornecido &quot;como está&quot;. Na extensão máxima permitida por lei, não nos responsabilizamos por
                    decisões de negócio tomadas com base em sinais, hipóteses ou planos gerados, nem por perdas indiretas,
                    incidentais ou consequenciais.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">subprocessadores (visão contratual)</div>
                  <p>
                    Para operar o Serviço, podemos usar subprocessadores e infraestrutura de terceiros (detalhados na Política de
                    Privacidade e Política de Cookies), incluindo provedores de IA, email, cobrança, hospedagem e banco de dados.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">versão e reaceite</div>
                  <p>
                    Estes Termos são versionados. Mudanças relevantes podem exigir novo aceite antes de continuar usando áreas
                    protegidas do Serviço.
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
