#!/bin/bash
# ============================================================
# TuAgenteStore — Deploy Script v2
# Ejecutar desde /opt/tuagentestore/ en el VPS
# ============================================================

set -euo pipefail

PROJECT_DIR="/opt/tuagentestore"
cd $PROJECT_DIR

echo "TuAgente Store — Deploy v2"
echo "================================"
date

# ── 1. Pull latest code ──
echo "[1/8] Actualizando código..."
git pull origin main 2>/dev/null || echo "  (no git repo — skip)"

# ── 2. Aplicar migraciones SQL pendientes ──
echo "[2/8] Aplicando migraciones de DB..."
for migration in ./database/migrations/*.sql; do
  migname=$(basename "$migration")
  echo "  Aplicando $migname..."
  docker compose exec -T postgres psql \
    -U "${POSTGRES_USER:-tuagentestore}" \
    -d "${POSTGRES_DB:-tuagentestore}" \
    < "$migration" \
    2>/dev/null && echo "    OK" || echo "    (ya aplicada o error — skip)"
done

# ── 3. Build app ──
echo "[3/8] Construyendo imagen Next.js..."
docker compose build app --no-cache

# ── 4. Levantar / actualizar todos los servicios ──
echo "[4/8] Levantando servicios (app + metabase)..."
# Limpiar contenedores detenidos para evitar conflictos de nombre en recreate
docker container prune -f > /dev/null 2>&1 || true
docker compose up -d --remove-orphans --force-recreate app
docker compose up -d --remove-orphans

# ── 5. Wait for app to be healthy ──
echo "[5/8] Esperando que la app esté lista..."
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

# ── 5b. Pre-calentar Redis cache ──
echo "[5b/8] Pre-calentando cache de Redis..."
curl -sf "http://localhost:3000/api/agents" > /dev/null \
  && echo "  /api/agents (all): OK" || echo "  /api/agents: FAILED (ignorado)"
curl -sf "http://localhost:3000/api/agents?featured=true" > /dev/null \
  && echo "  /api/agents?featured=true: OK" || echo "  /api/agents?featured=true: FAILED (ignorado)"

# ── 6. Aplicar seeds si hay nuevos ──
echo "[6/8] Ejecutando seeds de DB..."
if [ -f "./database/seeds/001_agents_fixed.sql" ]; then
  docker compose exec -T postgres psql \
    -U "${POSTGRES_USER:-tuagentestore}" \
    -d "${POSTGRES_DB:-tuagentestore}" \
    -f /backups/seeds/001_agents_fixed.sql \
    2>/dev/null && echo "  Seeds ejecutados." || echo "  Seeds ya aplicados (skip)."
fi

# ── 7. Recargar Caddy config ──
echo "[7/8] Recargando Caddy..."
docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile 2>/dev/null && echo "  Caddy: recargado" || echo "  Caddy: sin cambios"

# ── 8. Health check final ──
echo "[8/8] Verificación final..."

curl -sf http://localhost:3000/api/health > /dev/null  && echo "  App:      OK" || echo "  App:      FAILED"
curl -sf http://localhost:3001/api/health > /dev/null  && echo "  Metabase: OK" || echo "  Metabase: (iniciando — normal los primeros 2 min)"
curl -sf http://localhost:5678/healthz    > /dev/null  && echo "  n8n:      OK" || echo "  n8n:      FAILED"
docker compose exec -T postgres pg_isready > /dev/null && echo "  Postgres: OK" || echo "  Postgres: FAILED"
docker compose exec -T redis redis-cli ping > /dev/null && echo "  Redis:    OK" || echo "  Redis:    FAILED"

echo ""
echo "================================"
echo "Deploy completado: $(date)"
echo "  App:      https://${DOMAIN:-tuagentestore.com}"
echo "  BI:       https://app.${DOMAIN:-tuagentestore.com}"
echo "  n8n:      https://${N8N_SUBDOMAIN:-n8n}.${DOMAIN:-tuagentestore.com}"
echo "================================"
