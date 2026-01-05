import type { Plan } from "@/lib/plans";

function startOfDayLocal(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getStrategistDailyLimit(plan: Plan): number | null {
  if (plan === "PRO") return 5;
  if (plan === "ELITE") return null;
  return 0;
}

export function getStrategistUsageKey(userId: string) {
  const day = startOfDayLocal(new Date()).toISOString().slice(0, 10);
  return `sh:strategist:${userId}:${day}`;
}

export function readStrategistUsed(userId: string): number {
  try {
    const raw = localStorage.getItem(getStrategistUsageKey(userId));
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function incrementStrategistUsed(userId: string): number {
  const next = readStrategistUsed(userId) + 1;
  try {
    localStorage.setItem(getStrategistUsageKey(userId), String(next));
  } catch {
    // ignore
  }
  return next;
}
