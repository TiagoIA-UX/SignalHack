param(
  [string[]]$Needles = @(
    'Senha=#',
    'Aurelius',
    'APP_USR-',
    'gsk_',
    'SG_',
    'BEGIN RSA PRIVATE KEY',
    'BEGIN OPENSSH PRIVATE KEY'
  )
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

$foundAny = $false

foreach ($needle in $Needles) {
  Write-Host "--- scanning tracked files for: $needle"
  $output = git grep -n -F -- $needle 2>$null
  if ($LASTEXITCODE -eq 0 -and $output) {
    $foundAny = $true
    $output | ForEach-Object { Write-Host $_ }
  } elseif ($LASTEXITCODE -eq 1) {
    Write-Host 'OK: not found'
  } else {
    Write-Host 'WARN: git grep returned unexpected status'
  }
}

if ($foundAny) {
  Write-Error 'Security scan failed: potential secrets found in tracked files.'
}

Write-Host 'Security scan OK: no known secret patterns found in tracked files.'
