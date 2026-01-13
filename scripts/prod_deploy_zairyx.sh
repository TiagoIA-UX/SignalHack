#!/usr/bin/env bash
set -euo pipefail

# prod_deploy_zairyx.sh
# Idempotent deployment helper for Zairyx (Next.js + Prisma) on VPS
# - Ensures production DATABASE_URL is set (prompted interactively if missing)
# - Generates AUTH_SECRET securely
# - Adjusts prisma schema to use postgresql provider
# - Replaces lib/prisma.ts with server-safe PrismaClient instantiation
# - Ensures next.config.js has output: "standalone"
# - Performs npm ci / prisma generate / prisma migrate deploy / npm run build
# - Writes /etc/zairix.env and sets secure perms
# - Creates systemd service /etc/systemd/system/zairix.service
# - Configures nginx site for services.zairyx.com and reloads nginx
# - Attempts certbot when DNS resolves
# - Validates service and health endpoint

LOG=/tmp/prod_deploy_zairyx.log
exec > >(tee -a "$LOG") 2>&1

echo "Starting Zairyx production deploy helper"
date

if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root. Exiting." >&2
  exit 1
fi

# CONFIG
APP_DIR=/var/www/zairix
REPO_URL=https://github.com/TiagoIA-UX/SignalHack.git
ENV_FILE=/etc/zairix.env
SERVICE_NAME=zairix
SYSTEMD_UNIT=/etc/systemd/system/${SERVICE_NAME}.service
NGINX_SITE=/etc/nginx/sites-available/services.zairyx.com
DOMAIN=services.zairyx.com
APP_HOST=127.0.0.1
APP_PORT=3001

# Utility: prompt for a sensitive value (no echo)
prompt_secret() {
  local varname="$1"
  local prompt="$2"
  local out
  while true; do
    read -rsp "$prompt" out
    echo
    if [ -n "$out" ]; then
      printf -v "$varname" '%s' "$out"
      break
    else
      echo "Value cannot be empty"
    fi
  done
}

# 1) Ensure environment: prompt for DATABASE_URL if not already present in /etc/zairix.env
if [ -f "$ENV_FILE" ]; then
  echo "Reading existing $ENV_FILE"
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not defined in $ENV_FILE. You must provide a production DATABASE_URL (Postgres)."
  echo "Examples: postgresql://user:pass@host:5432/dbname"
  prompt_secret DATABASE_URL "Enter DATABASE_URL (hidden): "
fi

# 2) Generate AUTH_SECRET and store it securely (if not present)
if [ -z "${AUTH_SECRET:-}" ]; then
  AUTH_SECRET=$(openssl rand -hex 32)
  echo "Generated AUTH_SECRET (stored once to /root/.zairyx_auth_secret)"
  echo "$AUTH_SECRET" > /root/.zairyx_auth_secret
  chmod 600 /root/.zairyx_auth_secret
fi

# 3) Write /etc/zairix.env (back up if exists)
if [ -f "$ENV_FILE" ]; then
  cp -a "$ENV_FILE" "${ENV_FILE}.$(date +%s).bak"
fi
cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=${APP_PORT}
DATABASE_URL=${DATABASE_URL}
AUTH_SECRET=${AUTH_SECRET}
NEXTAUTH_URL=https://zairyx.com
APP_URL=https://${DOMAIN}
EOF
chown root:root "$ENV_FILE"
chmod 640 "$ENV_FILE"

# 4) Ensure prisma/schema.prisma uses provider = "postgresql"
SCHEMA_FILE="$APP_DIR/prisma/schema.prisma"
if [ -f "$SCHEMA_FILE" ]; then
  echo "Patching prisma schema to use postgresql provider"
  cp -a "$SCHEMA_FILE" "${SCHEMA_FILE}.bak.$(date +%s)"
  sed -E -i "s/(datasource\s+db\s*\{[^}]*provider\s*=\s*)\"[^"]+\"/\1\"postgresql\"/I" "$SCHEMA_FILE"
  sed -E -i "s/(datasource\s+db\s*\{[^}]*url\s*=\s*)env\([^\)]+\)/\1env(\"DATABASE_URL\")/I" "$SCHEMA_FILE"
else
  echo "Warning: prisma schema not found at $SCHEMA_FILE — skipping schema patch"
fi

# 5) Replace lib/prisma.ts to avoid edge-specific adapters
PRISMA_TS="$APP_DIR/lib/prisma.ts"
if [ -f "$PRISMA_TS" ]; then
  echo "Backing up and replacing $PRISMA_TS"
  cp -a "$PRISMA_TS" "${PRISMA_TS}.bak.$(date +%s)"
  cat > "$PRISMA_TS" <<'TS'
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
TS
else
  echo "$PRISMA_TS not found; skipping replacement."
fi

# 6) Ensure next.config.js has standalone output
NEXT_CONFIG="${APP_DIR}/next.config.js"
if [ -f "$NEXT_CONFIG" ]; then
  echo "Updating $NEXT_CONFIG to set output: 'standalone' (backing up)"
  cp -a "$NEXT_CONFIG" "${NEXT_CONFIG}.bak.$(date +%s)"
  if grep -q "output\s*:\s*\"standalone\"" "$NEXT_CONFIG" 2>/dev/null; then
    echo "next.config.js already has standalone output"
  else
    if grep -q "module\.exports" "$NEXT_CONFIG" 2>/dev/null; then
      sed -E -i "s/module\.exports\s*=\s*\{(.*)\}/module.exports = { \1, output: 'standalone' }/s" "$NEXT_CONFIG" || true
    else
      echo "module.exports = { output: 'standalone' }" >> "$NEXT_CONFIG"
    fi
  fi
else
  echo "Creating $NEXT_CONFIG with standalone output"
  cat > "$NEXT_CONFIG" <<'JS'
module.exports = {
  output: "standalone",
};
JS
fi

# 7) Clone or update the repo
if [ -d "$APP_DIR/.git" ]; then
  echo "Updating existing repo at $APP_DIR"
  cd "$APP_DIR"
  git fetch --all --tags
  git reset --hard origin/main
else
  echo "Cloning repo into $APP_DIR"
  mkdir -p "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi
chown -R www-data:www-data "$APP_DIR"

# 8) Install deps, prisma generate, migrate deploy, build
echo "Installing dependencies and preparing build"
cd "$APP_DIR"

# Clean partial artifacts
rm -rf node_modules .next

# Install and generate
sudo -u www-data -H bash -lc 'cd "$APP_DIR" && npm ci --no-audit'

# Ensure prisma generated with the production DATABASE_URL
echo "Running prisma generate and migrate (as www-data with env)"
export $(grep -v '^#' "$ENV_FILE" | xargs)
sudo -u www-data -H bash -lc 'cd "$APP_DIR"; npx prisma generate'
sudo -u www-data -H bash -lc 'cd "$APP_DIR"; npx prisma migrate deploy'

# Build
sudo -u www-data -H bash -lc 'cd "$APP_DIR"; npm run build'

# 9) Create systemd unit
if [ ! -f "$SYSTEMD_UNIT" ]; then
  echo "Creating systemd unit $SYSTEMD_UNIT"
  cat > "$SYSTEMD_UNIT" <<SERVICE
[Unit]
Description=Zairix Next.js App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${APP_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=/usr/bin/node .next/standalone/server.js
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
SERVICE
  systemctl daemon-reload
  systemctl enable --now "$SERVICE_NAME"
else
  echo "Systemd unit exists; reloading and restarting"
  systemctl daemon-reload
  systemctl restart "$SERVICE_NAME" || true
fi

# 10) Configure nginx site for services.zairyx.com
if [ ! -f "$NGINX_SITE" ]; then
  echo "Creating nginx site for $DOMAIN"
  cat > "$NGINX_SITE" <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://${APP_HOST}:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* ^/_next/ {
        proxy_pass http://${APP_HOST}:${APP_PORT};
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
  ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/
  nginx -t
  systemctl reload nginx
else
  echo "Nginx site exists; testing and reloading"
  nginx -t && systemctl reload nginx
fi

# 11) Attempt certbot if DNS resolves
echo "Checking DNS for ${DOMAIN}"
if host "$DOMAIN" >/dev/null 2>&1; then
  echo "DNS resolves for $DOMAIN; attempting certbot"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@zairyx.com || echo "certbot failed — check DNS / rate limits"
else
  echo "DNS for $DOMAIN does not resolve yet — skip certbot. Point services.zairyx.com to your VPS IP then re-run this script or run certbot manually."
fi

# 12) Validations
echo "Validations: systemd status, port listening, health checks"
systemctl status "$SERVICE_NAME" --no-pager || true
ss -ltnp | grep "${APP_PORT}" || true
curl -sS -o /dev/null -w "%{http_code}\n" http://${APP_HOST}:${APP_PORT}/api/health || true
if host "$DOMAIN" >/dev/null 2>&1; then
  curl -sS -o /dev/null -w "%{http_code}\n" https://${DOMAIN}/api/health || true
fi

echo "Deployment script finished. Inspect $LOG and /var/log/nginx/error.log for errors. If Prisma or DB errors appear, confirm DATABASE_URL and run: npx prisma migrate deploy"

echo "Backup locations: ${PRISMA_TS}.bak.*, ${SCHEMA_FILE}.bak.* if present"

date

exit 0