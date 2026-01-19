# Segurança

## Reportar vulnerabilidades

Abra uma issue com o prefixo:
- `SECURITY:` (se não houver dados sensíveis)

Se houver risco de vazamento/exploit, use um canal privado (email do maintainer).

## Regras

- Não suba segredos no repositório (tokens, senhas, DATABASE_URL).
- Rotacione `AUTH_SECRET` e `AUTH_TOKEN_PEPPER` se houver suspeita de exposição.

