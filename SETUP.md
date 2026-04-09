# TuAgenteStore — Guía de Despliegue en VPS

## Requisitos previos
- VPS Hostinger KVM4 (4vCPU / 16GB RAM) — IP: `89.116.115.113`
- DNS configurado: `tuagentestore.com` → `89.116.115.113` (A record)
- DNS configurado: `auto.tuagentestore.com` → `89.116.115.113` (A record)
- Acceso SSH como `root`

---

## PASO 1 — Configuración inicial del servidor

```bash
# Conectarse al VPS
ssh root@89.116.115.113

# Subir el script de hardening (desde tu máquina local)
scp vps-setup.sh root@89.116.115.113:/root/

# Ejecutar en el VPS
chmod +x /root/vps-setup.sh
bash /root/vps-setup.sh
```

El script instala Docker, crea el usuario `deploy`, configura UFW (firewall), fail2ban, swap de 4GB y cambia el puerto SSH a **2222**.

**Reconectarse después del script:**
```bash
ssh -p 2222 deploy@89.116.115.113
```

---

## PASO 2 — Subir archivos al servidor

Desde tu máquina local:

```bash
# Crear estructura en el servidor
ssh -p 2222 deploy@89.116.115.113 "mkdir -p /home/deploy/tuagentestore/{caddy,database/seeds}"

# Subir todos los archivos de una vez
scp -P 2222 -r \
  docker-compose.yml \
  Caddyfile \
  schema.sql \
  deploy.sh \
  database/seeds/001_agents.sql \
  deploy@89.116.115.113:/home/deploy/tuagentestore/

# Subir la carpeta app (código Next.js)
scp -P 2222 -r app/ deploy@89.116.115.113:/home/deploy/tuagentestore/app/
```

---

## PASO 3 — Crear el archivo .env

En el servidor:

```bash
cd /home/deploy/tuagentestore
cp env.example .env   # si subiste env.example, o créalo directamente
nano .env
```

Variables **mínimas para arrancar** (P0):

```bash
NODE_ENV=production
DOMAIN=tuagentestore.com
APP_URL=https://tuagentestore.com
NEXT_PUBLIC_APP_URL=https://tuagentestore.com
N8N_SUBDOMAIN=auto
N8N_WEBHOOK_BASE=https://auto.tuagentestore.com

POSTGRES_USER=tuagentestore
POSTGRES_PASSWORD=$(openssl rand -hex 32)   # ← ejecutar y pegar el valor
POSTGRES_DB=tuagentestore
DATABASE_URL=postgresql://tuagentestore:TU_PASSWORD@postgres:5432/tuagentestore

REDIS_URL=redis://redis:6379

JWT_SECRET=$(openssl rand -hex 64)           # ← ejecutar y pegar el valor
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
BCRYPT_ROUNDS=12

N8N_AUTH_USER=admin
N8N_AUTH_PASSWORD=TU_PASSWORD_N8N_SEGURO

ENCRYPTION_KEY=$(openssl rand -hex 32)       # ← ejecutar y pegar el valor
WEBHOOK_SECRET_INTERNAL=$(openssl rand -hex 32)
```

Variables **necesarias para demo funcional** (P1):

```bash
OPENAI_API_KEY=sk-...
OPENAI_DEFAULT_MODEL=gpt-4o-mini
```

Variables **para emails y Sheets** (P2):

```bash
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REFRESH_TOKEN=1//...
GMAIL_FROM=hola@tuagentestore.com
GMAIL_FROM_NAME=TuAgente Store
ADMIN_EMAIL=admin@tuagentestore.com
GOOGLE_SPREADSHEET_ID=...
GOOGLE_CALENDAR_ID=...
```

**Cómo obtener las credenciales de Google OAuth:**
1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto → APIs & Services → Enable: Gmail API, Sheets API, Calendar API
3. OAuth 2.0 Credentials → Web application
4. Authorized redirect URIs: `https://developers.google.com/oauthplayground`
5. Ir a [OAuth Playground](https://developers.google.com/oauthplayground), configurar con tu Client ID/Secret
6. Scope: `https://mail.google.com/ https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar`
7. Exchange authorization code → copiar `refresh_token`

---

## PASO 4 — Primer arranque

```bash
cd /home/deploy/tuagentestore

# Dar permisos al script de deploy
chmod +x deploy.sh

# Arrancar (primera vez — ejecuta schema + seeds automáticamente)
bash deploy.sh
```

El script `deploy.sh`:
1. Ejecuta `docker compose pull` + `docker compose up -d`
2. Espera a que PostgreSQL esté healthy
3. Ejecuta `schema.sql` (crea todas las tablas)
4. Ejecuta `database/seeds/001_agents.sql` (carga los 6 agentes)
5. Verifica health endpoint

**Verificar que todo funciona:**
```bash
# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f app

# Verificar health endpoint
curl https://tuagentestore.com/api/health
# Esperado: {"status":"ok","db":"ok","redis":"ok"}
```

---

## PASO 5 — Crear usuario admin

```bash
# Acceder a PostgreSQL
docker compose exec postgres psql -U tuagentestore -d tuagentestore

-- Crear tenant admin
INSERT INTO tenants (name, slug, plan, status)
VALUES ('TuAgenteStore Admin', 'admin', 'enterprise', 'active')
RETURNING id;

-- Usar el ID del tenant devuelto (ej: 'abc123...')
-- Generar hash de contraseña con bcrypt rounds=12
-- Puedes usar: node -e "const b=require('bcryptjs');console.log(b.hashSync('TU_PASSWORD',12))"

INSERT INTO users (tenant_id, email, password_hash, full_name, role)
VALUES (
  'ID_DEL_TENANT_DEVUELTO',
  'admin@tuagentestore.com',
  'HASH_DE_BCRYPT',
  'Admin TuAgenteStore',
  'admin'
);

\q
```

**Forma más fácil — usar el endpoint de registro:**
```bash
curl -X POST https://tuagentestore.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@tuagentestore.com","password":"TuPassword123","company":"TuAgenteStore"}'

# Luego actualizar el rol manualmente:
docker compose exec postgres psql -U tuagentestore -d tuagentestore \
  -c "UPDATE users SET role='admin' WHERE email='admin@tuagentestore.com';"
```

---

## PASO 6 — Configurar n8n

1. Ir a `https://auto.tuagentestore.com`
2. Login con `N8N_AUTH_USER` / `N8N_AUTH_PASSWORD` del `.env`
3. Importar los workflows desde `n8n-workflows/`:
   - `workflow-01-lead-created.json`
   - `workflow-02-demo-started.json`
   - `workflow-03-demo-completed.json`
   - `workflow-04-reservation-created.json`
4. En cada workflow, configurar las credenciales de Google (OAuth2)
5. Activar cada workflow con el toggle

---

## PASO 7 — Monitoreo

**UptimeRobot (gratis):**
1. Crear cuenta en [uptimerobot.com](https://uptimerobot.com)
2. Add Monitor → HTTP(s)
3. URL: `https://tuagentestore.com/api/health`
4. Interval: 5 minutes
5. Alert: email + SMS

---

## Comandos útiles post-deploy

```bash
# Reiniciar la app
docker compose restart app

# Ver logs de la app
docker compose logs -f app

# Ver logs de n8n
docker compose logs -f n8n

# Actualizar la app (después de cambios)
cd /home/deploy/tuagentestore
docker compose build app
docker compose up -d app

# Backup manual de PostgreSQL
docker compose exec pg-backup /backup.sh

# Acceder a PostgreSQL
docker compose exec postgres psql -U tuagentestore -d tuagentestore

# Ver todas las reservas
docker compose exec postgres psql -U tuagentestore -d tuagentestore \
  -c "SELECT id, user_name, user_email, status, created_at FROM reservations ORDER BY created_at DESC LIMIT 20;"
```

---

## Troubleshooting

**App no responde:**
```bash
docker compose logs app --tail=50
# Si hay error de DB: verificar DATABASE_URL en .env
# Si hay error de build: docker compose build app --no-cache
```

**Caddy no obtiene SSL:**
```bash
docker compose logs caddy --tail=30
# Verificar que el DNS apunte al VPS (puede tardar hasta 24h en propagarse)
# Verificar puertos 80/443 abiertos: sudo ufw status
```

**n8n no recibe webhooks:**
```bash
# Verificar que el subdomain auto. apunte al VPS
nslookup auto.tuagentestore.com
# Verificar WEBHOOK_SECRET_INTERNAL coincide en .env y en los workflows
```

**PostgreSQL lleno de conexiones:**
```bash
docker compose exec postgres psql -U tuagentestore -d tuagentestore \
  -c "SELECT count(*) FROM pg_stat_activity;"
# Si > 90 conexiones, reiniciar la app
docker compose restart app
```
