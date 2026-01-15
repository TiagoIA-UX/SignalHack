# Guia Rápido: Rodando SignalHack/Edgemind Localmente (Login Simples)

## Pré-requisitos
- Node.js 18+
- PostgreSQL instalado localmente

## 1. Instale o PostgreSQL
- Baixe em: https://www.postgresql.org/download/windows/
- Durante a instalação, defina:
  - Usuário: postgres
  - Senha: postgres
  - Porta: 5433
- Após instalar, abra o terminal do PostgreSQL (psql) ou pgAdmin.
- Execute:
  ```sql
  CREATE DATABASE edgemind;
  ALTER USER postgres WITH PASSWORD 'postgres';
  ```

## 2. Configure o .env
- Para rodar o app, crie um `.env` com o mínimo OR use o fallback local SQLite (recomendado para dev):
  ```
  # Option A — Local (dev, no Docker):
  DATABASE_URL="file:./dev.db"
  AUTH_SECRET="sua_chave_long_aqui"
  APP_URL=http://localhost:3000

  # Option B — PostgreSQL (prod-like / Docker / external):
  # DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edgemind?schema=public
  ```

- Inicializar local (recomendado uma vez por máquina):
  ```bash
# opcional: export ADMIN_EMAIL and ADMIN_PASSWORD to seed the admin account (USE MANUAL SCRIPT)
# Use o script idempotente e seguro para criar/validar admin em produção:
# npx tsx scripts/ensure-admin.ts --email admin@exemplo.com --password "SuaSenhaForte" --load-env 1
# O script recusará rodar contra SQLite (file:) a menos que você passe --force.
# IMPORTANTE: Não deixe seeds rodarem automaticamente no build; execute manualmente quando precisar.
  npm run setup:local
  ```

- Rodando em modo dev (sem Docker):
  ```bash
  npm run dev:local
  ```

- Dica (gerar `AUTH_SECRET`):
  ```
  node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
  ```

- Produção: veja o modelo em `.env.production.example` (não coloque segredos reais no repo).

- Monetização: se quiser habilitar exibição de opções de doação ou links de afiliado para sua instância, adicione as chaves públicas ao `.env`:
  ```
  NEXT_PUBLIC_AFFILIATE_HOSTING_URL=""
  NEXT_PUBLIC_SUPPORT_EMAIL="seu-email@exemplo.com"
  NEXT_PUBLIC_DONATION_PROVIDER_ENABLED="true"
  NEXT_PUBLIC_DONATION_COPY_VARIANT="soft"
  NEXT_PUBLIC_PIX_KEY="31629689840"
  ```

- (Opcional) IA via Groq:
  ```
  GROQ_API_KEY=
  GROQ_MODEL=
  ```

- (Opcional — recomendado em produção/Vercel) Rate limit distribuído via Upstash Redis:
  ```
  UPSTASH_REDIS_REST_URL=
  UPSTASH_REDIS_REST_TOKEN=
  ```
  Sem essas variáveis, o app usa fallback de rate limit em memória (ok para dev; menos confiável em serverless).

## 3. Instale dependências
```
npm install
```

## 4. Rode as migrações do banco
```
npx prisma migrate dev --name init
```

## 5. Inicie o servidor

Opção A — Local (sem Docker):
```
npm run dev
```

Opção B — Com Docker (recomendado para consistência):

1) Suba apenas o banco:
```
npm run db:up
```
2) Rode as migrações (se necessário):
```
npm run db:migrate
```
3) Inicie a aplicação via Docker Compose (dev):
```
npm run dev:compose
```

A aplicação ficará disponível em `http://localhost:3000`.

## 6. Crie usuário admin (opcional)
- Rode:
```
npx tsx scripts/seed-admin.ts
```

O script promove para ADMIN o usuário mais recente (ou o email que você informar). Para definir senha explicitamente:
```
npx tsx scripts/seed-admin.ts --email seu@email.com --password "SuaSenhaForteAqui"
```

## 7. Acesse a plataforma
- Abra: http://localhost:3000
- Use login/cadastro direto na tela.

## 8. Validar Brief + Busca + Playbook (opcional)

Com o app rodando, você pode validar os 3 pontos via script:

```powershell
$env:SMOKE_TEST_EMAIL='seu@email.com'
$env:SMOKE_TEST_PASSWORD='SuaSenhaForteAqui'
./scripts/validate-orchestration.ps1 -BaseUrl http://localhost:3001
```

Para exigir IA configurada (falha se `GROQ_API_KEY`/`groq_api_key` não estiverem setados):

```powershell
./scripts/validate-orchestration.ps1 -BaseUrl http://localhost:3001 -RequireAi
```

---

### Dúvidas ou erros?
- Se aparecer erro de banco, revise usuário/senha do PostgreSQL e se o serviço está rodando.
- Se precisar resetar, pode apagar o banco e rodar os comandos novamente.

Plataforma pronta para teste local, sem complicações!
