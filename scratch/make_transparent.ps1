Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\ECC\.gemini\antigravity\brain\70526322-014f-4e7b-a106-727c1e336df0\zahrat_beesan_logo_stamp_1783254638725.jpg"
$destPath = "C:\Users\ECC\.gemini\antigravity\brain\70526322-014f-4e7b-a106-727c1e336df0\zahrat_beesan_logo_stamp_transparent.png"

$bmp = New-Object System.Drawing.Bitmap($srcPath)
$width = $bmp.Width
$height = $bmp.Height

$newBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $pixelColor = $bmp.GetPixel($x, $y)
        # Check if the pixel is near-white (background)
        # Using a threshold of 210 for R, G, B to catch off-whites as well
        if ($pixelColor.R -gt 210 -and $pixelColor.G -gt 210 -and $pixelColor.B -gt 210) {
            # Make fully transparent
            $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Retain color, make it solid
            $newBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $pixelColor.R, $pixelColor.G, $pixelColor.B))
        }
    }
}

$newBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$newBmp.Dispose()
Write-Host "Transparent stamp created successfully!"
