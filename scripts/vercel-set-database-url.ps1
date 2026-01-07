param(
  [ValidateSet('production','preview','development')]
  [string]$Environment = 'production',

  # Opcional: passe a URL diretamente como argumento
  [string]$DatabaseUrl = ''
)

$ErrorActionPreference = 'Stop'

function Is-ValidDbUrl([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return $false }
  return ($s.StartsWith('postgresql://') -or $s.StartsWith('postgres://'))
}

function Extract-DbUrl([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return '' }
  $pattern = '(postgres(?:ql)?://[^\s''"]+)'
  $m = [regex]::Match($s, $pattern)
  if ($m.Success) { return $m.Groups[1].Value }
  return ''
}

if (-not (Is-ValidDbUrl $DatabaseUrl)) {
  try {
    $clip = Get-Clipboard -Raw
  } catch {
    $clip = ''
  }

  $clipTrim = $clip.Trim()
  if (Is-ValidDbUrl $clipTrim) {
    $DatabaseUrl = $clipTrim
  } else {
    $extracted = Extract-DbUrl $clipTrim
    if (Is-ValidDbUrl $extracted) {
      $DatabaseUrl = $extracted
    }
  }
}

if (-not (Is-ValidDbUrl $DatabaseUrl)) {
  $candidateFiles = @('env1.txt', '.env.local', '.env')
  foreach ($f in $candidateFiles) {
    if (-not (Test-Path $f)) { continue }
    try {
      $content = Get-Content -Path $f -Raw
    } catch {
      continue
    }

    $extracted = Extract-DbUrl $content
    if (Is-ValidDbUrl $extracted) {
      $DatabaseUrl = $extracted
      break
    }
  }
}

if (-not (Is-ValidDbUrl $DatabaseUrl)) {
  Write-Host "DATABASE_URL inválido/ausente." -ForegroundColor Red
  Write-Host "Copie a connection string do Neon (Pooled ou Direct) para o clipboard OU cole em env1.txt (DATABASE_URL=...) e rode novamente." -ForegroundColor Yellow
  Write-Host "Exemplo: scripts/vercel-set-database-url.ps1 -Environment production" -ForegroundColor DarkGray
  exit 1
}

$tmp = New-TemporaryFile
try {
  Set-Content -Path $tmp -Value $DatabaseUrl -NoNewline -Encoding UTF8
  Get-Content $tmp | vercel env add DATABASE_URL $Environment --force --sensitive | Out-Host
  Write-Host "OK: DATABASE_URL atualizado na Vercel ($Environment)." -ForegroundColor Green
} finally {
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue
}
