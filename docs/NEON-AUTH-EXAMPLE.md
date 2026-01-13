## Neon Auth • Example (Vite + React)

Um exemplo minimalista foi adicionado em `examples/neon-auth-vite/`.

Como usar:
1. Navegue até `examples/neon-auth-vite/`.
2. Copie `.env.example` para `.env` e preencha `VITE_NEON_AUTH_URL` com o endpoint do Neon Auth.
3. `pnpm install` e `pnpm dev` para rodar localmente.

O exemplo mostra uma integração simples (request magic link, ver sessão, logout) usando `fetch` para demonstrar o fluxo. Para produção, prefira o SDK oficial `@neondatabase/neon-js`.
