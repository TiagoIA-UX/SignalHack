param(
  [int]$Port = 3001,
  [switch]$RequireAi
)

$ErrorActionPreference = 'Stop'

# Sobe o dev server na porta informada, aguarda /api/health, roda validação e encerra o processo.
# Pré-req: SMOKE_TEST_EMAIL e SMOKE_TEST_PASSWORD no ambiente.

$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$baseUrl = "http://localhost:$Port"
$healthUrl = "$baseUrl/api/health"

function Wait-ForHealth {
  param(
    [string]$Url,
    [int]$TimeoutSeconds = 60
  )

  $start = Get-Date
  while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSeconds) {
    try {
      $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($r.StatusCode -eq 200) { return $true }
    } catch {
      Start-Sleep -Milliseconds 800
    }
  }
  return $false
}

Write-Host "Starting dev server on port $Port..." -ForegroundColor Cyan
Push-Location $repo

# Start Next dev as background process
$dev = Start-Process -FilePath "npm.cmd" -ArgumentList @("run","dev","--","--port", "$Port") -PassThru -WindowStyle Hidden

try {
  Write-Host "Waiting for health: $healthUrl" -ForegroundColor Cyan
  if (-not (Wait-ForHealth -Url $healthUrl -TimeoutSeconds 90)) {
    throw "Dev server did not become healthy in time: $healthUrl"
  }

  Write-Host "Running orchestration validation..." -ForegroundColor Cyan
  if ($RequireAi) {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repo 'scripts\validate-orchestration.ps1') -BaseUrl $baseUrl -RequireAi
  } else {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repo 'scripts\validate-orchestration.ps1') -BaseUrl $baseUrl
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Validation failed with exit code $LASTEXITCODE"
  }

  Write-Host "Done." -ForegroundColor Green
} finally {
  if ($dev -and -not $dev.HasExited) {
    Write-Host "Stopping dev server (PID=$($dev.Id))" -ForegroundColor DarkGray
    Stop-Process -Id $dev.Id -Force -ErrorAction SilentlyContinue
  }
  Pop-Location
}
