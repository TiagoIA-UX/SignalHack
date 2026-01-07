type MpPreapprovalCreateResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
  status?: string;
};

type MpPreapproval = {
  id: string;
  status?: string;
  payer_email?: string;
  external_reference?: string;
  back_url?: string;
  reason?: string;
};

async function mpFetch<T>(path: string, opts: { accessToken: string; method?: string; body?: unknown }) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    method: opts.method ?? "GET",
    headers: {
      authorization: `Bearer ${opts.accessToken}`,
      "content-type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    throw new Error("mercadopago_request_failed");
  }

  return json as T;
}

export async function createPreapproval(params: {
  accessToken: string;
  reason: string;
  payerEmail: string;
  backUrl: string;
  notificationUrl?: string;
  externalReference: string;
  amount: number;
  currencyId: string;
}) {
  const body = {
    reason: params.reason,
    payer_email: params.payerEmail,
    back_url: params.backUrl,
    external_reference: params.externalReference,
    status: "pending",
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      transaction_amount: params.amount,
      currency_id: params.currencyId,
    },
    ...(params.notificationUrl ? { notification_url: params.notificationUrl } : {}),
  };

  return mpFetch<MpPreapprovalCreateResponse>("/preapproval", {
    accessToken: params.accessToken,
    method: "POST",
    body,
  });
}

export async function getPreapproval(params: { accessToken: string; id: string }) {
  return mpFetch<MpPreapproval>(`/preapproval/${encodeURIComponent(params.id)}`, {
    accessToken: params.accessToken,
  });
}
