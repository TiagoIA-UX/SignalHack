param(
  [Parameter(Mandatory = $true)][string]$Email1,
  [Parameter(Mandatory = $true)][string]$Email2,
  [Parameter(Mandatory = $false)][string]$Password
)

$ErrorActionPreference = "Stop"

function Read-PlaintextPassword {
  param(
    [string]$Prompt = 'SMOKE_TEST_PASSWORD'
  )

  $secure = Read-Host -Prompt $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

if (-not $Password -or $Password.Trim().Length -lt 8) {
  $Password = Read-PlaintextPassword
}

Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))

Write-Host "[1/5] Subindo Postgres (Docker)..." -ForegroundColor Cyan
npm run db:up

Write-Host "[2/5] Rodando migrações Prisma..." -ForegroundColor Cyan
npm run db:migrate

Write-Host "[3/5] Promovendo ADMIN + definindo senha..." -ForegroundColor Cyan
npx tsx scripts/seed-admin.ts --email $Email1 --password $Password
npx tsx scripts/seed-admin.ts --email $Email2 --password $Password

Write-Host "[4/5] Ajustando plano para ELITE + reset diário..." -ForegroundColor Cyan
npx tsx scripts/set-user-plan.ts --email $Email1 --plan ELITE --reset-daily
npx tsx scripts/set-user-plan.ts --email $Email2 --plan ELITE --reset-daily

Write-Host "[5/5] Confirmando (últimos usuários)..." -ForegroundColor Cyan
node scripts/list-users.mjs

Write-Host "OK: ADMIN + ELITE aplicados." -ForegroundColor Green
