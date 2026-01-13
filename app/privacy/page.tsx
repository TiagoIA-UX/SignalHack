import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Card, Container } from "@/components/ui";
import { LEGAL_VERSION } from "@/lib/consent";

export default function PrivacyPage() {
  const controllerName = process.env.LEGAL_CONTROLLER_NAME ?? "ZAIRIX";
  const contactEmail = process.env.LEGAL_CONTACT_EMAIL ?? process.env.SMTP_FROM ?? null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">política de privacidade • v{LEGAL_VERSION}</div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Política de Privacidade</h1>

            <Card className="mt-6 p-6">
              <div className="space-y-4 text-sm text-zinc-200">
                <p>
                  Esta Política explica como {controllerName} ("Controlador") trata dados pessoais no SignalForge ("Serviço").
                  Ao usar o Serviço, você concorda com os termos aqui descritos.
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
                    <div>
                      <span className="text-zinc-100">Versão</span>: v{LEGAL_VERSION}.
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">dados que tratamos</div>
                  <ul className="space-y-2">
                    <li>• Dados de conta: email, nome (se fornecido), plano e papel (USER/ADMIN).</li>
                    <li>• Segurança e sessão: identificadores de sessão, datas de expiração/revogação.</li>
                    <li>• Logs de acesso e abuso: rota, método, status, IP e identificador do navegador (quando disponível).</li>
                    <li>• Operação do produto: sinais salvos, insights gerados, briefs e playbooks criados na conta.</li>
                    <li>• Cobrança: eventos de assinatura e referências de cobrança (quando você inicia checkout).</li>
                    <li>• Consentimento: suas preferências de cookies e versão legal aceita.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">finalidades e bases legais</div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-zinc-100">Autenticação e entrega do serviço</span> — base legal: execução de
                        contrato / procedimentos preliminares.
                      </div>
                      <div>
                        <span className="text-zinc-100">Segurança, prevenção a fraude e abuso</span> — base legal: legítimo
                        interesse e/ou cumprimento de obrigação legal.
                      </div>
                      <div>
                        <span className="text-zinc-100">Métricas de uso</span> (opcional) — base legal: consentimento.
                      </div>
                      <div>
                        <span className="text-zinc-100">Personalização</span> (opcional) — base legal: consentimento.
                      </div>
                      <div>
                        <span className="text-zinc-100">Billing</span> — base legal: execução de contrato.
                      </div>
                      <div>
                        <span className="text-zinc-100">Suporte e comunicação operacional</span> — base legal: execução de
                        contrato e legítimo interesse.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">subprocessadores (terceiros)</div>
                  <p>
                    O Serviço pode compartilhar dados mínimos com subprocessadores estritamente para operar infraestrutura,
                    envio de emails, cobrança e IA. Subprocessadores típicos desta stack:
                  </p>
                  <ul className="space-y-2">
                    <li>• Groq — processamento de IA (quando configurado).</li>
                    <li>• Provedor de email (SMTP) — envio de emails operacionais (ex.: SendGrid, quando configurado).</li>
                    <li>• MercadoPago — cobrança recorrente e eventos de assinatura.</li>
                    <li>• Vercel — hospedagem e execução do app.</li>
                    <li>• PostgreSQL (ex.: Neon) — armazenamento do banco de dados do Serviço.</li>
                    <li>• Upstash (quando configurado) — rate limit distribuído via Redis/REST.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">retenção</div>
                  <ul className="space-y-2">
                    <li>• Dados de conta: enquanto a conta estiver ativa ou conforme exigência legal/contratual.</li>
                    <li>• Logs de acesso/segurança: retenção mínima operacional para investigação de abuso e auditoria.</li>
                    <li>• Consentimentos e aceite legal: mantidos para prova/auditoria e defesa contratual.</li>
                    <li>• Dados de billing: conforme requisitos do provedor de pagamento e obrigações legais aplicáveis.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">direitos do titular</div>
                  <p>
                    Você pode solicitar confirmação de tratamento, acesso, correção, portabilidade, anonimização/eliminação,
                    informação sobre compartilhamento, revogação de consentimento e oposição, conforme LGPD/GDPR e limitações
                    legais aplicáveis.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">transferências internacionais</div>
                  <p>
                    Dependendo dos subprocessadores configurados, dados podem ser processados fora do Brasil/EEE. Nesses casos,
                    usamos mecanismos contratuais e medidas de segurança para proteger dados pessoais.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">segurança</div>
                  <p>
                    Aplicamos controles de segurança compatíveis com um SaaS B2B (segredos em variáveis de ambiente, cookies de
                    sessão, rate limit, logs mínimos e segregação por conta). Ainda assim, nenhum sistema é infalível.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">como gerenciar consentimento</div>
                  <p>
                    Você pode ajustar ou revogar consentimento de cookies não essenciais a qualquer momento em
                    <Link className="text-emerald-200 hover:underline" href="/profile/privacy">
                      {" "}Privacidade &amp; Consentimento
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-zinc-200">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">sustentabilidade e apoio</div>
                  <p className="mt-2">
                    Este projeto é mantido de forma independente; aceita apoio financeiro voluntário para custos de
                    infraestrutura, domínio e hospedagem. Alguns links podem ser afiliados; consulte `MONETIZATION.md` para a
                    política completa. Não coletamos dados adicionais nem rastreamos cliques sem seu consentimento; o uso do
                    serviço não depende de contribuição financeira.
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
