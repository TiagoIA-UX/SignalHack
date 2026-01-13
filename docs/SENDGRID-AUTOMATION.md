# SendGrid automation — guia

Este diretório contém scripts que ajudam a automatizar a criação de conta SendGrid, geração de API Key e a aplicação dos registros DNS para autenticação do domínio.

ATENÇÃO: as operações que envolvem CAPTCHA e verificação de e‑mail devem ser completadas manualmente pelo proprietário da conta (você). O fluxo foi dividido em etapas para automação segura.

Passos resumidos:

1) Preparar `env1.txt`
- Adicione no `env1.txt` (local, não comitar):

  SENDGRID_EMAIL="seu-email@exemplo.com"
  SENDGRID_PW="SUA_SENHA_AQUI"

  Dica: não use senhas reais em documentação versionada. Use placeholders e configure os valores reais apenas em variáveis de ambiente locais/Vercel.

2) Rodar o Playwright para criar conta
- Instalação (no workspace):
  pnpm add -D playwright
  npx playwright install
- Executar:
  node scripts/sendgrid-setup-playwright.js

  O script abrirá um navegador para executar o fluxo; caso encontre CAPTCHA, ele pausará e pedirá que você complete a etapa no navegador (isso é esperado).

3) Gerar API Key (via UI ou via script)
- Se o script capturou a API Key, copie e cole em `env1.txt`:
  SMTP_PASS="SG_EXAMPLE_KEY"  # exemplo público, substitua pela sua chave privada localmente (não commitar)

4) Autenticar domínio
- No SendGrid: Settings → Sender Authentication → Domain Authentication → start
- O SendGrid fornecerá 3 CNAMEs; use os scripts ou o painel de DNS do seu provedor (Hostinger) para adicioná‑los.

5) Adicionar registros DNS na Hostinger
- Use `scripts/hostinger-add-dns.sh` para obter um resumo dos registros necessários ou adicione manualmente no painel Hostinger → DNS Zone.

6) Aplicar variáveis na Vercel (exemplo de comandos)
- 'smtp.sendgrid.net' | vercel env add SMTP_HOST production --force
- '587' | vercel env add SMTP_PORT production --force
- 'apikey' | vercel env add SMTP_USER production --force
- 'SG_EXAMPLE_KEY' | vercel env add SMTP_PASS production --force --sensitive  # exemplo público, use sua chave em ambiente seguro
- 'no-reply@zairyx.com' | vercel env add SMTP_FROM production --force

7) Teste final
- curl -X POST "https://signal-hack.vercel.app/api/auth/request" -H "content-type: application/json" -d '{"email":"zairyx.ai@gmail.com"}'
- Verifique logs `vercel logs signal-hack.vercel.app` para confirmação de envio e status.


Se quiser, eu executo os passos automatizados (criação) e te aviso para completar o CAPTCHA e a verificação de e‑mail quando necessário. Se preferir que eu aplique os registros DNS automaticamente na Hostinger, forneça um token de API Hostinger (ou credenciais temporárias) com permissão para gerenciar DNS, e eu aplico os CNAMEs assim que o SendGrid retornar os valores.
