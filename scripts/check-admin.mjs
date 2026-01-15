import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const m = require('../lib/prisma');
const prisma = m.db;
(async ()=>{
  try{
    const u = await prisma.users.findUnique({ where: { email: 'globemarket7@gmail.com' }, select: { id:true, email:true, role:true } });
    console.log('admin:',u);
  }catch(e){
    console.error('error querying db:', e.message || e);
    process.exit(2);
  }
})();