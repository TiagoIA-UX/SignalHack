import React from "react";
import { Card, Button } from "@/components/ui";

export default function NicheCard({ niche }: { niche: any }) {
  return (
    <Card className="p-6">
      <div className="text-sm font-semibold text-emerald-100">{niche.title}</div>
      <div className="mt-2 text-sm text-zinc-300">{niche.needs}</div>

      <div className="mt-4 space-y-2 text-sm">
        {niche.features.map((f: any) => (
          <div key={f.name} className="flex items-start justify-between">
            <div>
              <div className="font-medium text-zinc-100">{f.name}</div>
              <div className="text-zinc-400">{f.desc}</div>
            </div>
            <div>
              <Button as="a" href={f.href ?? "/app"} className="ml-4">Usar agora</Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-zinc-500">Agentes úteis: {niche.agents.join(", ")}</div>
    </Card>
  );
}
