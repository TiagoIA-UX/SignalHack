## SignalHack

SignalHack é uma plataforma de inteligência de sinais com IA para identificar tendências emergentes, atenção e intenção comercial antes do mercado.

"Hackear sinais" aqui significa reduzir ruído, acelerar leitura e transformar dados dispersos em clareza acionável — sem promessas de previsão, garantia ou certeza.

O projeto está em evolução contínua: o MVP já funciona e é expandido incrementalmente.

### Rede de agentes (conceitual)

O SignalHack opera com uma rede de agentes especializados (mocks e/ou IA real):

- Scout Agent: detecta sinais emergentes e crescimento inicial
- Decoder Agent: decodifica intenção e contexto
- Noise Killer Agent: filtra hype e picos artificiais
- Strategist Agent: sugere estratégia e prioridade (decisão final humana)

## Deploy (Vercel + Postgres)

Pré-requisitos:
- Um banco PostgreSQL (Neon/Supabase/Railway/etc.) e a `DATABASE_URL`.

### 1) Variáveis de ambiente (Vercel)

Configure em **Project → Settings → Environment Variables**:
- `DATABASE_URL`
- `AUTH_SECRET` (>= 32 chars)
- `AUTH_TOKEN_PEPPER` (>= 16 chars)
- `APP_URL` (ex.: `https://seu-projeto.vercel.app`)
- (opcional) `GROQ_API_KEY`
- (opcional, para magic link por email) `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Dica (gerar secrets localmente):
- `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`

### 2) Migrações do Prisma (produção)

Depois de criar o banco e setar `DATABASE_URL`, rode:
- `npx prisma migrate deploy`

### 3) Build

O projeto roda `prisma generate` no `postinstall` e faz `next build` normalmente na Vercel.

## Dev

- `npm run dev`
