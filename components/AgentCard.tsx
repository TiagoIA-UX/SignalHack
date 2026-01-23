import React from "react";
import { Card } from "@/components/ui";

export default function AgentCard({ agent }: { agent: any }) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-emerald-100">{agent.name}</div>
      <div className="mt-2 text-sm text-zinc-300">{agent.what}</div>
      <div className="mt-3 text-xs text-zinc-500">Quando usar: {agent.when}</div>

      {agent.deliverables?.length ? (
        <div className="mt-3">
          <div className="text-xs font-semibold text-zinc-300">Entregáveis</div>
          <ul className="mt-1 text-sm text-zinc-400 list-disc pl-5 space-y-1">
            {agent.deliverables.map((d: any) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
