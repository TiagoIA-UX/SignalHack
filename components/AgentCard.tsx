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

      {/* Example downloads */}
      <div className="mt-4 flex flex-wrap gap-2">
        {agent.name === "Buscador" ? (
          <a href="/examples/buscador-sample.csv" className="text-sm text-emerald-300 hover:underline">Baixar CSV de exemplo</a>
        ) : null}
        {agent.name === "Tradutor" ? (
          <a href="/examples/tradutor-messages.md" className="text-sm text-emerald-300 hover:underline">Baixar mensagens exemplo</a>
        ) : null}
        {agent.name === "Filtro" ? (
          <a href="/examples/filtro-report.md" className="text-sm text-emerald-300 hover:underline">Baixar relatório exemplo</a>
        ) : null}
        {agent.name === "Planejador" ? (
          <a href="/examples/planejador-playbook.md" className="text-sm text-emerald-300 hover:underline">Baixar playbook exemplo</a>
        ) : null}
      </div>
    </Card>
  );
}
