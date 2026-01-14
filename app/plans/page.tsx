import { AppHeader } from "@/components/AppHeader";
import { Badge, Button, Card, Container } from "@/components/ui";
import { PlanUpgradeButton } from "@/components/PlanUpgradeButton";

export default function PlansPage() {
  return (
    <div className="min-h-screen">
      <AppHeader authed />
      <main className="py-16">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h1 className="h1">Planos</h1>
            <p className="p mt-3 text-zinc-200">
              <span className="font-bold">Escolha sua cadência:</span> demanda <span className="font-bold">→ potencial → experimento → receita</span>.<br />
              <span className="block mt-2 text-zinc-400">Decida em até 7 dias.</span>
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <Card className="p-8">
                <div className="flex items-center justify-between">
                  <div className="h2 font-semibold">Free</div>
                  <Badge>base</Badge>
                </div>
                <div className="mt-4 h2 font-bold text-emerald-300">R$ 0</div>
                <p className="p mt-2 text-zinc-200">
                  <span className="font-bold">Conheça a Visão Estratégica</span> e o fluxo coordenado.<br />
                  Bom para explorar — não para operar consistência.
                </p>
                <ul className="mt-4 space-y-2 text-base text-zinc-200">
                  <li>• 3 sinais/dia</li>
                  <li>• Delay de 24h</li>
                  <li>• Fontes públicas + Validação (detecção e classificação)</li>
                  <li>• Filtro de ruído bloqueado</li>
                  <li>• Estratégia bloqueada (priorização + plano)</li>
                </ul>
                <div className="mt-6">
                  <Button href="/register" variant="ghost" className="cta">
                    Começar no Free
                  </Button>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-center justify-between">
                  <div className="h2 font-semibold">Pro</div>
                  <Badge>recomendado</Badge>
                </div>
                <div className="mt-4 h2 font-bold text-emerald-300">R$ 29/mês</div>
                <p className="p mt-2 text-zinc-200">
                  <span className="font-bold">Para operar semanalmente:</span> detectar sinais de compra cedo, filtrar ruído e transformar sinal em potencial e experimento.
                </p>
                <ul className="mt-4 space-y-2 text-base text-zinc-200">
                  <li>• Sinais ilimitados</li>
                  <li>• Fontes públicas + Validação + Filtro de ruído</li>
                  <li>• Estratégia (até 5 priorizações/dia)</li>
                  <li>• Brief semanal (1x/semana)</li>
                  <li>• Histórico pesquisável</li>
                  <li>• Playbook por sinal (plano de execução)</li>
                </ul>
                <div className="mt-4 text-xs text-zinc-400">
                  <span className="font-bold">Se você vive de atenção, conversão ou B2B outbound, operar sem playbook vira apostar no escuro.</span>
                </div>
                <div className="mt-6">
                  <PlanUpgradeButton plan="PRO" />
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-center justify-between">
                  <div className="h2 font-semibold">Elite</div>
                  <Badge>preparado</Badge>
                </div>
                <div className="mt-4 h2 font-bold text-emerald-300">R$ 79/mês</div>
                <p className="p mt-2 text-zinc-200">
                  <span className="font-bold">Para operação séria:</span> mais velocidade, mais consistência e menos "achismo" quando a demanda aparece.
                </p>
                <ul className="mt-4 space-y-2 text-base text-zinc-200">
                  <li>• Fluxo completo liberado</li>
                  <li>• Estratégia ilimitada</li>
                  <li>• Alertas antecipados</li>
                  <li>• Brief semanal (1x/semana)</li>
                  <li>• Playbook por sinal (plano de execução)</li>
                  <li>• API futura</li>
                  <li>• Relatórios premium</li>
                </ul>
                <div className="mt-4 text-xs text-zinc-400">
                  <span className="font-bold">Quando o mercado acelera, quem não tem rotina de sinal→tese→experimento fica reagindo. Elite é para operar no controle.</span>
                </div>
                <div className="mt-6">
                  <PlanUpgradeButton plan="ELITE" variant="ghost" />
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
