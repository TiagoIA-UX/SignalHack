## SignalHack

SignalHack é uma plataforma de inteligência de sinais com IA para identificar tendências emergentes, atenção e intenção comercial antes do mercado.

"Hackear sinais" aqui significa reduzir ruído, acelerar leitura e transformar dados dispersos em clareza acionável — sem promessas de previsão, garantia ou certeza.

O projeto está em evolução contínua: o MVP já funciona e é expandido incrementalmente.

### Rede de agentes (conceitual)

O SignalHack opera com uma rede de agentes especializados (conceitual). O Strategist usa IA real via Groq quando configurada.

- Scout Agent: detecta sinais emergentes e crescimento inicial
- Decoder Agent: decodifica intenção e contexto
- Noise Killer Agent: filtra hype e picos artificiais
- Strategist Agent: sugere estratégia e prioridade (decisão final humana)

## Deploy (Vercel + Postgres)

Pré-requisitos:
- Um banco PostgreSQL (Neon/Supabase/Railway/etc.) e a `DATABASE_URL`.

### 1) Variáveis de ambiente (Vercel)

Use o arquivo de referência: [.env.production.example](.env.production.example)

Configure em **Project → Settings → Environment Variables**:
- `DATABASE_URL`
- `AUTH_SECRET` (>= 32 chars)
- (opcional) `AUTH_TOKEN_PEPPER` (>= 16 chars)
- `APP_URL` (ex.: `https://seu-projeto.vercel.app`)
- (opcional) `GROQ_API_KEY`
- (opcional) `GROQ_MODEL` (sobrescreve o modelo padrão)

Rate limit distribuído (recomendado em produção/serverless):
- (opcional) `UPSTASH_REDIS_REST_URL`
- (opcional) `UPSTASH_REDIS_REST_TOKEN`

Mercado Pago (planos recorrentes):
- `MERCADOPAGO_ACCESS_TOKEN` (ou configure via **/admin/settings**, armazenado no banco)
- (opcional) `BILLING_WEBHOOK_TOKEN` (protege o endpoint de webhook via query token)

Dica (gerar secrets localmente):
- `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`

### 2) Migrações do Prisma (produção)

Depois de criar o banco e setar `DATABASE_URL`, rode:
- `npx prisma migrate deploy`

### 3) Build

O projeto roda `prisma generate` no `postinstall` e faz `next build` normalmente na Vercel.

## Dev

- `npm run dev`

## Operação (Guardian)

Para automação de manutenção/health/backups em servidor Linux, use:
- [scripts/guardian.sh](scripts/guardian.sh)
- [scripts/guardian.env.example](scripts/guardian.env.example)

O Guardian foi desenhado para evoluir junto do projeto: cada check (health/db/backup/tls) é uma função isolada, fácil de estender sem quebrar o fluxo.
