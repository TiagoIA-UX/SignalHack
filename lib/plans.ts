export type Plan = "FREE" | "PRO" | "ELITE";

export function getPlanLimits(plan: Plan) {
  if (plan === "FREE") {
    return {
      signalsPerDay: 3,
      delayHours: 24,
      deepInsights: false,
      history: false,
    };
  }

  if (plan === "PRO") {
    return {
      signalsPerDay: null as number | null,
      delayHours: 0,
      deepInsights: true,
      history: true,
    };
  }

  return {
    signalsPerDay: null as number | null,
    delayHours: 0,
    deepInsights: true,
    history: true,
    earlyAlerts: true,
    community: true,
    futureApi: true,
  };
}
