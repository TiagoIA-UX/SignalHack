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
                <div className="mt-4 text-3xl font-semibold">R$ 49</div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• Sinais ilimitados</li>
                  <li>• Scout + Decoder + Noise Killer</li>
                  <li>• Strategist (até 5 insights estratégicos/dia)</li>
                  <li>• Insight acionável no momento da intenção</li>
                  <li>• Histórico</li>
                </ul>
                <div className="mt-6">
                  <PlanUpgradeButton plan="PRO" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Elite</div>
                  <Badge>preparado</Badge>
                </div>
                <div className="mt-4 text-3xl font-semibold">R$ 199</div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-200">
                  <li>• Acesso total à rede de agentes</li>
                  <li>• Strategist ilimitado</li>
                  <li>• Alertas antecipados</li>
                  <li>• Comunidade privada</li>
                  <li>• API futura</li>
                  <li>• Relatórios premium</li>
                </ul>
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
