import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
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
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });

  try {
    const preference = {
      items: [
        {
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

    const response = await mercadopago.preferences.create(preference);

    return NextResponse.json({
      checkout_url: response.body.init_point,
      preference_id: response.body.id,
    });
  } catch (error) {
    console.error("Mercado Pago error:", error);
    return NextResponse.json({ error: "payment_error" }, { status: 500 });
  }
}