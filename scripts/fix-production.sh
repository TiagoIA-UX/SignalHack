#!/usr/bin/env bash
set -euo pipefail

# scripts/fix-production.sh
# Script seguro para validar/corrigir infra de produção do Zairix (PRD VPS).
# - Verifica /etc/zairix.env e /root/.zairix_db_pass
# - Cria/atualiza role zairix no Postgres (se senha disponível)
# - Cria DB zairix se ausente
# - Roda prisma migrate deploy e npm run build como www-data
# - Reinicia systemd service e checa health
# USO: rode como root no VPS: sudo bash scripts/fix-production.sh

LOG=/tmp/fix-production.log
exec > >(tee -a "$LOG") 2>&1

echo "[INFO] Iniciando fix-production ($(date -u))"
APP_DIR=/var/www/zairix
ENV_FILE=/etc/zairix.env
DB_PASS_FILE=/root/.zairix_db_pass
SERVICE_NAME=zairix

# Função utilitária segura para editar /etc/zairix.env (não imprime secrets)
safe_source_env() {
  # Carrega env sem imprimir
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE" 2>/dev/null || true
  set +a
}

# 1) Verificações iniciais
echo "[STEP] Verificações iniciais"
[ -f "$ENV_FILE" ] && echo "[OK] $ENV_FILE existe" || echo "[WARN] $ENV_FILE ausente"
[ -f "$DB_PASS_FILE" ] && echo "[OK] $DB_PASS_FILE existe" || echo "[INFO] $DB_PASS_FILE ausente (usaremos DATABASE_URL se disponível)"
[ -d "$APP_DIR" ] && echo "[OK] App em $APP_DIR" || echo "[WARN] $APP_DIR ausente"

# 2) Postgres: criar/atualizar role e DB se possível (senha em $DB_PASS_FILE)
if command -v psql >/dev/null 2>&1; then
  DB_PASS=""
  if [ -f "$DB_PASS_FILE" ]; then
    DB_PASS=$(cat "$DB_PASS_FILE")
  fi

  echo "[STEP] Verificando role/database no Postgres"
  if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='zairix'" | grep -q 1; then
    echo "[INFO] role zairix existe"
    if [ -n "$DB_PASS" ]; then
      sudo -u postgres psql -v pwd="$DB_PASS" -c "ALTER ROLE zairix WITH PASSWORD :'pwd';" && echo "[OK] Senha da role atualizada"
    fi
  else
    if [ -n "$DB_PASS" ]; then
      sudo -u postgres psql -v pwd="$DB_PASS" -c "CREATE ROLE zairix LOGIN PASSWORD :'pwd';" && echo "[OK] Role zairix criada"
    else
      echo "[WARN] Role zairix ausente e sem senha disponível em $DB_PASS_FILE"
    fi
  fi

  if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='zairix'" | grep -q 1; then
    echo "[INFO] Database zairix existe"
  else
    echo "[ACTION] Criando database zairix (owner=zairix)"
    sudo -u postgres psql -c "CREATE DATABASE zairix OWNER zairix;" || echo "[WARN] falha ao criar DB"
  fi

  if [ -n "$DB_PASS" ]; then
    if PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -U zairix -d zairix -c "SELECT 1;" -tA >/dev/null 2>&1; then
      echo "[OK] Teste TCP ao DB bem-sucedido"
    else
      echo "[ERROR] Falha no teste TCP ao DB com credenciais fornecidas"
    fi
  else
    echo "[INFO] Teste TCP não executado (sem senha disponível)"
  fi
else
  echo "[ERROR] psql não encontrado"
fi

# 3) Migrations & Build
if [ -d "$APP_DIR" ]; then
  echo "[STEP] Rodando prisma migrate deploy e build (como www-data)"
  safe_source_env
  sudo -u www-data -H bash -lc "set -a; source $ENV_FILE 2>/dev/null || true; set +a; cd $APP_DIR && npx prisma migrate deploy" || echo "[WARN] prisma migrate deploy retornou erro"
  sudo -u www-data -H bash -lc "set -a; source $ENV_FILE 2>/dev/null || true; set +a; cd $APP_DIR && npm run build" || echo "[WARN] npm run build retornou erro"
else
  echo "[WARN] Pulando migrate/build: $APP_DIR ausente"
fi

# 4) Restart & health
echo "[STEP] Reiniciando service $SERVICE_NAME"
systemctl restart "$SERVICE_NAME" || echo "[WARN] Falha ao reiniciar $SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager || true

echo "[STEP] Checando porta 3001 e health"
ss -ltnp | grep 3001 || true
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/api/health || echo "[WARN] /api/health sem resposta"

echo "[DONE] Log: $LOG"
exit 0
