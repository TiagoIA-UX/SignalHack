# One-command local runner (Windows / PowerShell)
# - Ensures minimal .env entries
# - Starts Postgres via docker compose
# - Runs Prisma migrations
# - Starts Next dev server

$ErrorActionPreference = "Stop"

function Assert-Command([string]$name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "Faltando comando: $name" -ForegroundColor Red
    throw "missing_command:$name"
  }
}

Assert-Command "node"
Assert-Command "npm"
Assert-Command "docker"

function Assert-DockerDaemon() {
  try {
    docker info *> $null
    if ($LASTEXITCODE -ne 0) { throw "docker_info_failed" }
  } catch {
    Write-Host "Docker parece não estar rodando (Docker Desktop/daemon indisponível)." -ForegroundColor Red
    Write-Host "Abra o Docker Desktop e aguarde ficar 'Running', então rode este script novamente." -ForegroundColor Yellow
    throw "docker_daemon_unavailable"
  }
}

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot ".."))
Set-Location $projectRoot

Assert-DockerDaemon

function Test-PortInUse([int]$port) {
  # Preferência: Get-NetTCPConnection (detecta bind em IPv4/IPv6).
  if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    try {
      $c = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
      return ($null -ne $c)
    } catch {
      # fallback
    }
  }

  # Fallback: tentativa de bind em IPv4 e IPv6 any.
  $inUse = $false
  try {
    $l4 = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
    $l4.Start()
    $l4.Stop()
  } catch { $inUse = $true }

  try {
    $l6 = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::IPv6Any, $port)
    $l6.Server.DualMode = $true
    $l6.Start()
    $l6.Stop()
  } catch { $inUse = $true }

  return $inUse
}

function Add-EnvLineIfMissing([string]$path, [string]$key, [string]$value) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType File -Path $path -Force | Out-Null
  }

  $content = Get-Content -Path $path -Raw
  if ($content -match "(?m)^\s*$([Regex]::Escape($key))\s*=") {
    return
  }

  # Se o arquivo não termina com newline, adicionar uma quebra antes de anexar.
  if ($content -and -not $content.EndsWith("`n")) {
    Add-Content -Path $path -Value ""
  }

  Add-Content -Path $path -Value ("{0}={1}" -f $key, $value)
}

function Get-EnvValue([string]$path, [string]$key) {
  if (-not (Test-Path $path)) { return $null }
  $lines = Get-Content -Path $path
  foreach ($line in $lines) {
    if ($line -match "^\s*#") { continue }
    $m = [Regex]::Match($line, "^\s*" + [Regex]::Escape($key) + "\s*=\s*(.*)\s*$")
    if ($m.Success) {
      return $m.Groups[1].Value
    }
  }
  return $null
}

$envFile = Join-Path $projectRoot ".env"

# Alguns setups antigos guardam segredos em env1.txt/env.txt (ignorados pelo git).
# Next.js carrega .env/.env.local automaticamente; então, se GROQ_API_KEY existir nesses arquivos,
# copiamos para .env (somente se ainda não estiver definido) sem imprimir o valor.
$legacyEnvCandidates = @(
  (Join-Path $projectRoot "env1.txt"),
  (Join-Path $projectRoot "env.txt")
)

# Defaults for local Docker DB (see docker-compose.yml)
$pgUser = "postgres"
$pgPass = (Get-EnvValue $envFile "POSTGRES_PASSWORD")
if (-not $pgPass -or $pgPass.Trim().Length -eq 0) { $pgPass = "postgres" }

# Ensure AUTH_SECRET
$authSecret = (Get-EnvValue $envFile "AUTH_SECRET")
if (-not $authSecret -or $authSecret.Trim().Length -lt 32) {
  $generated = node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
  Add-EnvLineIfMissing $envFile "AUTH_SECRET" $generated.Trim()
}

# Ensure APP_URL
Add-EnvLineIfMissing $envFile "APP_URL" "http://localhost:3000"

# Ensure POSTGRES_PASSWORD for docker compose
Add-EnvLineIfMissing $envFile "POSTGRES_PASSWORD" $pgPass

# Ensure DATABASE_URL (host port 5434 -> container 5432)
$databaseUrl = (Get-EnvValue $envFile "DATABASE_URL")
if (-not $databaseUrl -or $databaseUrl.Trim().Length -eq 0) {
  $url = "postgresql://${pgUser}:${pgPass}@localhost:5434/edgemind?schema=public"
  Add-EnvLineIfMissing $envFile "DATABASE_URL" $url
}

# Ensure GROQ_API_KEY / GROQ_MODEL (opcional). Se não estiver no .env, tenta copiar de env1.txt/env.txt.
$groqKey = (Get-EnvValue $envFile "GROQ_API_KEY")
if (-not $groqKey -or $groqKey.Trim().Length -eq 0) {
  foreach ($cand in $legacyEnvCandidates) {
    $v = (Get-EnvValue $cand "GROQ_API_KEY")
    if ($v -and $v.Trim().Length -gt 0) {
      Write-Host "Encontrado GROQ_API_KEY em $(Split-Path $cand -Leaf). Copiando para .env..." -ForegroundColor Cyan
      Add-EnvLineIfMissing $envFile "GROQ_API_KEY" $v.Trim()
      break
    }
  }
}

$groqModel = (Get-EnvValue $envFile "GROQ_MODEL")
if (-not $groqModel -or $groqModel.Trim().Length -eq 0) {
  foreach ($cand in $legacyEnvCandidates) {
    $v = (Get-EnvValue $cand "GROQ_MODEL")
    if ($v -and $v.Trim().Length -gt 0) {
      Write-Host "Encontrado GROQ_MODEL em $(Split-Path $cand -Leaf). Copiando para .env..." -ForegroundColor Cyan
      Add-EnvLineIfMissing $envFile "GROQ_MODEL" $v.Trim()
      break
    }
  }
}

# Install deps only if node_modules is missing
if (-not (Test-Path (Join-Path $projectRoot "node_modules"))) {
  Write-Host "Instalando dependências (npm install)..." -ForegroundColor Cyan
  npm install
}

Write-Host "Subindo Postgres (docker compose up -d db)..." -ForegroundColor Cyan
npm run db:up
if ($LASTEXITCODE -ne 0) {
  throw "db_up_failed:$LASTEXITCODE"
}

Write-Host "Rodando migrações (npm run db:migrate)..." -ForegroundColor Cyan
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
  throw "db_migrate_failed:$LASTEXITCODE"
}

if (Test-Path (Join-Path $projectRoot ".next\dev\lock")) {
  # Lock pode ficar preso após crash/aborto. Melhor esforço: tenta parar o PID do lock (se houver) e remove o arquivo.
  $lockPath = Join-Path $projectRoot ".next\dev\lock"
  try {
    $lockText = Get-Content -Path $lockPath -Raw -ErrorAction SilentlyContinue
    if ($lockText) {
      $m = [Regex]::Match($lockText, "\b\d{2,8}\b")
      if ($m.Success) {
        $procId = [int]$m.Value
        if (Get-Process -Id $procId -ErrorAction SilentlyContinue) {
          Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        }
      }
    }
  } catch {
    # ignore
  }
  Remove-Item -Force $lockPath -ErrorAction SilentlyContinue
}

Write-Host "Iniciando app (Next dev) escolhendo uma porta livre..." -ForegroundColor Cyan

$port = $null
for ($p = 3000; $p -le 3010; $p++) {
  if (-not (Test-PortInUse $p)) { $port = $p; break }
}
if (-not $port) { throw "no_free_port:3000-3010" }

$url = "http://localhost:$port"
Write-Host "Rodando em: $url" -ForegroundColor Green

# Abre o navegador em paralelo quando o health responder.
Start-Job -ScriptBlock {
  param($healthUrl, $url)
  for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Milliseconds 250
    try {
      $r = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
        Start-Process $url | Out-Null
        return
      }
    } catch {
      # keep waiting
    }
  }
  Start-Process $url | Out-Null
} -ArgumentList ("$url/api/health"), $url | Out-Null

# Mantém logs no terminal atual (sem cmd.exe), e você para com Ctrl+C.
npm run dev -- --port $port
if ($LASTEXITCODE -ne 0) {
  throw "dev_failed:$LASTEXITCODE"
}
