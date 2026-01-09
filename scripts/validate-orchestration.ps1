param(
  [string]$BaseUrl = 'http://localhost:3000',
  [switch]$RequireAi
)

$ErrorActionPreference = 'Stop'

# Valida os 3 pontos (Brief semanal, Histórico pesquisável, Playbook de execução) via API.
# Pré-req:
# - App rodando em $BaseUrl
# - DATABASE_URL válido
# - Para brief com IA: GROQ_API_KEY (ou segredo groq_api_key)
# - Para brief/busca no plano FREE: precisa PRO/ELITE ou admin bypass em dev

function Invoke-JsonPost {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [Parameter(Mandatory=$true)][hashtable]$Body,
    [string]$CookieFile
  )

  $json = ($Body | ConvertTo-Json -Compress)

  $tmp = Join-Path $env:TEMP ("signalhack_validate_" + [Guid]::NewGuid().ToString('N') + ".json")
  try {
    [System.IO.File]::WriteAllText($tmp, $json, [System.Text.Encoding]::UTF8)

    $args = @('-s','-i','--max-time','25','-X','POST', $Url, '-H','content-type: application/json', '--data-binary', "@$tmp")
    if ($CookieFile) {
      $args += @('-c', $CookieFile, '-b', $CookieFile)
    }

    $output = @(& curl.exe @args 2>&1)
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
      throw "curl falhou ($exitCode) em POST ${Url}: $($output -join "`n")"
    }
    return $output
  } finally {
    Remove-Item -ErrorAction SilentlyContinue $tmp
  }
}

function Invoke-JsonPut {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [Parameter(Mandatory=$true)][hashtable]$Body,
    [string]$CookieFile
  )

  $json = ($Body | ConvertTo-Json -Compress)

  $tmp = Join-Path $env:TEMP ("signalhack_validate_" + [Guid]::NewGuid().ToString('N') + ".json")
  try {
    [System.IO.File]::WriteAllText($tmp, $json, [System.Text.Encoding]::UTF8)

    $args = @('-s','-i','--max-time','25','-X','PUT', $Url, '-H','content-type: application/json', '--data-binary', "@$tmp")
    if ($CookieFile) {
      $args += @('-c', $CookieFile, '-b', $CookieFile)
    }

    $output = @(& curl.exe @args 2>&1)
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
      throw "curl falhou ($exitCode) em PUT ${Url}: $($output -join "`n")"
    }
    return $output
  } finally {
    Remove-Item -ErrorAction SilentlyContinue $tmp
  }
}

function Invoke-Get {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [string]$CookieFile
  )

  $args = @('-s','-i','--max-time','25', $Url)
  if ($CookieFile) {
    $args += @('-c', $CookieFile, '-b', $CookieFile)
  }

  $output = @(& curl.exe @args 2>&1)
  $exitCode = $LASTEXITCODE
  if ($exitCode -ne 0) {
    throw "curl falhou ($exitCode) em GET ${Url}: $($output -join "`n")"
  }
  return $output
}

function Get-CurlBodyText {
  param(
    $CurlOutputLines
  )

  if (-not $CurlOutputLines) {
    return $null
  }

  $separatorIndex = ($CurlOutputLines | Select-String -Pattern '^\s*$' | Select-Object -First 1).LineNumber
  if (-not $separatorIndex) {
    return $null
  }

  $body = ($CurlOutputLines | Select-Object -Skip $separatorIndex) -join "`n"
  $body = $body.Trim()
  if (-not $body) {
    return $null
  }

  return $body
}

function Get-HttpStatusFromCurl {
  param(
    $CurlOutputLines
  )

  $statusLine = $CurlOutputLines | Where-Object { $_ -match '^HTTP/\S+\s+\d{3}' } | Select-Object -First 1
  if (-not $statusLine) { return $null }
  $m = [regex]::Match($statusLine, '^HTTP/\S+\s+(\d{3})')
  if ($m.Success) { return [int]$m.Groups[1].Value }
  return $null
}

$base = $BaseUrl.TrimEnd('/')
$cookie = Join-Path $PSScriptRoot 'validate.cookies.txt'
Remove-Item -ErrorAction SilentlyContinue $cookie

Write-Host "[1/7] health" -ForegroundColor Cyan
$health = Invoke-Get -Url "$base/api/health"
$health | Select-Object -First 20 | Out-Host

Write-Host "[2/7] login (captures cookie)" -ForegroundColor Cyan
$email = if ($env:SMOKE_TEST_EMAIL) { $env:SMOKE_TEST_EMAIL } else { $null }
$password = if ($env:SMOKE_TEST_PASSWORD) { $env:SMOKE_TEST_PASSWORD } else { $null }

if (-not $email -or -not $password) {
  throw "Defina SMOKE_TEST_EMAIL e SMOKE_TEST_PASSWORD para rodar validate-orchestration.ps1"
}

$login = Invoke-JsonPost -Url "$base/api/auth/login" -Body @{ email = $email; password = $password } -CookieFile $cookie
$login | Select-Object -First 30 | Out-Host

$loginStatus = Get-HttpStatusFromCurl -CurlOutputLines $login
$loginBody = Get-CurlBodyText -CurlOutputLines $login
if (-not $loginStatus) {
  throw "Login: não foi possível detectar status HTTP. Output=$($login -join "`n")"
}
if ($loginStatus -ge 400) {
  $hint = ""
  if ($loginBody -and $loginBody -match '<!DOCTYPE html>' -and $loginBody -match 'Unexpected end of JSON input') {
    $hint = "\nDica: isso costuma acontecer quando o Next dev fica com manifest em .next corrompido no Windows. Pare o dev, apague a pasta .next e suba de novo (npm run dev -- --port 3001)."
  }
  throw "Login falhou. Status=${loginStatus}. Body=$loginBody$hint"
}
if (-not (($login | Select-String -SimpleMatch 'set-cookie: em_session=' -ErrorAction SilentlyContinue) | Select-Object -First 1)) {
  throw "Login respondeu 200, mas não retornou set-cookie em_session. Verifique credenciais e o endpoint /api/auth/login."
}

Write-Host "[3/7] signals (base)" -ForegroundColor Cyan
$signalsRaw = Invoke-Get -Url "$base/api/signals" -CookieFile $cookie
$signalsRaw | Select-Object -First 30 | Out-Host

$signalsBody = Get-CurlBodyText -CurlOutputLines $signalsRaw
$signalsStatus = Get-HttpStatusFromCurl -CurlOutputLines $signalsRaw
if (-not $signalsBody) {
  throw "/api/signals retornou sem body"
}

$signalsJson = $signalsBody | ConvertFrom-Json
$firstSignal = $null
if ($signalsJson.PSObject.Properties.Name -contains 'signals') {
  if ($signalsJson.signals -and $signalsJson.signals.Count -ge 1) {
    $firstSignal = $signalsJson.signals[0]
  }
}

if (-not $firstSignal -or -not $firstSignal.id) {
  throw "Sem signals para validar. Status=${signalsStatus}. Tente seedar sinais ou gere via UI."
}

$signalId = [string]$firstSignal.id
$title = [string]$firstSignal.title
$word = ($title -split '\s+') | Where-Object { $_ -and $_.Length -ge 3 } | Select-Object -First 1
if (-not $word) { $word = 'growth' }

Write-Host "[4/7] search (q=)" -ForegroundColor Cyan
$searchRaw = Invoke-Get -Url "$base/api/signals?q=$([uri]::EscapeDataString($word))" -CookieFile $cookie
$searchRaw | Select-Object -First 30 | Out-Host
$searchStatus = Get-HttpStatusFromCurl -CurlOutputLines $searchRaw
$searchBody = Get-CurlBodyText -CurlOutputLines $searchRaw
if (-not $searchBody) { throw "/api/signals?q retornou sem body" }
$searchJson = $searchBody | ConvertFrom-Json

if ($searchStatus -eq 402) {
  Write-Host "Busca bloqueada por plano (402). OK se usuário estiver no FREE." -ForegroundColor Yellow
} elseif ($searchStatus -ge 400) {
  throw "Busca falhou. Status=${searchStatus}. Body=$searchBody"
} elseif (-not ($searchJson.PSObject.Properties.Name -contains 'signals')) {
  throw "Busca retornou JSON inesperado: $searchBody"
}

Write-Host "[5/7] weekly brief" -ForegroundColor Cyan
$briefRaw = Invoke-Get -Url "$base/api/brief" -CookieFile $cookie
$briefRaw | Select-Object -First 30 | Out-Host
$briefStatus = Get-HttpStatusFromCurl -CurlOutputLines $briefRaw
$briefBody = Get-CurlBodyText -CurlOutputLines $briefRaw
if (-not $briefBody) { throw "/api/brief retornou sem body" }

if ($briefStatus -eq 402) {
  Write-Host "Brief bloqueado por plano (402). OK se usuário estiver no FREE." -ForegroundColor Yellow
  if ($RequireAi) { throw "RequireAi ligado, mas brief está bloqueado por plano." }
} elseif ($briefStatus -eq 503) {
  $briefJson = $briefBody | ConvertFrom-Json
  if ($briefJson.error -eq 'ai_not_configured') {
    Write-Host "IA não configurada para brief (503 ai_not_configured)." -ForegroundColor Yellow
    if ($RequireAi) { throw "RequireAi ligado, mas IA não configurada." }
  } else {
    throw "Brief falhou (503). Body=$briefBody"
  }
} elseif ($briefStatus -ge 400) {
  throw "Brief falhou. Status=${briefStatus}. Body=$briefBody"
} else {
  $briefJson = $briefBody | ConvertFrom-Json
  if (-not ($briefJson.PSObject.Properties.Name -contains 'brief')) {
    throw "Brief retornou JSON inesperado: $briefBody"
  }
  Write-Host ("Brief: " + [string]$briefJson.brief.headline) -ForegroundColor DarkGray
}

Write-Host "[6/7] playbook (PUT)" -ForegroundColor Cyan
$hyp = "Hipótese: atacar '$word' deve aumentar conversas qualificadas em 7 dias."
$exp = "Experimento: (1) criar 1 landing + 1 oferta, (2) rodar 2 criativos, (3) 10 conversas com ICP, (4) registrar aprendizados." 
$met = "Métrica: 10 respostas qualificadas e 2 calls em 7 dias."

$putRaw = Invoke-JsonPut -Url "$base/api/playbooks" -Body @{ signalId = $signalId; hypothesis = $hyp; experiment = $exp; metric = $met } -CookieFile $cookie
$putRaw | Select-Object -First 30 | Out-Host
$putStatus = Get-HttpStatusFromCurl -CurlOutputLines $putRaw
$putBody = Get-CurlBodyText -CurlOutputLines $putRaw
if ($putStatus -ge 400) {
  throw "Playbook PUT falhou. Status=${putStatus}. Body=$putBody"
}

Write-Host "[7/7] playbook (GET)" -ForegroundColor Cyan
$getRaw = Invoke-Get -Url "$base/api/playbooks?signalId=$([uri]::EscapeDataString($signalId))" -CookieFile $cookie
$getRaw | Select-Object -First 30 | Out-Host
$getStatus = Get-HttpStatusFromCurl -CurlOutputLines $getRaw
$getBody = Get-CurlBodyText -CurlOutputLines $getRaw
if ($getStatus -ge 400) {
  throw "Playbook GET falhou. Status=${getStatus}. Body=$getBody"
}

$getJson = $getBody | ConvertFrom-Json
if (-not ($getJson.PSObject.Properties.Name -contains 'plan')) {
  throw "Playbook GET retornou JSON inesperado: $getBody"
}
if (-not $getJson.plan) {
  throw "Playbook GET retornou plan=null; esperado plano persistido"
}

Write-Host "\nValidação finalizada." -ForegroundColor Green
Write-Host ("SignalId: " + $signalId) -ForegroundColor DarkGray
Write-Host ("Busca q: " + $word + " (status=" + $searchStatus + ")") -ForegroundColor DarkGray
Write-Host ("Brief status: " + $briefStatus) -ForegroundColor DarkGray
