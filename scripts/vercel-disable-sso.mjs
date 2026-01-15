import https from 'https';
import { env } from 'process';

const token = process.argv[2] || env.VERCEL_TOKEN;
if (!token) {
  console.error('Usage: node scripts/vercel-disable-sso.mjs <TOKEN>');
  process.exit(2);
}

const projectId = 'prj_AuRhobLxcyIyAD98IoMRsJSUYo9j';
const data = JSON.stringify({ ssoProtection: { deploymentType: 'none' } });

const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: `/v9/projects/${projectId}`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => (body += chunk));
  res.on('end', () => {
    console.log('status', res.statusCode);
    try {
      console.log('body', JSON.parse(body));
    } catch (e) {
      console.log('body', body);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
