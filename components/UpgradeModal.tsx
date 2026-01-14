"use client";

import { Button, Card } from "@/components/ui";
import { ZairixAvatar } from "@/components/ZairixAvatar";

export type UpgradeModalVariant = "strategy_locked" | "strategy_limit";

export function UpgradeModal(props: {
  open: boolean;
  onClose: () => void;
  variant: UpgradeModalVariant;
  strategyUsed?: number;
  strategyLimit?: number;
}) {
  if (!props.open) return null;

  const used = props.strategyUsed ?? 0;
  const limit = props.strategyLimit ?? 0;
  const usedLabel = limit > 0 ? `${used}/${limit}` : `${used}`;

  const title =
    props.variant === "strategy_limit" ? "Limite diário de Estratégia" : "Desbloquear Estratégia";

  const body =
    props.variant === "strategy_limit"
      ? `Uso do dia: ${usedLabel}. No Elite, a Estratégia é ilimitada.`
      : "Acesso restrito. No Pro, você libera contexto estratégico e plano de execução (com limite diário).";

  const ctaHref = "/plans";
  const ctaText = props.variant === "strategy_limit" ? "Upgrade para Elite" : "Upgrade para Pro";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-black/80" onClick={props.onClose} />
      <div className="relative w-full max-w-xl">
        <Card className="p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold mb-2">planos</div>
              <h2 className="h2 mt-1 font-bold text-emerald-100">{title}</h2>
            </div>
            <ZairixAvatar className="h-8 w-8 text-white/70" />
          </div>

          <p className="mt-5 p text-zinc-200 font-medium">
            <span className="font-bold">{body.split('. ')[0]}.</span>
            <br />
            {body.split('. ').slice(1).join('. ')}
          </p>
          <p className="mt-3 text-xs text-zinc-500">Análise automatizada apoia. <span className="font-bold text-emerald-300">Decisão é sua.</span></p>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Button variant="ghost" onClick={props.onClose}>
              Fechar
            </Button>
            <Button href={ctaHref}>{ctaText}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
