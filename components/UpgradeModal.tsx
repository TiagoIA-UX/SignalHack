"use client";

import { Button, Card } from "@/components/ui";
import { SignalHackAvatar } from "@/components/SignalHackAvatar";

export type UpgradeModalVariant = "strategist_locked" | "strategist_limit";

export function UpgradeModal(props: {
  open: boolean;
  onClose: () => void;
  variant: UpgradeModalVariant;
  strategistUsed?: number;
  strategistLimit?: number;
}) {
  if (!props.open) return null;

  const used = props.strategistUsed ?? 0;
  const limit = props.strategistLimit ?? 0;
  const usedLabel = limit > 0 ? `${used}/${limit}` : `${used}`;

  const title =
    props.variant === "strategist_limit" ? "Limite diário do Strategist" : "Desbloquear Strategist";

  const body =
    props.variant === "strategist_limit"
      ? `Você usou ${usedLabel} insights estratégicos hoje. No Elite, o Strategist é ilimitado.`
      : "Este insight é gerado pelo Strategist Agent. No Pro, você desbloqueia contexto estratégico em tempo real (com limite diário).";

  const ctaHref = "/plans";
  const ctaText = props.variant === "strategist_limit" ? "Upgrade para Elite" : "Upgrade para Pro";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70" onClick={props.onClose} />
      <div className="relative w-full max-w-lg">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-400">planos</div>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
            </div>
            <SignalHackAvatar className="h-7 w-7 text-white/60" />
          </div>

          <p className="mt-3 text-sm text-zinc-300">{body}</p>
          <p className="mt-2 text-xs text-zinc-500">IA interpreta, não decide sozinha.</p>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={props.onClose}>
              Agora não
            </Button>
            <Button href={ctaHref}>{ctaText}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
