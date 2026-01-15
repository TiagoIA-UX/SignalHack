import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local', override: true });
loadEnv({ path: '.env', override: false });

import { prisma } from '../lib/prisma';

(async () => {
  try {
    const u = await prisma.users.findUnique({ where: { email: 'globemarket7@gmail.com' }, select: { id: true, email: true, role: true } });
    console.log('admin:', u);
  } catch (err) {
    console.error('error querying db:', (err as any).message || err);
    process.exit(2);
  }
})();