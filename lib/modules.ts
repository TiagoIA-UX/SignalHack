export type ModuleId = "atlas" | "nexus" | "pulse" | "artisan" | "optima";

export type ModuleDefinition = {
  id: ModuleId;
  name: string;
  oneLiner: string;
  microcopy: string;
};

export const MODULES: ModuleDefinition[] = [
  {
    id: "atlas",
    name: "Fontes públicas",
    oneLiner: "Encontra sinais em fontes abertas.",
    microcopy: "Encontrado em fontes públicas",
  },
  {
    id: "nexus",
    name: "Validação",
    oneLiner: "Interpreta intenção e contexto.",
    microcopy: "Intenção e contexto interpretados",
  },
  {
    id: "pulse",
    name: "Ruído removido",
    oneLiner: "Reduz hype e picos artificiais.",
    microcopy: "Ruído removido",
  },
  {
    id: "artisan",
    name: "Estratégia",
    oneLiner: "Converte sinal em tese e execução.",
    microcopy: "Plano sugerido",
  },
  {
    id: "optima",
    name: "Otimização",
    oneLiner: "Ajusta execução com métrica e iteração.",
    microcopy: "Otimização sugerida",
  },
];

export function getModule(id: ModuleId): ModuleDefinition {
  const found = MODULES.find((m) => m.id === id);
  if (!found) throw new Error("Unknown module");
  return found;
}
