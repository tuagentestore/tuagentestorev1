# Cómo ver el frontend en tu PC (sin VPS)

## PARTE 1 — Preparar Google Sheets (5 min)

### Paso 1.1 — Crear el Sheet con el script

1. Ir a **[script.google.com](https://script.google.com)**
2. Click **"Nuevo proyecto"**
3. Borrar el código que aparece
4. Abrir el archivo `setup-sheets.gs` (está en `Tu Agente Store/v1/`)
5. Pegar todo el contenido en el editor
6. Click en el menú **"Ejecutar"** → seleccionar función **`setupAll`**
7. Autorizar permisos cuando lo pida (Click "Revisar permisos" → elegir tu cuenta → "Permitir")
8. Esperar ~30 segundos
9. Click en **"Ver → Registros de ejecución"**

Vas a ver algo como:
```
✅ SETUP COMPLETADO
📊 Spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SPREADSHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
```

### Paso 1.2 — Copiar el Spreadsheet ID al .env.local

Abrir: `Tu Agente Store/v1/app/.env.local`

Reemplazar:
```
GOOGLE_SPREADSHEET_ID=COMPLETAR_CON_ID_DEL_SHEET
```
Con el ID del log (el número largo entre las `/d/` de la URL).

### Paso 1.3 — Obtener el ID del Google Calendar

1. Ir a **[calendar.google.com](https://calendar.google.com)**
2. En el panel izquierdo → Click en los **3 puntos** del calendario que quieras usar
3. Seleccionar **"Configuración y uso compartido"**
4. Bajar hasta **"Integración del calendario"**
5. Copiar el **"ID del calendario"** (ejemplo: `c_abc123@group.calendar.google.com`)

Pegar en `.env.local`:
```
GOOGLE_CALENDAR_ID=tu-id@group.calendar.google.com
```

---

## PARTE 2 — Instalar Node.js (3 min)

Node.js **no está instalado** en esta PC. Necesitás instalarlo para correr Next.js.

### Paso 2.1 — Descargar Node.js

Ir a: **[nodejs.org/en/download](https://nodejs.org/en/download)**

Descargar: **"Windows Installer (.msi)" → versión LTS (v22.x)**

### Paso 2.2 — Instalar

1. Ejecutar el `.msi` descargado
2. Click "Next" en todo — opciones por defecto están bien
3. En la pantalla "Tools for Native Modules" → **dejar el checkbox marcado** (instala también Chocolatey y Python, necesarios para algunos paquetes)
4. Finish

### Paso 2.3 — Verificar instalación

Abrir **PowerShell** o **Terminal** (Win+R → `powershell`) y ejecutar:
```powershell
node --version
npm --version
```

Debería mostrar algo como:
```
v22.11.0
10.9.0
```

---

## PARTE 3 — Instalar dependencias y levantar la app (2 min)

### Paso 3.1 — Abrir terminal en la carpeta app

Opción A — Desde el explorador de Windows:
1. Navegar a: `Tu Agente Store\v1\app\`
2. Click en la barra de direcciones → escribir `powershell` → Enter

Opción B — Desde VS Code (si tenés el proyecto abierto):
1. Terminal → Nueva Terminal
2. `cd "c:\Users\BRIAN\Desktop\Martin All\Marketplaces IA\Tu Agente Store\v1\app"`

### Paso 3.2 — Instalar paquetes

```powershell
npm install
```

Primera vez tarda ~2 minutos. Vas a ver un montón de texto. Normal.

Si sale algún warning sobre `peer dependencies` → ignorar, no es error.

### Paso 3.3 — Levantar el servidor de desarrollo

```powershell
npm run dev
```

Vas a ver:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready in 2.3s
```

---

## PARTE 4 — Abrir el frontend en el navegador

Con el servidor corriendo, abrir en el navegador:

| Página | URL |
|---|---|
| **Landing (Home)** | http://localhost:3000 |
| **Catálogo de agentes** | http://localhost:3000/agents |
| **Login** | http://localhost:3000/login |
| **Registro** | http://localhost:3000/register |
| **Dashboard** | http://localhost:3000/dashboard (requiere login) |
| **Admin** | http://localhost:3000/admin (requiere login admin) |

> **Nota:** Las páginas de Dashboard y Admin van a mostrar "Cargando..." o redirigir a login porque no hay DB local. El **landing, catálogo, login y registro se ven completos** sin DB.

---

## PARTE 5 — Ver las páginas que necesitan DB (opcional)

Para ver Dashboard y Admin funcionando localmente necesitás levantar PostgreSQL y Redis con Docker.

### Opción rápida — Docker Desktop

1. Descargar **[Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/)**
2. Instalar y reiniciar la PC
3. En la carpeta `Tu Agente Store/v1/` ejecutar:

```powershell
# Solo DB y Redis (sin Caddy ni n8n)
docker run -d --name postgres-local \
  -e POSTGRES_USER=tuagentestore \
  -e POSTGRES_PASSWORD=localdev123 \
  -e POSTGRES_DB=tuagentestore \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d --name redis-local \
  -p 6379:6379 \
  redis:7-alpine
```

4. Ejecutar el schema:
```powershell
docker exec -i postgres-local psql -U tuagentestore -d tuagentestore < schema.sql
docker exec -i postgres-local psql -U tuagentestore -d tuagentestore < database/seeds/001_agents.sql
```

5. Actualizar `.env.local`:
```
DATABASE_URL=postgresql://tuagentestore:localdev123@localhost:5432/tuagentestore
REDIS_URL=redis://localhost:6379
```

6. Reiniciar Next.js (`Ctrl+C` → `npm run dev`)

Ahora todas las páginas funcionan 100%.

---

## Comandos útiles mientras desarrollás

```powershell
# Parar el servidor
Ctrl + C

# Reiniciar (si cambiás .env.local)
npm run dev

# Ver errores de TypeScript
npm run build

# Limpiar cache si algo se rompe
Remove-Item -Recurse -Force .next
npm run dev
```

---

## Qué vas a ver en cada página

### `/` — Landing
- Hero animado con palabras rotativas (Ventas / Soporte / Marketing...)
- Sección "Cómo funciona" (4 pasos)
- Grilla de agentes destacados (datos estáticos)
- Sección de beneficios
- Testimonios + logos de integraciones
- CTA final

### `/agents` — Catálogo
- Búsqueda y filtros por categoría
- Cards de agentes (con fallback estático si no hay DB)
- Click en un agente → detalle con demo + formulario de reserva

### `/agents/sales-ai-closer` — Detalle de agente
- Tabs: Descripción / Demo / Reservar
- **Demo:** Si ponés tu `OPENAI_API_KEY` en `.env.local`, el chat funciona real
- **Reservar:** El form envía a `/api/reservations` (necesita DB o falla silenciosamente)

### `/login` y `/register`
- Formularios completos, necesitan DB para funcionar

---

## Solución de problemas comunes

**"Module not found"** al hacer `npm run dev`:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

**Puerto 3000 ya en uso:**
```powershell
npm run dev -- -p 3001
# Abrir http://localhost:3001
```

**Tailwind no aplica estilos:**
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

**Error "Cannot find module '@/lib/...'":**
Verificar que el `tsconfig.json` tenga el path alias:
```json
"paths": { "@/*": ["./*"] }
```
