import https from 'https';
import { config as loadEnv } from 'dotenv';
import { readFileSync } from 'fs';

loadEnv({ path: '.env', override: false });
loadEnv({ path: '.env.local', override: true });

const token = process.argv[2];
if (!token) {
  console.error('Usage: node scripts/vercel-add-env.mjs <VERCEL_TOKEN>');
  process.exit(2);
}

const projectId = 'prj_AuRhobLxcyIyAD98IoMRsJSUYo9j';

const envs = [
  { key: 'DATABASE_URL', value: process.env.DATABASE_URL },
  { key: 'AUTH_SECRET', value: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET },
  { key: 'AUTH_TOKEN_PEPPER', value: process.env.AUTH_TOKEN_PEPPER },
  // SMTP / Resend
  { key: 'SMTP_HOST', value: process.env.SMTP_HOST },
  { key: 'SMTP_PORT', value: process.env.SMTP_PORT },
  { key: 'SMTP_USER', value: process.env.SMTP_USER },
  { key: 'SMTP_PASS', value: process.env.SMTP_PASS },
  { key: 'SMTP_FROM', value: process.env.SMTP_FROM },
  // Test login bypass (used by smoke tests to avoid hitting auth rate limits)
  { key: 'TEST_LOGIN_BYPASS_TOKEN', value: process.env.TEST_LOGIN_BYPASS_TOKEN },
  { key: 'TEST_LOGIN_BYPASS_ENABLED', value: process.env.TEST_LOGIN_BYPASS_ENABLED },
];

for (const e of envs) {
  if (!e.value) {
    console.error(`Skipping ${e.key}: value not found in local env`);
    continue;
  }
  const data = JSON.stringify({ key: e.key, value: e.value, target: ['production'], type: 'encrypted' });
  const options = {
    hostname: 'api.vercel.com',
    port: 443,
    path: `/v9/projects/${projectId}/env`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  console.log(`Adding ${e.key} to Vercel...`);
  await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          console.log(e.key, '->', parsed.id ? 'OK' : 'RESPONSE', parsed.error ? parsed.error : 'created');
          resolve();
        } catch (err) {
          console.log('Non-JSON response for', e.key);
          console.log(body);
          resolve();
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}
console.log('Done.');
