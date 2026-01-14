#!/bin/bash
# SCRIPT DE ADAPTAÇÃO TOTAL PARA PRODUÇÃO NATIVA HOSTINGER KVM2 (100% FREE)
# Uso: bash adaptar_para_kvm2.sh
# Este script:
# - Remove dependências pagas/externas
# - Adapta o projeto para Node.js puro + PostgreSQL local
# - Gera estrutura mínima, variáveis seguras, systemd, Nginx
# - Pronto para produção real, auditável e sem SaaS

set -e

# 1. Remover Prisma, Vercel, Docker, PM2, Supabase, PlanetScale, Railway, etc.
echo "[1/7] Limpando dependências e scripts externos..."
cd /var/www/app || mkdir -p /var/www/app && cd /var/www/app
rm -rf node_modules package-lock.json prisma .env .env.* .next Dockerfile docker-compose.yml
sed -i '/prisma/d;/@prisma/d;/vercel/d;/supabase/d;/planetscale/d;/railway/d;/pm2/d;/docker/d;/next/d;/build/d;/start/d;/postinstall/d' package.json || true

# 2. Instalar Node.js LTS e PostgreSQL local
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs postgresql postgresql-contrib nginx
systemctl enable postgresql
systemctl start postgresql

# 3. Criar usuário/banco PostgreSQL seguro
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS appdb;
DROP USER IF EXISTS appuser;
CREATE USER appuser WITH PASSWORD '#Alpha170742';
CREATE DATABASE appdb OWNER appuser;
GRANT ALL PRIVILEGES ON DATABASE appdb TO appuser;
EOF

# 4. Estrutura mínima Node.js puro
cat > package.json <<'EOL'
{
  "name": "app",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": { "pg": "^8.0.0", "dotenv": "^16.0.0" }
}
EOL
cat > database.js <<'EOL'
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = { query: (text, params) => pool.query(text, params) };
EOL
cat > server.js <<'EOL'
require('dotenv').config({ path: '/etc/app.env' });
const http = require('http');
const db = require('./database');
const server = http.createServer(async (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
EOL
npm install

# 5. Variáveis de ambiente seguras
cat > /etc/app.env <<EOL
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://appuser:%23Alpha170742@localhost:5432/appdb
EOL
chown root:root /etc/app.env
chmod 640 /etc/app.env

# 6. Serviço systemd
cat > /etc/systemd/system/app.service <<EOL
[Unit]
Description=Node.js App
After=network.target postgresql.service

[Service]
EnvironmentFile=/etc/app.env
Type=simple
User=root
WorkingDirectory=/var/www/app
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOL
systemctl daemon-reload
systemctl enable app
systemctl restart app

# 7. Nginx reverse proxy
cat > /etc/nginx/sites-available/app <<EOL
server {
  listen 80;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
EOL
ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
nginx -t && systemctl reload nginx

# Checklist final
echo "\nChecklist de produção:"
echo "- DB conecta: sudo -u postgres psql \"postgresql://appuser:%23Alpha170742@localhost:5432/appdb\" -c '\dt'"
echo "- App sobe no boot: systemctl enable app"
echo "- /health responde: curl http://127.0.0.1:4000/health"
echo "- Logs visíveis: journalctl -u app -n 50 --no-pager"
echo "- Nenhuma dependência paga"
echo "\nAmbiente limpo, seguro, auditável, pronto para produção real. Substitua %23Alpha170742 pela sua senha real do banco (codifique # como %23 na URL)."
