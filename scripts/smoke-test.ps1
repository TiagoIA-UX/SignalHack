param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$Email,
  [string]$Password
)

$ErrorActionPreference = 'Stop'

# Smoke test end-to-end (sem vazar segredos)
# Pré-req:
# - App rodando em http://localhost:3000 (npm run dev)
# - DATABASE_URL válido configurado no ambiente/arquivo .env

function Invoke-JsonPost {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [Parameter(Mandatory=$true)][hashtable]$Body,
    [string]$CookieFile
  )

  $json = ($Body | ConvertTo-Json -Compress)

  $tmp = Join-Path $env:TEMP ("signalhack_smoke_" + [Guid]::NewGuid().ToString('N') + ".json")
  try {
    [System.IO.File]::WriteAllText($tmp, $json, [System.Text.Encoding]::UTF8)

    $curlArgs = @('-s','-i','--max-time','20','-X','POST', $Url, '-H','content-type: application/json', '--data-binary', "@$tmp")
    if ($CookieFile) {
      $curlArgs += @('-c', $CookieFile, '-b', $CookieFile)
    }

    $output = @(& curl.exe @curlArgs 2>&1)
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
      throw "curl falhou ($exitCode) em POST ${Url}: $($output -join "`n")"
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

  $curlArgs = @('-s','-i','--max-time','20', $Url)
  if ($CookieFile) {
    $curlArgs += @('-c', $CookieFile, '-b', $CookieFile)
  }

  $output = @(& curl.exe @curlArgs 2>&1)
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

  # curl -i retorna headers + body; separador é uma linha vazia.
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

function Redact-SessionCookie {
  param(
    $CurlOutputLines
  )
  if (-not $CurlOutputLines) { return $CurlOutputLines }
  return $CurlOutputLines | ForEach-Object {
    $_ -replace '^(set-cookie:\s*em_session=)[^;\s]+', '${1}[redacted]'
  }
}

$base = $BaseUrl
$cookie = Join-Path $PSScriptRoot 'smoke.cookies.txt'
Remove-Item -ErrorAction SilentlyContinue $cookie

Write-Host "[1/6] health" -ForegroundColor Cyan
$health = Invoke-Get -Url "$base/api/health"
$health | Select-Object -First 20 | Out-Host

Write-Host "[2/6] register" -ForegroundColor Cyan

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

$email = if ($Email) { $Email } elseif ($env:SMOKE_TEST_EMAIL) { $env:SMOKE_TEST_EMAIL } else { "smoke_" + [Guid]::NewGuid().ToString('N').Substring(0, 8) + "@example.com" }

# Password: prefer param > env. Se o email for fixo (via -Email ou SMOKE_TEST_EMAIL) e a senha não vier, pedir interativamente.
if ($Password) {
  $password = $Password
} elseif ($env:SMOKE_TEST_PASSWORD) {
  $password = $env:SMOKE_TEST_PASSWORD
} elseif ($Email -or $env:SMOKE_TEST_EMAIL) {
  $password = Read-PlaintextPassword
} else {
  $password = 'Password123!'
}

if (($Email -or $env:SMOKE_TEST_EMAIL) -and -not ($email -like 'smoke_*@example.com')) {
  Write-Host "(pulando register: usuário existente)" -ForegroundColor DarkGray
} else {
  $reg = Invoke-JsonPost -Url "$base/api/auth/register" -Body @{ email = $email; password = $password } -CookieFile $null
  $reg | Select-Object -First 30 | Out-Host
}

Write-Host "[3/6] login (captures cookie)" -ForegroundColor Cyan
$login = Invoke-JsonPost -Url "$base/api/auth/login" -Body @{ email = $email; password = $password } -CookieFile $cookie
(Redact-SessionCookie -CurlOutputLines $login) | Select-Object -First 30 | Out-Host

Write-Host "[4/6] me" -ForegroundColor Cyan
$me = Invoke-Get -Url "$base/api/auth/me" -CookieFile $cookie
$me | Select-Object -First 40 | Out-Host

Write-Host "[5/6] signals" -ForegroundColor Cyan
$signalsRaw = Invoke-Get -Url "$base/api/signals" -CookieFile $cookie
$signalsRaw | Select-Object -First 40 | Out-Host

# Tentar extrair um signalId do body
$signalsBody = Get-CurlBodyText -CurlOutputLines $signalsRaw
if ($signalsBody -and $signalsBody -match '^\s*[\{\[]') {
  try {
    $parsed = $signalsBody | ConvertFrom-Json
    $firstId = $null
    if ($parsed -is [System.Collections.IEnumerable] -and -not ($parsed -is [string])) {
      $firstId = $parsed[0].id
    } elseif ($parsed.PSObject.Properties.Name -contains 'signals') {
      $firstId = $parsed.signals[0].id
    }

    if ($firstId) {
      Write-Host "[6/6] insights (espera 402 no FREE; 200 no PRO)" -ForegroundColor Cyan
      $ins = Invoke-JsonPost -Url "$base/api/insights" -Body @{ signalId = $firstId } -CookieFile $cookie
      $ins | Select-Object -First 60 | Out-Host
    } else {
      Write-Host "[6/6] insights: sem signals para testar" -ForegroundColor Yellow
    }
  } catch {
    Write-Host "[6/6] insights: falhou parse JSON de /api/signals" -ForegroundColor Yellow
    Write-Host ("Body prefix: " + $signalsBody.Substring(0, [Math]::Min(200, $signalsBody.Length))) -ForegroundColor DarkGray
  }
} else {
  Write-Host "[6/6] insights: resposta de /api/signals sem JSON" -ForegroundColor Yellow
  if ($signalsBody) {
    Write-Host ("Body prefix: " + $signalsBody.Substring(0, [Math]::Min(200, $signalsBody.Length))) -ForegroundColor DarkGray
  }
}

Write-Host "\nSmoke test finalizado." -ForegroundColor Green
