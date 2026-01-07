Neon Auth • Example (Vite + React + TS)

This lightweight example shows how to wire a minimal frontend to Neon Auth. It contains:

- `src/lib/auth.ts` — simple wrappers for requestMagicLink, getSession, signOut using the `VITE_NEON_AUTH_URL` env var.
- Minimal pages: `/auth` (request magic link) and `/account` (show session).

Quick start:

1. Copy `.env.example` to `.env` and set `VITE_NEON_AUTH_URL` to your Neon Auth URL.
2. Install deps: `pnpm install` (or `npm install`).
3. Start: `pnpm dev`.

Notes:
- This repo uses `fetch` in `src/lib/auth.ts` for demonstration; prefer the official `@neondatabase/neon-js` SDK in production if available.
- Do not commit real secrets. Use `.env`/Vercel envs for production.
