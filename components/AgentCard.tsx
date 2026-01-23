import React from "react";
import { Card } from "@/components/ui";

export default function AgentCard({ agent }: { agent: any }) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-emerald-100">{agent.name}</div>
      <div className="mt-2 text-sm text-zinc-300">{agent.what}</div>
      <div className="mt-3 text-xs text-zinc-500">Quando usar: {agent.when}</div>
    </Card>
  );
}
