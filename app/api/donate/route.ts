import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { z } from "zod";

const bodySchema = z.object({
  amount: z.number().min(1).max(10000), // R$ 1 to R$ 10.000
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { amount } = parsed.data;

  // Configure Mercado Pago
  const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
  const preference = new Preference(client);

  try {
    const preferenceData = {
      items: [
        {
          id: "donation",
          title: "Doação - Apoio ao Projeto ZAIRIX",
          quantity: 1,
          currency_id: "BRL",
          unit_price: amount,
        },
      ],
      back_urls: {
        success: `${process.env.APP_URL}/support?status=success`,
        failure: `${process.env.APP_URL}/support?status=failure`,
        pending: `${process.env.APP_URL}/support?status=pending`,
      },
      auto_return: "approved",
      external_reference: `donation-${Date.now()}`,
    };

    const response = await preference.create({ body: preferenceData });

    return NextResponse.json({
      checkout_url: response.init_point,
      preference_id: response.id,
    });
  } catch (error) {
    console.error("Mercado Pago error:", error);
    return NextResponse.json({ error: "payment_error" }, { status: 500 });
  }
}
