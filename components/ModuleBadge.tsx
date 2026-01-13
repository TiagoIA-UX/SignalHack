import { Badge } from "@/components/ui";
import type { ModuleId } from "@/lib/modules";
import { getModule } from "@/lib/modules";

export function ModuleBadge(props: { id: ModuleId; locked?: boolean; rightLabel?: string }) {
  const m = getModule(props.id);
  if (props.locked) {
    return (
      <Badge className="border-white/10 bg-transparent text-zinc-500">
        {m.name}{props.rightLabel ? ` • ${props.rightLabel}` : ""}
      </Badge>
    );
  }

  return <Badge>{m.name}{props.rightLabel ? ` • ${props.rightLabel}` : ""}</Badge>;
}
