#!/usr/bin/env bash

########################################
# SignalHacker Guardian (v1)
# Operação, Segurança e Backups (Postgres)
########################################

set -Eeuo pipefail

VERSION="1.0.0"

# -------- Config (via env) --------
# Carregue um arquivo de env externo (recomendado):
#   export GUARDIAN_ENV_FILE=/etc/signalhacker/guardian.env
#   ./scripts/guardian.sh

GUARDIAN_ENV_FILE="${GUARDIAN_ENV_FILE:-}"
if [[ -n "$GUARDIAN_ENV_FILE" && -f "$GUARDIAN_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$GUARDIAN_ENV_FILE"
fi

APP_BASE_URL="${APP_BASE_URL:-http://localhost:3000}"
HEALTH_PATH="${HEALTH_PATH:-/api/health}"
DEBUG_DB_PATH="${DEBUG_DB_PATH:-/api/debug-db}"

COMPOSE_DIR="${COMPOSE_DIR:-/srv/signalhacker}"
COMPOSE_FILE="${COMPOSE_FILE:-$COMPOSE_DIR/docker-compose.yml}"
APP_SERVICE="${APP_SERVICE:-app}"
DB_SERVICE="${DB_SERVICE:-db}"

LOG_DIR="${LOG_DIR:-$COMPOSE_DIR/logs}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/guardian.log}"
LOCK_FILE="${LOCK_FILE:-/tmp/signalhacker_guardian.lock}"

BACKUP_DIR="${BACKUP_DIR:-$COMPOSE_DIR/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
BACKUP_KEY="${BACKUP_KEY:-}"

# WhatsApp (mantém apenas link de alerta no log — envio real depende de provedor/API)
WHATSAPP_NUMBER="${WHATSAPP_NUMBER:-}"

# DB (usa o próprio container do Postgres, sem depender de psql no host)
POSTGRES_DB="${POSTGRES_DB:-edgemind}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

# TLS check (opcional)
TLS_HOST="${TLS_HOST:-}"
TLS_PORT="${TLS_PORT:-443}"

# -------- Helpers --------
now() { date '+%Y-%m-%d %H:%M:%S'; }

mkdir -p "$LOG_DIR" "$BACKUP_DIR"

touch "$LOG_FILE" 2>/dev/null || true

log() {
  echo "[$(now)] $*" >> "$LOG_FILE"
}

fail() {
  log "ERROR: $*"
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando ausente: $1"
}

alert_whatsapp_link() {
  local msg="$1"
  if [[ -z "$WHATSAPP_NUMBER" ]]; then
    log "ALERTA: $msg"
    return 0
  fi

  local encoded
  encoded=$(python3 - <<'PY'
import os, urllib.parse
print(urllib.parse.quote(os.environ['MSG']))
PY
  )
  local link="https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}"
  log "ALERTA WHATSAPP (link): $link"
}

with_lock() {
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    log "Já existe uma execução em andamento (lock: $LOCK_FILE). Saindo."
    exit 0
  fi
}

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

http_status() {
  local url="$1"
  curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$url" || echo "000"
}

# -------- Checks/Actions --------
check_health() {
  local url="$APP_BASE_URL$HEALTH_PATH"
  local status
  status=$(http_status "$url")

  if [[ "$status" != "200" ]]; then
    log "Healthcheck falhou: $url (HTTP $status)."
    alert_whatsapp_link "SignalHacker: healthcheck falhou (HTTP $status) em $(now). Tentando restart do serviço app."
    compose restart "$APP_SERVICE" >> "$LOG_FILE" 2>&1 || true
    return 1
  fi

  log "Health OK: $url (HTTP 200)."
  return 0
}

check_db() {
  # 1) Se existir /api/debug-db, use como verificação ponta-a-ponta.
  local debug_url="$APP_BASE_URL$DEBUG_DB_PATH"
  local status
  status=$(http_status "$debug_url")

  if [[ "$status" == "200" ]]; then
    log "DB OK via $debug_url (HTTP 200)."
    return 0
  fi

  # 2) Fallback: checa prontidão do Postgres dentro do container.
  log "DB check via API falhou (HTTP $status). Tentando pg_isready no container."

  if ! compose exec -T "$DB_SERVICE" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >> "$LOG_FILE" 2>&1; then
    log "Postgres não está pronto (pg_isready falhou). Tentando restart do serviço db."
    alert_whatsapp_link "SignalHacker: DB parece indisponível em $(now). Tentando restart do db."
    compose restart "$DB_SERVICE" >> "$LOG_FILE" 2>&1 || true
    return 1
  fi

  log "Postgres OK (pg_isready)."
  return 0
}

docker_cleanup() {
  log "Docker: limpando recursos não usados (prune)."
  docker container prune -f >> "$LOG_FILE" 2>&1 || true
  docker image prune -f >> "$LOG_FILE" 2>&1 || true
  docker volume prune -f >> "$LOG_FILE" 2>&1 || true
}

secure_permissions() {
  # Segurança básica (ajuste conforme seu layout). Não mexe em /srv inteiro por padrão.
  log "Segurança: garantindo permissões mínimas em dirs sensíveis."
  chmod 700 "$LOG_DIR" 2>/dev/null || true
  chmod 700 "$BACKUP_DIR" 2>/dev/null || true
}

backup_postgres() {
  if [[ -z "$BACKUP_KEY" ]]; then
    log "Backup: BACKUP_KEY não configurada; pulando backup criptografado."
    return 0
  fi

  local day
  day=$(date +%F)
  local out="$BACKUP_DIR/edgemind_${day}.sql.gz.enc"

  log "Backup: gerando pg_dump (gzip) + criptografia (openssl) -> $out"

  # Dump dentro do container, stream pro host, gzip+encrypt no host.
  # OBS: não loga conteúdo do dump.
  if ! compose exec -T "$DB_SERVICE" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
    | gzip -c \
    | openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -out "$out" -pass "pass:$BACKUP_KEY" \
    >> "$LOG_FILE" 2>&1; then
    alert_whatsapp_link "SignalHacker: backup do Postgres falhou em $(now)."
    return 1
  fi

  # Retenção
  find "$BACKUP_DIR" -type f -name '*.enc' -mtime "+$BACKUP_RETENTION_DAYS" -delete >> "$LOG_FILE" 2>&1 || true
  log "Backup: concluído. Retenção: ${BACKUP_RETENTION_DAYS} dias."
}

check_tls() {
  if [[ -z "$TLS_HOST" ]]; then
    log "TLS: TLS_HOST não configurado; pulando check TLS."
    return 0
  fi

  log "TLS: verificando validade do certificado de $TLS_HOST:$TLS_PORT"
  echo | openssl s_client -connect "${TLS_HOST}:${TLS_PORT}" -servername "$TLS_HOST" 2>/dev/null \
    | openssl x509 -noout -dates >> "$LOG_FILE" 2>&1 || true
}

resources_snapshot() {
  log "Recursos: uso de disco"
  df -h >> "$LOG_FILE" 2>&1 || true

  log "Recursos: uso de memória"
  (free -m >> "$LOG_FILE" 2>&1) || true
}

# -------- Main --------
main() {
  with_lock

  require_cmd docker
  require_cmd curl
  require_cmd openssl
  require_cmd gzip
  require_cmd flock

  log "=== INÍCIO GUARDIAN v${VERSION} ==="
  log "APP_BASE_URL=$APP_BASE_URL"
  log "COMPOSE_FILE=$COMPOSE_FILE"

  docker_cleanup
  secure_permissions

  check_health || true
  check_db || true

  backup_postgres || true
  check_tls
  resources_snapshot

  log "=== FIM GUARDIAN ==="
}

# Export para o python3 do WhatsApp encoder
export MSG=""

# Pequeno wrapper para o encoder
alert_whatsapp_link() {
  local msg="$1"
  export MSG="$msg"
  if [[ -z "$WHATSAPP_NUMBER" ]]; then
    log "ALERTA: $msg"
    return 0
  fi

  local encoded
  if command -v python3 >/dev/null 2>&1; then
    encoded=$(python3 - <<'PY'
import os, urllib.parse
print(urllib.parse.quote(os.environ.get('MSG','')))
PY
    )
  else
    # fallback simples (não perfeito)
    encoded=${msg// /%20}
  fi

  local link="https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}"
  log "ALERTA WHATSAPP (link): $link"
}

main "$@"
