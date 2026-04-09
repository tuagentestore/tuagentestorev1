# ============================================================
# TuAgenteStore — Generar zip para subir a Hostinger
# Ejecutar desde: Tu Agente Store\v1\
# Resultado: tuagentestore-deploy.zip (en el escritorio)
# ============================================================
#
# Usa git archive → incluye solo archivos commiteados (excluye .env, node_modules, etc.)
# Para incluir cambios nuevos, hacer git commit antes de ejecutar esto.
# ============================================================

$output = "$env:USERPROFILE\Desktop\tuagentestore-deploy.zip"

Write-Host "Generando paquete de deploy para Hostinger..." -ForegroundColor Cyan
Write-Host "Fuente: commits de git (sin .env, sin node_modules)" -ForegroundColor Gray

# Verificar que estamos en el repo
if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Ejecutar desde la carpeta raiz del repo (donde esta .git)" -ForegroundColor Red
    exit 1
}

# Eliminar zip anterior
if (Test-Path $output) {
    Remove-Item $output -Force
    Write-Host "Zip anterior eliminado." -ForegroundColor Gray
}

# Crear zip via git archive (rapido y limpio)
git archive --format=zip --output="$output" HEAD

if ($LASTEXITCODE -eq 0) {
    $size = [math]::Round((Get-Item $output).Length / 1KB, 0)
    Write-Host ""
    Write-Host "ZIP CREADO: $output ($size KB)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Subir tuagentestore-deploy.zip a Hostinger File Manager"
    Write-Host "  2. Extraer en /home/deploy/tuagentestore/"
    Write-Host "  3. SSH: ssh deploy@89.116.115.113 -p 2222"
    Write-Host "  4. cd /home/deploy/tuagentestore && cp env.example .env"
    Write-Host "  5. nano .env  (completar variables)"
    Write-Host "  6. bash deploy.sh"
    Write-Host ""
    Write-Host "Ver SETUP.md para la guia completa." -ForegroundColor Gray
} else {
    Write-Host "ERROR al crear el zip. Verificar que git esta instalado." -ForegroundColor Red
}
