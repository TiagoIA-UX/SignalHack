PRODUCTION_FIX.md

Resumo
-----
Este documento descreve o script `scripts/fix-production.sh` — um utilitário seguro para aplicar correções comuns em produção no VPS (criação/atualização de role Postgres, migrações Prisma, build Next.js, reinício do serviço e checagens de health).

Como usar
--------
1. Transfira o repositório para o VPS (ou garanta que `scripts/fix-production.sh` exista no VPS). 
2. Execute como root (no VPS):
   sudo bash scripts/fix-production.sh

O script grava log em `/tmp/fix-production.log` e não imprime segredos. Ele usa `/etc/zairix.env` e `/root/.zairix_db_pass` quando presentes.

Ações importantes após rodar
---------------------------
- Se o script reportar falha em conexão com o DB: verifique `DATABASE_URL` em `/etc/zairix.env` e confirme senha em `/root/.zairix_db_pass`.
- Rotacione todas as chaves expostas (SSH/GitHub, GROQ, MERCADOPAGO, AUTH_SECRET) se houver indícios de exposição.

Nota de Segurança
-----------------
- Não comite segredos; mantenha `.env` em `.gitignore` (o repo já tem essa regra). 
- Se um segredo já apareceu em histórico público, considere reescrever o histórico e rotacionar as credenciais.
