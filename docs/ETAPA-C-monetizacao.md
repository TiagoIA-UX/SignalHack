# SignalHack — ETAPA C (Monetização funcional, test)

Data: 2026-01-05

## O que foi implementado

- `POST /api/billing` inicia checkout de assinatura (Mercado Pago Preapproval) e retorna `initPoint`.
- `POST /api/billing/webhook` aplica upgrade no DB ao receber status ativo/autorizado.
- `/plans` dispara checkout direto (sem marketing, sem fluxo paralelo).

## Decisões conscientemente adiadas

- Verificação criptográfica oficial de webhook (assinatura Mercado Pago).
- Downgrade/cancelamento automático.
- Persistência de entidade “Subscription” (auditoria completa e reconciliação).

## Observações

- Token Mercado Pago é lido de `AppSecret` (`mercadopago_access_token`) via Admin Settings.
- `BILLING_WEBHOOK_TOKEN` é opcional e recomendado para proteger o endpoint.
