# Integração Mercado Pago — Pilot (7 dias)

Instruções rápidas para habilitar e testar o checkout do Pilot via Mercado Pago.

1) Variáveis de ambiente
- Defina em `.env` (ou secret manager):
  - `MERCADOPAGO_ACCESS_TOKEN` — token de produção/credenciais.
  - `APP_URL` — URL pública do app (ex.: `https://your-site.com`) para `back_urls`.

2) Como funciona (fluxo)
- Usuário clica em "Comprar com Mercado Pago" na página `/acquire`.
- App cria uma `preference` via API (`POST /api/acquire/checkout`) e recebe `init_point`.
- Usuário é redirecionado para `init_point` para finalizar o pagamento.
- Mercado Pago chama o `back_urls` configurado (success/failure/pending) e também pode enviar notificações para `notification_url` (se configurado).

3) Testando localmente
- Para testar em `localhost` use `APP_URL=http://localhost:3000` e `MERCADOPAGO_ACCESS_TOKEN` (pode ser sandbox). Rode `npm run dev` e clique no botão.
- Se preferir, crie um preferêncial no painel do Mercado Pago e valide `init_point` manualmente.

4) Webhooks e segurança
- Configure `notification_url` (ex.: `https://your-site.com/api/billing/webhook`) no body de preferência ou no painel do Mercado Pago.
- Valide as notificações consultando a API de pagamentos e evitando confiar somente no webhook.

5) Ponto de atenção
- Ao ir para produção, use tokens de produção (não os de sandbox).
- Rotacione as chaves se estiverem expostas.

Se quiser, adiciono suporte para `notification_url` e criação automática de clientes/assinaturas (cobrança recorrente) — diga se prefere cobrança única (checkout) ou assinatura (subscriptions).