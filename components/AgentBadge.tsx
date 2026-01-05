import { Badge } from "@/components/ui";
import type { AgentId } from "@/lib/agents";
import { getAgent } from "@/lib/agents";

export function AgentBadge(props: { id: AgentId; locked?: boolean; rightLabel?: string }) {
  const agent = getAgent(props.id);
  if (props.locked) {
    return (
      <Badge className="border-white/10 bg-transparent text-zinc-500">
        {agent.name}{props.rightLabel ? ` • ${props.rightLabel}` : ""}
      </Badge>
    );
  }

  return <Badge>{agent.name}{props.rightLabel ? ` • ${props.rightLabel}` : ""}</Badge>;
}
