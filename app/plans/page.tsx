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
            <h1 className="text-3xl font-semibold tracking-tight">Planos</h1>
            <p className="mt-2 text-sm text-zinc-300">Escolha sua cadência: demanda → tese → experimento → receita (ou decisão em 7 dias).</p>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Free</div>
                  <Badge>base</Badge>
                </div>
                <div className="mt-4 text-3xl font-semibold">R$ 0</div>
                <p className="mt-2 text-sm text-zinc-300">
                  Para conhecer a Visão Estratégica e o fluxo coordenado. Bom para explorar — não para operar consistência.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• 3 sinais/dia</li>
                  <li>• Delay de 24h</li>
                  <li>• Fontes públicas + Validação (detecção e classificação)</li>
                  <li>• Filtro de ruído bloqueado</li>
                  <li>• Estratégia bloqueada (priorização + plano)</li>
                </ul>
                <div className="mt-6">
                  <Button href="/register" variant="ghost">
                    Começar no Free
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Pro</div>
                  <Badge>recomendado</Badge>
                </div>
                <div className="mt-4 text-3xl font-semibold">R$ 29/mês</div>
                <p className="mt-2 text-sm text-zinc-300">
                  Para operar semanalmente: detectar sinais de compra cedo, filtrar ruído e transformar sinal em tese e experimento.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• Sinais ilimitados</li>
                  <li>• Fontes públicas + Validação + Filtro de ruído</li>
                  <li>• Estratégia (até 5 priorizações/dia)</li>
                  <li>• Brief semanal (1x/semana)</li>
                  <li>• Histórico pesquisável</li>
                  <li>• Playbook por sinal (plano de execução)</li>
                </ul>
                <div className="mt-4 text-xs text-zinc-400">
                  Se você vive de atenção, conversão ou B2B outbound, operar sem playbook vira apostar no escuro.
                </div>
                <div className="mt-6">
                  <PlanUpgradeButton plan="PRO" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Elite</div>
                  <Badge>preparado</Badge>
                </div>
                <div className="mt-4 text-3xl font-semibold">R$ 79/mês</div>
                <p className="mt-2 text-sm text-zinc-300">
                  Para operação séria: mais velocidade, mais consistência e menos &quot;achismo&quot; quando a demanda aparece.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• Fluxo completo liberado</li>
                  <li>• Estratégia ilimitada</li>
                  <li>• Alertas antecipados</li>
                  <li>• Brief semanal (1x/semana)</li>
                  <li>• Playbook por sinal (plano de execução)</li>
                  <li>• API futura</li>
                  <li>• Relatórios premium</li>
                </ul>
                <div className="mt-4 text-xs text-zinc-400">
                  Quando o mercado acelera, quem não tem rotina de sinal→tese→experimento fica reagindo. Elite é para operar no controle.
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
