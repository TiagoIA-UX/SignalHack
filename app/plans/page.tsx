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
            <p className="mt-2 text-sm text-zinc-300">Níveis de acesso. Silencioso. Direto.</p>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Free</div>
                  <Badge>base</Badge>
                </div>
                <div className="mt-4 text-3xl font-semibold">R$ 0</div>
                <p className="mt-2 text-sm text-zinc-300">
                  Para conhecer o radar. Bom para testar o fluxo — não para operar timing.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• 3 sinais/dia</li>
                  <li>• Delay de 24h</li>
                  <li>• Scout + Decoder (detecção e classificação)</li>
                  <li>• Noise Killer bloqueado</li>
                  <li>• Strategist bloqueado (insight acionável)</li>
                </ul>
                <div className="mt-6">
                  <Button href="/register" variant="ghost">
                    Solicitar credencial (Free)
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
                  Para quem executa de verdade: detectar intenção cedo, filtrar ruído e decidir antes do feed.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• Sinais ilimitados</li>
                  <li>• Scout + Decoder + Noise Killer</li>
                  <li>• Strategist (até 5 insights estratégicos/dia)</li>
                  <li>• Brief semanal (1x/semana)</li>
                  <li>• Histórico pesquisável</li>
                  <li>• Playbook por sinal (plano de execução)</li>
                </ul>
                <div className="mt-4 text-xs text-zinc-400">
                  Se você compete por atenção/CPM, operar sem leitura de intenção e sem playbook vira apostar no escuro.
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
                  Para operação séria: mais velocidade, mais consistência e menos &quot;achismo&quot; quando o sinal vira oportunidade.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• Acesso total à rede de agentes</li>
                  <li>• Strategist ilimitado</li>
                  <li>• Alertas antecipados</li>
                  <li>• Brief semanal (1x/semana)</li>
                  <li>• Playbook por sinal (plano de execução)</li>
                  <li>• API futura</li>
                  <li>• Relatórios premium</li>
                </ul>
                <div className="mt-4 text-xs text-zinc-400">
                  Quando o mercado acelera, quem não tem rotina de sinal→decisão fica reagindo. Elite é para não ficar de fora do jogo.
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
