"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";

type MeResponse =
  | { user: null }
  | { user: { id: string; email: string; plan: "FREE" | "PRO" | "ELITE"; role: "USER" | "ADMIN" } };

function planRank(plan: "FREE" | "PRO" | "ELITE") {
  if (plan === "ELITE") return 3;
  if (plan === "PRO") return 2;
  return 1;
}

export function PlanUpgradeButton(props: { plan: "PRO" | "ELITE"; variant?: "primary" | "ghost" }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setMe(j))
      .catch(() => setMe({ user: null }));
  }, []);

  const currentPlan = me && "user" in me && me.user ? me.user.plan : null;

  const disabled = useMemo(() => {
    if (!currentPlan) return true;
    return planRank(currentPlan) >= planRank(props.plan);
  }, [currentPlan, props.plan]);

    const label = useMemo(() => {
      if (!currentPlan) return "Liberar acesso";
      if (disabled) return "Ativo";
      return props.plan === "ELITE" ? "Quero Elite" : "Quero Pro";
    }, [currentPlan, disabled, props.plan]);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: props.plan }),
      });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        setError("Indisponível.");
        return;
      }
      const initPoint = (json as { initPoint?: string }).initPoint;
      if (!initPoint) {
        setError("Indisponível.");
        return;
      }
      window.location.href = initPoint;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
        <Button
          type="button"
          disabled={disabled || loading}
          onClick={startCheckout}
          variant={props.variant}
        >
          {loading ? "Carregando..." : label}
        </Button>
      {error ? <div className="text-xs text-zinc-500">{error}</div> : null}
    </div>
  );
}
