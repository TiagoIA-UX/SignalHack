# Deploy Produção Nativo — Hostinger KVM2 (100% Free)

## 1. Pré-requisitos
- Ubuntu LTS (Hostinger KVM2)
- Node.js LTS
- PostgreSQL local
- systemd
- nginx (opcional, recomendado)

## 2. Variáveis de ambiente
Copie `.env.example` para `/etc/app.env` e ajuste:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://appuser:%23SUA_SENHA_AQUI@localhost:5432/appdb
```

## 3. Instale dependências

```
npm install
```

## 4. Serviço systemd
Crie `/etc/systemd/system/app.service`:

```
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
```

Ative e inicie:
```
systemctl daemon-reload
systemctl enable app
systemctl start app
```

## 5. Nginx reverse proxy (opcional)
Crie `/etc/nginx/sites-available/app`:

```
server {
  listen 80;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Ative e recarregue:
```
ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
nginx -t && systemctl reload nginx
```

## 6. Checklist final
- Teste: `curl http://127.0.0.1:4000/health` (deve retornar OK)
- Logs: `journalctl -u app -n 50 --no-pager`
- App inicia no boot: `systemctl enable app`
- Nenhuma dependência paga

---
Ambiente limpo, seguro, auditável, pronto para produção real.
