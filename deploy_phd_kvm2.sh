#!/bin/bash
# RESET TOTAL + PRODUÇÃO NATIVA EM KVM2 (100% FREE)
# Arquiteto: PhD Linux/Node/PostgreSQL
# Uso: bash deploy_phd_kvm2.sh

set -e

# === TAREFA 1: RESET TOTAL ===
echo "[1/6] Resetando ambiente..."
systemctl stop app || true
systemctl disable app || true
rm -f /etc/systemd/system/app.service
systemctl daemon-reload
pkill -u appuser node || true
rm -rf /var/www/app
rm -f /etc/app.env
userdel -r appuser || true
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS appdb;
DROP USER IF EXISTS appuser;
EOF

# === TAREFA 2: PREPARAÇÃO DO SISTEMA ===
echo "[2/6] Instalando Node.js LTS e PostgreSQL..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt-get install -y nodejs postgresql postgresql-contrib nginx
systemctl enable postgresql
systemctl start postgresql

sudo -u postgres psql <<EOF
CREATE USER appuser WITH PASSWORD '#Alpha170742';
CREATE DATABASE appdb OWNER appuser;
GRANT ALL PRIVILEGES ON DATABASE appdb TO appuser;
EOF

# Teste de conexão
sudo -u postgres psql "postgresql://appuser:%23Alpha170742@localhost:5432/appdb" -c '\dt'

# === TAREFA 3: APLICAÇÃO NODE.JS ===
echo "[3/6] Criando estrutura mínima do app..."
useradd -m -d /var/www/app -s /bin/bash appuser || true
mkdir -p /var/www/app
cd /var/www/app
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
chown -R appuser:appuser /var/www/app
npm install

# === TAREFA 4: VARIÁVEIS DE AMBIENTE ===
echo "[4/6] Configurando variáveis de ambiente..."
cat > /etc/app.env <<EOL
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://appuser:%23Alpha170742@localhost:5432/appdb
EOL
chown root:appuser /etc/app.env
chmod 640 /etc/app.env

# === TAREFA 5: SYSTEMD ===
echo "[5/6] Criando serviço systemd..."
cat > /etc/systemd/system/app.service <<EOL
[Unit]
Description=Node.js App
After=network.target postgresql.service

[Service]
EnvironmentFile=/etc/app.env
Type=simple
User=appuser
WorkingDirectory=/var/www/app
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOL
systemctl daemon-reload
systemctl enable app
systemctl start app

# === TAREFA 6: NGINX (OPCIONAL) ===
echo "[6/6] Configurando Nginx..."
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

# === CHECKLIST FINAL ===
echo "\nChecklist de produção:"
echo "- DB conecta: sudo -u postgres psql \"postgresql://appuser:%23Alpha170742@localhost:5432/appdb\" -c '\dt'"
echo "- App sobe no boot: systemctl enable app"
echo "- /health responde: curl http://127.0.0.1:4000/health"
echo "- Logs visíveis: journalctl -u app -n 50 --no-pager"
echo "- Nenhuma dependência paga"
echo "\nAmbiente limpo, seguro, auditável, pronto para produção real. Substitua %23Alpha170742 pela sua senha real do banco."
