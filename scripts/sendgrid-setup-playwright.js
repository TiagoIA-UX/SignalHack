#!/usr/bin/env node
/*
Automação (parcial) para criar conta SendGrid e gerar API Key via UI.

Uso:
1) Instale dependências: pnpm add -D playwright dotenv
2) Copie sua senha para env1.txt como SENDGRID_PW and confirm: SENDGRID_EMAIL
3) Rode: node scripts/sendgrid-setup-playwright.js

OBSERVAÇÕES IMPORTANTES:
- O script automatiza preenchimento e criação de conta até o ponto do CAPTCHA; quando encontrar CAPTCHA
  ele irá pausar e abrir o navegador em modo visível para que você complete o CAPTCHA manualmente.
- Após o cadastro e verificação de e-mail, o script tentará outro fluxo para criar a API Key via UI.
- Não armazene chaves no repositório; o script apenas imprimirá a API Key na saída para que você a salve
  localmente (e depois o script pode aplicar nas envs da Vercel se tiver consentimento).
*/

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

function readEnvFromFile(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const m = raw.match(/SENDGRID_PW\s*=\s*"?(.+?)"?\s*$/m) || raw.match(/Senha=(.+?)$/m);
    const pw = m ? m[1].trim() : null;
    const me = raw.match(/SENDGRID_EMAIL\s*=\s*"?(.+?)"?\s*$/m);
    const email = me ? me[1].trim() : null;
    return { pw, email };
  } catch (e) {
    return { pw: null, email: null };
  }
}

(async () => {
  const envPath = path.resolve(process.cwd(), 'env1.txt');
  const { pw, email } = readEnvFromFile(envPath);
  if (!pw) {
    console.error('Erro: não encontrei SENDGRID_PW em env1.txt. Coloque: SENDGRID_PW="suaSenha"');
    process.exit(1);
  }
  if (!email) {
    console.warn('Aviso: não encontrei SENDGRID_EMAIL em env1.txt. O script pedirá o e-mail no fluxo.');
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Abrindo página de signup do SendGrid...');
  await page.goto('https://app.sendgrid.com/signup');

  // Preencher email e senha (o fluxo pode mudar; ajustável)
  if (email) {
    await page.fill('input[name="email"]', email).catch(() => {});
  }
  await page.fill('input[name="password"]', pw).catch(() => {});

  // Submeter formulário (pode haver etapas adicionais)
  try {
    await page.click('button[type="submit"]');
  } catch (e) {
    console.log('Interaja com a página de signup manualmente se necessário.');
  }

  console.log('\nPausa: complete o CAPTCHA e finalize a verificação de e‑mail no browser que abriu.\nDepois de confirmar manualmente, volte aqui e pressione ENTER para continuar o script.');
  process.stdin.resume();
  await new Promise((res) => process.stdin.once('data', res));

  // Após criar a conta e validar o e-mail, navegue para API Keys
  console.log('Tentando criar API Key via UI (navegue até Settings -> API Keys se necessário).');
  try {
    await page.goto('https://app.sendgrid.com/settings/api_keys');
    await page.click('button:has-text("Create API Key")');
    await page.fill('input[name="name"]', 'ZAIRIX-Key');
    // Selecionar permissão Mail Send (a UI pode variar)
    await page.click('button:has-text("Create & View")');
    // Espera e captura da chave
    await page.waitForSelector('pre', { timeout: 10000 });
    const pre = await page.$('pre');
    const apiKey = pre ? (await pre.textContent()).trim() : null;
    if (apiKey) {
      console.log('API Key criada (copie e guarde em local seguro):');
      console.log(apiKey);
      console.log('\nAgora vou parar; use esta API Key para criar Domain Authentication via API ou GUI.');
    } else {
      console.log('Não consegui capturar API Key automaticamente — crie a API Key manualmente dentro do painel e cole aqui.');
    }
  } catch (e) {
    console.warn('Falha ao criar API Key automaticamente:', e.message);
    console.log('Por favor crie a API Key manualmente no painel em Settings -> API Keys e adicione em env1.txt como SMTP_PASS="SG_EXAMPLE_KEY"  // exemplo público, NÃO commite a chave real');
  }

  console.log('\nScript finalizado — remova SENDGRID_PW do env1.txt assim que terminar por segurança.');
  await browser.close();
  process.exit(0);
})();
