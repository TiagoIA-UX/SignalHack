param(
  [ValidateSet('production','preview','development')]
  [string]$Environment = 'production'
)

$ErrorActionPreference = 'Stop'

function Read-PlainText([string]$Prompt, [bool]$Sensitive) {
  if ($Sensitive) {
    $sec = Read-Host -Prompt $Prompt -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
  }

  return Read-Host -Prompt $Prompt
}

Write-Host "Configurando env vars na Vercel ($Environment)." -ForegroundColor Cyan
Write-Host "Dica: cole valores aqui no terminal; nada será gravado em arquivo." -ForegroundColor DarkGray

$vars = @(
  @{ Name = 'DATABASE_URL'; Sensitive = $true;  Help = 'Cole a connection string do Neon (idealmente POOLED para o app).'; },
  @{ Name = 'AUTH_SECRET'; Sensitive = $true;  Help = 'Gere um segredo forte (>= 32 chars; recomendado 48+).'; },
  @{ Name = 'AUTH_TOKEN_PEPPER'; Sensitive = $true; Help = 'Gere um segredo forte (>= 16 chars).'; },
  @{ Name = 'APP_URL'; Sensitive = $false; Help = 'URL pública do app na Vercel, ex: https://signal-hack.vercel.app'; },
  @{ Name = 'ADMIN_EMAIL'; Sensitive = $false; Help = 'Email que será promovido para ADMIN automaticamente.'; }
)

foreach ($v in $vars) {
  Write-Host "" 
  Write-Host ("{0}: {1}" -f $v.Name, $v.Help) -ForegroundColor Yellow
  $value = Read-PlainText -Prompt ("Informe {0}" -f $v.Name) -Sensitive ([bool]$v.Sensitive)
  if ([string]::IsNullOrWhiteSpace($value)) {
    Write-Host ("Pulando {0} (valor vazio)." -f $v.Name) -ForegroundColor DarkYellow
    continue
  }

  $tmp = New-TemporaryFile
  try {
    Set-Content -Path $tmp -Value $value -NoNewline -Encoding UTF8
    if ($v.Sensitive) {
      Get-Content $tmp | vercel env add $v.Name $Environment --force --sensitive | Out-Host
    } else {
      Get-Content $tmp | vercel env add $v.Name $Environment --force | Out-Host
    }
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "" 
Write-Host "Pronto. Agora rode: vercel --prod" -ForegroundColor Green
Write-Host "E depois aplique migrações: npx prisma migrate deploy" -ForegroundColor Green
