param(
  [string]$Schema = "prisma/schema.prisma",
  [string]$EnvFile = "env1.txt"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
  throw "Arquivo não encontrado: $EnvFile"
}

$content = Get-Content -Raw $EnvFile
$dbMatch = [regex]::Match($content, 'postgres(ql)?://[^\s''"]+')
if (-not $dbMatch.Success) {
  throw "Não consegui extrair uma URL postgresql:// do arquivo $EnvFile"
}

$dbUrl = $dbMatch.Value
Write-Host ("DATABASE_URL extraído (len=" + $dbUrl.Length + ")")

$renames = @()
foreach ($file in @(".env.prisma", ".env", ".env.local")) {
  if (Test-Path $file) {
    $bak = "$file.bak_migrate"
    if (Test-Path $bak) {
      Remove-Item $bak -Force
    }
    Rename-Item $file $bak
    $renames += @{ orig = $file; bak = $bak }
  }
}

try {
  $env:DATABASE_URL = $dbUrl
  npx prisma migrate deploy --schema $Schema
} finally {
  Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue

  foreach ($r in $renames) {
    if (Test-Path $r.bak) {
      if (Test-Path $r.orig) {
        Remove-Item $r.orig -Force
      }
      Rename-Item $r.bak $r.orig
    }
  }
}
