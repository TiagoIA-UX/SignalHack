"use client";

import React from "react";

export default function MercadoPagoCheckoutButton({ className = "", label = "Comprar com Mercado Pago" }: { className?: string; label?: string }) {
  const [loading, setLoading] = React.useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);
      const res = await fetch("/api/acquire/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "pilot" }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
      } else {
        console.error("Mercado Pago error:", data);
        alert("Erro ao iniciar pagamento. Verifique o console.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Erro ao iniciar pagamento.");
    }
  }

  return (
    <button onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? "Aguardando…" : label}
    </button>
  );
}
