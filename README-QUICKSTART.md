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
- O arquivo já está pronto:
  ```
  DATABASE_URL=postgresql://postgres:postgres@localhost:5433/edgemind?schema=public
  ```

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
- Email: zairyx.ai@gmail.com
- Senha: #Aurelius170742

## 7. Acesse a plataforma
- Abra: http://localhost:3000
- Use login/cadastro/reset de senha direto na tela (sem email/magic link)

---

### Dúvidas ou erros?
- Se aparecer erro de banco, revise usuário/senha do PostgreSQL e se o serviço está rodando.
- Se precisar resetar, pode apagar o banco e rodar os comandos novamente.

Plataforma pronta para teste local, sem complicações!
