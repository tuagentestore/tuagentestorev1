---
name: TuAgenteStore — Contexto del proyecto
description: Stack, dominios, flujos clave y arquitectura del marketplace de agentes IA
---

# TuAgenteStore — Contexto

## Producto
Marketplace B2B de agentes IA para PyMEs latinoamericanas.
Flujo principal: Landing → `/empezar` (wizard) → lead → n8n (WF01 + WF15) → email → admin dashboard.

## Dominios
- App: https://tuagentestore.com
- n8n webhooks: https://n8n.srv1565607.hstgr.cloud
- BI (Metabase): https://app.tuagentestore.com
- VPS: root@76.13.172.79 (Hostinger)

## Stack
- **Frontend:** Next.js 15 App Router + Tailwind CSS
- **Backend:** Next.js API Routes + PostgreSQL 16 (Neon) + Redis 7 (Upstash)
- **Infra:** Docker Compose en VPS — Caddy + Next.js + PostgreSQL + Redis + n8n + pg-backup
- **Automatización:** n8n self-hosted
- **Email:** Gmail OAuth2 via n8n
- **IA:** OpenAI gpt-4o-mini (demos), gpt-4o (content gen)

## Estructura del repo (git root: `v1/`)
- `app/app/` — Next.js App Router pages + API routes
- `app/components/` — React components
- `app/lib/` — utilities (db.ts, auth.ts, n8n.ts, redis.ts, openai.ts, etc.)
- `database/migrations/` — SQL migrations (001–004)
- `database/seeds/` — 001_agents.sql (canónico)
- `.claude/` — skills, context, settings para Claude Code

## Flujos clave
1. **Lead capture:** POST `/api/leads` → DB (non-fatal) → dispara WF01 + WF15
2. **Demo:** `/agents/[slug]` → DemoChat → POST `/api/demos/[id]/message` → OpenAI streaming
3. **Auth:** middleware.ts protege `/dashboard`, `/admin`, `/onboarding`
4. **Reservas:** `/api/reservations` — CRUD con email vía WF04

## Variables de entorno críticas (prod)
```
DATABASE_URL        Neon PostgreSQL
REDIS_URL           Upstash Redis
OPENAI_API_KEY      OpenAI
JWT_SECRET          32+ bytes
N8N_WEBHOOK_BASE    https://n8n.srv1565607.hstgr.cloud
NEXT_PUBLIC_APP_URL https://tuagentestore.com
```
