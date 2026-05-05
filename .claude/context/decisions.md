---
name: TuAgenteStore — Log de decisiones técnicas
description: Decisiones de arquitectura y diseño importantes con su razonamiento
---

# Decisiones técnicas

## 2026-05-05 — Auth gate en catálogo
**Decisión:** El catálogo de agentes (`/marketplace/catalogo`) muestra contenido inmediato; el auth overlay aparece solo cuando el usuario intenta interactuar.
**Por qué:** Audit QA reveló que bloquear acceso al catálogo reducía conversiones. El contenido es público, la acción (demo/reserva) requiere auth.

## 2026-05-05 — Accent color: AI Cyan
**Decisión:** Color primario cambiado de violeta (#8B5CF6) a AI Cyan (#06B6D4).
**Por qué:** El violeta era genérico y asociado a SaaS "común". El cyan evoca IA, tecnología y diferenciación en el mercado LATAM.

## 2026-05-05 — Lead capture no-fatal
**Decisión:** En `/api/leads`, los errores de DB no bloquean el flujo; n8n siempre dispara.
**Por qué:** La captura del lead en n8n (email) es más crítica que el registro en DB. Si la DB está down, el lead no se pierde.

## 2026-05-05 — Deploy con --force-recreate app
**Decisión:** `deploy.sh` hace `docker container prune -f` + `--force-recreate app` antes del `up -d`.
**Por qué:** Docker tenía conflictos de nombre de contenedor en cada redeploy. El prune evita el error sin forzar rebuild completo.

## 2026-05-05 — seed canónico: 001_agents.sql
**Decisión:** `001_agents_fixed.sql` eliminado; `001_agents.sql` es el único seed de agentes.
**Por qué:** El `_fixed` era un hotfix rápido ya incorporado. Tener dos seeds crea confusión sobre cuál es la fuente de verdad.

## 2026-05-05 — n8n usa PostgreSQL (misma instancia)
**Decisión:** n8n usa el mismo PostgreSQL con schema `n8n` separado.
**Por qué:** Simplifica infraestructura. El `DATABASE_URL` del docker-compose es detectado automáticamente por n8n moderno.
