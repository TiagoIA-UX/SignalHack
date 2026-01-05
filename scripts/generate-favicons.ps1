$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path (Split-Path -Parent $PSCommandPath) "..")
Set-Location -LiteralPath $root

function Write-IcoFromRgbaPixels {
  param(
    [Parameter(Mandatory)] [string] $Path,
    [int] $Size = 16,
    [Parameter(Mandatory)] [byte[]] $RgbaTopDown
  )

  if ($RgbaTopDown.Length -ne ($Size * $Size * 4)) {
    throw "RGBA buffer size mismatch"
  }

  $dibHeaderSize = 40
  $xorSize = $Size * $Size * 4
  $andStride = 4 # 16px -> 16 bits padded to 32 bits => 4 bytes
  $andSize = $andStride * $Size
  $imageSize = $dibHeaderSize + $xorSize + $andSize

  $fileSize = 22 + $imageSize
  $bytes = New-Object byte[] $fileSize

  # ICONDIR
  $bytes[2] = 1; $bytes[4] = 1

  # ICONDIRENTRY
  $bytes[6] = [byte]$Size
  $bytes[7] = [byte]$Size
  $bytes[10] = 1 # planes
  $bytes[12] = 32 # bpp

  [BitConverter]::GetBytes([int]$imageSize).CopyTo($bytes, 14)
  [BitConverter]::GetBytes([int]22).CopyTo($bytes, 18)

  $offset = 22

  # BITMAPINFOHEADER
  [BitConverter]::GetBytes([int]40).CopyTo($bytes, $offset + 0)
  [BitConverter]::GetBytes([int]$Size).CopyTo($bytes, $offset + 4)
  [BitConverter]::GetBytes([int]($Size * 2)).CopyTo($bytes, $offset + 8) # height includes mask
  [BitConverter]::GetBytes([short]1).CopyTo($bytes, $offset + 12)
  [BitConverter]::GetBytes([short]32).CopyTo($bytes, $offset + 14)
  [BitConverter]::GetBytes([int]0).CopyTo($bytes, $offset + 16) # BI_RGB
  [BitConverter]::GetBytes([int]$xorSize).CopyTo($bytes, $offset + 20)

  # XOR bitmap (BGRA, bottom-up)
  $xorOffset = $offset + 40
  for ($y = 0; $y -lt $Size; $y++) {
    for ($x = 0; $x -lt $Size; $x++) {
      $srcY = $y
      $dstY = ($Size - 1 - $y)
      $srcIndex = (($srcY * $Size + $x) * 4)
      $dstIndex = $xorOffset + (($dstY * $Size + $x) * 4)

      $r = $RgbaTopDown[$srcIndex + 0]
      $g = $RgbaTopDown[$srcIndex + 1]
      $b = $RgbaTopDown[$srcIndex + 2]
      $a = $RgbaTopDown[$srcIndex + 3]

      $bytes[$dstIndex + 0] = $b
      $bytes[$dstIndex + 1] = $g
      $bytes[$dstIndex + 2] = $r
      $bytes[$dstIndex + 3] = $a
    }
  }

  # AND mask (all 0 => opaque)
  $andOffset = $xorOffset + $xorSize
  for ($i = 0; $i -lt $andSize; $i++) { $bytes[$andOffset + $i] = 0 }

  [IO.File]::WriteAllBytes($Path, $bytes)
}

function New-RgbaIcon16 {
  $size = 16
  $buf = New-Object byte[] ($size * $size * 4)

  function SetPixel([int]$x, [int]$y, [byte]$r, [byte]$g, [byte]$b, [byte]$a = 255) {
    if ($x -lt 0 -or $y -lt 0 -or $x -ge $size -or $y -ge $size) { return }
    $i = (($y * $size + $x) * 4)
    $buf[$i + 0] = $r
    $buf[$i + 1] = $g
    $buf[$i + 2] = $b
    $buf[$i + 3] = $a
  }

  # background #0B0F14
  for ($y=0; $y -lt $size; $y++) {
    for ($x=0; $x -lt $size; $x++) {
      SetPixel $x $y 11 15 20 255
    }
  }

  # stylized S (light zinc)
  $fr=229; $fg=231; $fb=235

  # top bar
  for ($x=4; $x -le 11; $x++) { SetPixel $x 4 $fr $fg $fb; SetPixel $x 5 $fr $fg $fb }
  # left connector
  for ($y=6; $y -le 7; $y++) { SetPixel 4 $y $fr $fg $fb; SetPixel 5 $y $fr $fg $fb }
  # mid bar
  for ($x=4; $x -le 10; $x++) { SetPixel $x 8 $fr $fg $fb; SetPixel $x 9 $fr $fg $fb }
  # right connector
  for ($y=10; $y -le 11; $y++) { SetPixel 10 $y $fr $fg $fb; SetPixel 11 $y $fr $fg $fb }
  # bottom bar
  for ($x=5; $x -le 11; $x++) { SetPixel $x 12 $fr $fg $fb; SetPixel $x 13 $fr $fg $fb }

  return $buf
}

$public = Join-Path (Get-Location) 'public'
New-Item -ItemType Directory -Force -Path $public | Out-Null

$rgba16 = New-RgbaIcon16
Write-IcoFromRgbaPixels -Path (Join-Path $public 'favicon.ico') -Size 16 -RgbaTopDown $rgba16

# apple-touch-icon.png: if System.Drawing is available, render a larger PNG; otherwise skip.
try {
  Add-Type -AssemblyName System.Drawing
  $bmp = New-Object System.Drawing.Bitmap 180,180,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $bg = [System.Drawing.ColorTranslator]::FromHtml('#0B0F14')
  $g.Clear($bg)

  $penMain = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#E5E7EB'), 18)
  $penMain.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penMain.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $penSub = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#94A3B8'), 16)
  $penSub.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $penSub.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddLine(48,58, 120,58)
  $path.AddBezier(120,58, 140,58, 140,88, 120,88)
  $path.AddLine(120,88, 84,88)
  $path.AddBezier(84,88, 64,88, 64,120, 84,120)
  $path.AddLine(84,120, 132,120)

  $g.DrawPath($penMain, $path)
  $g.DrawLine($penSub, 48, 140, 92, 140)

  $out = Join-Path $public 'apple-touch-icon.png'
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
} catch {
  Write-Host "System.Drawing not available; skipped apple-touch-icon.png"
}

Write-Host 'Done.'
