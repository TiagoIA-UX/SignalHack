export type AgentId = "scout" | "decoder" | "noise_killer" | "strategist";

export type AgentDefinition = {
  id: AgentId;
  name: string;
  oneLiner: string;
  microcopy: string;
};

export const AGENTS: AgentDefinition[] = [
  {
    id: "scout",
    name: "Scout Agent",
    oneLiner: "Detecta sinais emergentes.",
    microcopy: "Detectado pelo Scout Agent",
  },
  {
    id: "decoder",
    name: "Decoder Agent",
    oneLiner: "Decodifica intenção e contexto.",
    microcopy: "Decodificado pelo Decoder Agent",
  },
  {
    id: "noise_killer",
    name: "Noise Killer Agent",
    oneLiner: "Filtra hype e picos artificiais.",
    microcopy: "Filtrado pelo Noise Killer Agent",
  },
  {
    id: "strategist",
    name: "Strategist Agent",
    oneLiner: "Converte sinal em ação.",
    microcopy: "Estratégia sugerida pelo Strategist Agent",
  },
];

export function getAgent(id: AgentId): AgentDefinition {
  const found = AGENTS.find((a) => a.id === id);
  if (!found) throw new Error("Unknown agent");
  return found;
}
