import type { Plan } from "@/lib/plans";

const KEY_PREFIX = "sh:strategy";

export function getStrategyDailyLimit(plan: Plan): number | null {
  if (plan === "PRO") return 5;
  if (plan === "ELITE") return null;
  return 0;
}

export function getStrategyUsageKey(userId: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `${KEY_PREFIX}:${userId}:${day}`;
}

export function readStrategyUsed(userId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(getStrategyUsageKey(userId));
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function incrementStrategyUsed(userId: string): number {
  const next = readStrategyUsed(userId) + 1;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getStrategyUsageKey(userId), String(next));
    } catch {
      // ignore
    }
  }
  return next;
}
