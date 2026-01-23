import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ error: "MERCADOPAGO_ACCESS_TOKEN missing" }, { status: 500 });

    const body = await request.json().catch(() => ({}));
    const unit_price = 2500; // R$ 2.500 - expressed in BRL units

    const prefBody = {
      items: [
        {
          title: "Pilot — Validação de demanda (7 dias)",
          quantity: 1,
          currency_id: "BRL",
          unit_price,
        },
      ],
      back_urls: {
        success: `${process.env.APP_URL || "http://localhost:3000"}/acquire/success`,
        failure: `${process.env.APP_URL || "http://localhost:3000"}/acquire/failure`,
        pending: `${process.env.APP_URL || "http://localhost:3000"}/acquire/pending`,
      },
      auto_return: "approved",
      external_reference: "pilot_7d",
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(prefBody),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: res.status });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
