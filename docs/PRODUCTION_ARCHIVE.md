PRODUCTION_ARCHIVE.md

Data: 2026-01-13
Resumo das ações realizadas (estado arquivado)
--------------------------------------------
- Removida a(s) linha(s) `Token_ssh` do arquivo `.env` local (para evitar exposição acidental).
- Adicionado `scripts/fix-production.sh` (script de correção segura) e documentação `docs/PRODUCTION_FIX.md`.
- `.gitignore` foi ajustado para reforçar que `.env` não seja versionado.

Observações de segurança
-----------------------
- Rotacionar imediatamente chave SSH listada anteriormente e remover a chave antiga de `/root/.ssh/authorized_keys` no VPS e também do painel GitHub (Settings → SSH and GPG keys).
- Rotacionar quaisquer tokens sensíveis (GROQ, MERCADOPAGO, DB password, AUTH_SECRET) caso haja risco de exposição.

Status atual
------------
- Commit local criado; push para o remoto requer autenticação (PAT / SSH). 
- Próximo passo recomendado: executar `scripts/fix-production.sh` no VPS como root e colar a saída de `/tmp/fix-production.log` aqui.
