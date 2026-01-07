# Security — Rotate Exposed Secrets

Found sensitive values in local files. Follow these steps immediately:

1. Rotate DB credentials
   - In Neon (or your DB provider) **rotate the user/password** referenced in the leaked connection string.
   - Create a new connection string (POOLED for running app) and update `DATABASE_URL` in Vercel.
   - If you used a separate DB user for migrations (DIRECT), rotate that too.

2. Rotate SMTP credentials
   - Reset SMTP password in your provider (Gmail/SendGrid/Postmark etc.).
   - Update `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in Vercel.

3. Rotate other secrets (AUTH keys, Groq, MercadoPago)
   - Regenerate `AUTH_SECRET` and `AUTH_TOKEN_PEPPER` if you suspect they were exposed.
   - Rotate `GROQ_API_KEY` and `MERCADOPAGO_ACCESS_TOKEN` as needed and update Vercel.

4. Update environment in Vercel
   - Use `scripts/vercel-set-database-url.ps1` or Vercel dashboard to add the new `DATABASE_URL` and other sensitive vars.
   - Mark variables as Sensitive in Vercel.

5. Revoke or reissue any keys or accounts that might have been compromised.

6. (Optional, advanced) Purge Git history
   - Use BFG or `git filter-repo` to remove secrets from history, then force-push. Coordinate with your team before doing this.
   - Example references: https://rtyley.github.io/bfg-repo-cleaner/ and https://github.com/newren/git-filter-repo

7. Verify
   - After rotating, run `npx prisma migrate deploy` on staging with the new `DATABASE_URL` to ensure migrations apply.
   - Run build and smoke tests: `npm run build`.

If you want, I can open a PR with these docs and the `.gitignore` change, or proceed with purging history (requires confirmation).