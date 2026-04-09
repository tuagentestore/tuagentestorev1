# ============================================================
# TuAgenteStore — Generar zip para subir a Hostinger
# Ejecutar desde: Tu Agente Store\v1\
# Resultado: tuagentestore-deploy.zip (en el escritorio)
# ============================================================

Write-Host "📦 Generando paquete de deploy para Hostinger..." -ForegroundColor Cyan

$source = $PSScriptRoot
$output = "$env:USERPROFILE\Desktop\tuagentestore-deploy.zip"

# Eliminar zip anterior si existe
if (Test-Path $output) {
    Remove-Item $output -Force
    Write-Host "  🗑 Zip anterior eliminado" -ForegroundColor Gray
}

# Archivos y carpetas a EXCLUIR
$excludePatterns = @(
    "*.env",
    "*.env.local",
    ".env*",
    "node_modules",
    ".next",
    ".git",
    "catharsis-ia.zip",
    "*.docx",
    "*.dump",
    "*.backup",
    "pgdata",
    "redisdata",
    "build-deploy-zip.ps1"
)

# Crear directorio temporal
$tempDir = "$env:TEMP\tuagentestore-deploy"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "  📁 Copiando archivos..." -ForegroundColor Gray

# Copiar archivos relevantes
$itemsToCopy = @(
    "app",
    "database",
    "n8n-workflows",
    "Caddyfile",
    "docker-compose.yml",
    "Dockerfile",
    "env.example",
    "schema.sql",
    "deploy.sh",
    "vps-setup.sh",
    "setup-sheets.gs",
    "SETUP.md",
    "DEV-LOCAL.md",
    "API_ROUTES_REFERENCE.js",
    "WORKFLOWS_REFERENCE.md"
)

foreach ($item in $itemsToCopy) {
    $fullPath = Join-Path $source $item
    if (Test-Path $fullPath) {
        $dest = Join-Path $tempDir $item
        if ((Get-Item $fullPath).PSIsContainer) {
            # Es una carpeta — copiar excluyendo node_modules y .next
            Copy-Item $fullPath $dest -Recurse -Force
            # Eliminar node_modules y .next si se copiaron
            @("$dest\node_modules", "$dest\.next", "$dest\.env.local") | ForEach-Object {
                if (Test-Path $_) { Remove-Item $_ -Recurse -Force }
            }
        } else {
            Copy-Item $fullPath $dest -Force
        }
        Write-Host "    ✓ $item" -ForegroundColor Green
    } else {
        Write-Host "    ⚠ No encontrado: $item" -ForegroundColor Yellow
    }
}

# Crear .env.example con instrucciones claras
$envNote = @"
# ============================================================
# INSTRUCCIONES: Renombrar este archivo a .env y completar
# Ver SETUP.md para guía completa de deployment
# ============================================================

# Copiar desde env.example y completar todos los valores
# Comandos útiles para generar secretos en el VPS:
#   openssl rand -hex 64   → para JWT_SECRET
#   openssl rand -hex 32   → para POSTGRES_PASSWORD, ENCRYPTION_KEY
"@
$envNote | Out-File -FilePath "$tempDir\LEER-PRIMERO.txt" -Encoding UTF8

# Comprimir
Write-Host "`n  🗜 Comprimiendo..." -ForegroundColor Gray
Compress-Archive -Path "$tempDir\*" -DestinationPath $output -Force

# Limpiar temp
Remove-Item $tempDir -Recurse -Force

# Resultado
$zipSize = [math]::Round((Get-Item $output).Length / 1MB, 2)
Write-Host "`n✅ Zip generado exitosamente!" -ForegroundColor Green
Write-Host "   📍 Ubicación: $output" -ForegroundColor White
Write-Host "   📦 Tamaño: ${zipSize} MB" -ForegroundColor White
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Subir tuagentestore-deploy.zip a Hostinger (File Manager o hPanel)" -ForegroundColor White
Write-Host "  2. En Hostinger: extraer en /home/deploy/tuagentestore/" -ForegroundColor White
Write-Host "  3. SSH al VPS: ssh deploy@89.116.115.113 -p 2222" -ForegroundColor White
Write-Host "  4. cd /home/deploy/tuagentestore && cp env.example .env && nano .env" -ForegroundColor White
Write-Host "  5. bash deploy.sh" -ForegroundColor White
Write-Host ""
Write-Host "Ver SETUP.md para la guía completa." -ForegroundColor Gray
