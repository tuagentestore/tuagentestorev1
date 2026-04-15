#!/bin/bash
# ============================================================
# TuAgenteStore — Deploy Script
# Ejecutar desde /home/deploy/tuagentestore/ en el VPS
# Requiere: docker compose corriendo, .env completo
# ============================================================

set -euo pipefail

PROJECT_DIR="/root/tuagentestore"
cd $PROJECT_DIR

echo "TuAgente Store — Deploy"
echo "================================"

# ── 1. Pull latest code ──
echo "[1/6] Actualizando código..."
git pull origin main 2>/dev/null || echo "  (no git repo — skip)"

# ── 2. Build app ──
echo "[2/6] Construyendo imagen Next.js..."
docker compose build app --no-cache

# ── 3. Restart app service ──
echo "[3/6] Reiniciando servicio app..."
docker compose up -d app

# ── 4. Wait for app to be healthy ──
echo "[4/6] Esperando que la app esté lista..."
RETRIES=30
until curl -sf http://localhost:3000/api/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ $RETRIES -eq 0 ]; then
    echo "ERROR: La app no respondió después de 60 segundos"
    docker compose logs app --tail=50
    exit 1
  fi
  sleep 2
done
echo "  App saludable."

# ── 5. Run seeds if needed ──
echo "[5/6] Ejecutando seeds de DB..."
if [ -f "./database/seeds/001_agents.sql" ]; then
  docker compose exec -T postgres psql \
    -U "${POSTGRES_USER:-tuagentestore}" \
    -d "${POSTGRES_DB:-tuagentestore}" \
    -f /backups/seeds/001_agents.sql \
    2>/dev/null && echo "  Seeds ejecutados." || echo "  Seeds ya aplicados (skip)."
fi

# ── 6. Health check final ──
echo "[6/6] Verificación final..."

if curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "  App (local): OK"
else
    echo "  App (local): FAILED"
fi

if curl -sf http://localhost:5678/healthz > /dev/null; then
    echo "  n8n: OK"
else
    echo "  n8n: FAILED"
fi

if docker compose exec -T postgres pg_isready > /dev/null; then
    echo "  Postgres: OK"
else
    echo "  Postgres: FAILED"
fi

echo ""
echo "================================"
echo "Deploy completado: $(date)"
echo "  URL: https://${DOMAIN:-tuagentestore.com}"
echo "  n8n: https://${N8N_SUBDOMAIN:-auto}.${DOMAIN:-tuagentestore.com}"
echo "================================"
