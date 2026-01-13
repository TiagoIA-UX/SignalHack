export type Level = "Iniciante" | "Operador" | "Insider";

export function levelFromPoints(points: number): { level: Level; nextAt: number | null } {
  if (points < 40) return { level: "Iniciante", nextAt: 40 };
  if (points < 120) return { level: "Operador", nextAt: 120 };
  return { level: "Insider", nextAt: null };
}

export function rankLabelFromPoints(points: number): string {
  if (points < 20) return "início";
  if (points < 60) return "consistente";
  if (points < 140) return "preciso";
  return "elite";
}
