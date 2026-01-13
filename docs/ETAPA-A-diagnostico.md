# SignalHack — ETAPA A (Diagnóstico)

Data: 2026-01-05

## O que já está pronto (MVP funcional)

- **Auth (magic link) + sessão**
  - Fluxo `POST /api/auth/request` → `GET /api/auth/verify` → cookie JWT `em_session`.
  - Persistência de `AuthToken` + `Session` no Postgres (Prisma).
  - Proteção por middleware de áreas internas: `/dashboard`, `/profile`, `/plans`, `/admin`.
- **Controle de acesso (ADMIN)**
  - Rotas `/admin/*` protegidas no middleware.
  - Bootstrap por `ADMIN_EMAIL` no login inicial (promoção para `role=ADMIN`).
- **Signals (core de feed) com limites Free**
  - `GET /api/signals` aplica limite diário do Free (3/dia) via `UsageDay`.
  - Delay de 24h (Free) via `delayUntil`.
  - Logging best-effort em `AccessLog`.
- **Estratégia (geração de insight)**
  - `POST /api/insights` gera insight via Groq (IA real, quando configurada) e faz cache por `signalId`.
  - Bloqueio de plano no backend para Free (`upgrade_required`, 402).
  - Logging best-effort em `AccessLog`.
- **Admin-only settings (secrets)**
  - `AppSecret` no DB com criptografia AES-256-GCM derivada de `AUTH_SECRET`.
  - UI/rota admin salva Groq/SMTP/Mercado Pago sem expor valores.

## Parcial / Inconsistente (funciona, mas não é “comercial de elite” ainda)

- **Limite de Estratégia (Pro) está só no client**
  - UI usa `localStorage` (limite local no client) para bloquear após 5/dia.
  - Backend hoje só bloqueia Free; Pro pode gerar ilimitado via API.
  - Isso é o principal risco de monetização/gating (bypass simples).
- **Estado do plano na sessão vs estado real do usuário**
  - `GET /api/auth/me` retorna `plan`/`role` do JWT (claims), não do DB.
  - Após upgrade real, UI pode continuar mostrando plano antigo até novo login.
- **Billing é stub (sem cobrança recorrente)**
  - `GET /api/billing` retorna `status: stub`.
  - Página `/plans` assume “em breve”; não existe fluxo de upgrade funcional.
- **Rate limit in-memory (serverless frágil)**
  - `lib/rateLimit.ts` usa `Map` em memória.
  - Em Vercel (serverless), isso reinicia e não é consistente entre instâncias.
  - OK para MVP de validação, mas não é enforcement real.

## Ausente (para MVP comercial de elite)

- **Cobrança recorrente (modo test ok)**
  - Criar fluxo de checkout/assinatura e retorno.
  - Atualizar plano do usuário no DB de forma confiável.
- **Enforcement de limites no backend para Estratégia (Pro)**
  - Persistir uso diário de insights no DB e aplicar limite no `POST /api/insights`.
- **Tratamento de erro “digno” no momento de Estratégia**
  - Se Groq falhar/timeout, retornar erro consistente (sem stack/sem ruído) e log mínimo.

## Riscos reais (não teóricos)

1) **Bypass de monetização**: Pro-limit só no client → qualquer usuário pode chamar `POST /api/insights` ilimitado.
2) **UX inconsistente pós-upgrade**: sessão JWT não reflete mudança de plano até novo login.
3) **Billing inexistente**: não há forma de cobrar/validar planos em produção.
4) **Rate limit frágil**: pode permitir abuso em produção (não é bloqueio durável).

## Dívidas técnicas conscientes (aceitáveis no MVP, documentadas)

- Rate limit em memória (trocar depois por Upstash Redis/kv).
- Seed de sinais “hardcoded” no primeiro acesso (ok para onboarding do MVP).
- Ausência de trilha completa de billing events (pode ser adicionada após validar demanda).

## Próxima consolidação (ETAPA B)

- Aplicar **limite de Estratégia no backend** para Pro (persistente por dia).
- Ajustar `GET /api/auth/me` para refletir plano/role do DB (mesmo payload).
- Garantir que erros no `POST /api/insights` sejam tratados com output minimalista.
