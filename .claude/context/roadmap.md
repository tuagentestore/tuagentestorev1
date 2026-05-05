---
name: TuAgenteStore — Roadmap V1→V3
description: Fases de desarrollo del producto con estado actual
---

# Roadmap

## V1 — MVP (COMPLETADO)
- [x] Landing page con HeroPrimary, FAQ, SocialProof
- [x] Catálogo de agentes con DemoChat (OpenAI streaming)
- [x] Lead wizard `/empezar` → captura → n8n WF01
- [x] Auth (JWT + Google OAuth2)
- [x] Dashboard de usuario
- [x] Admin dashboard con KPIs
- [x] Case studies (`/casos`)
- [x] Pricing page
- [x] n8n workflows WF01-WF05 activos
- [x] WF15 Lead Intake Avanzado (email segmentado 6 templates)

## V2 — Diferenciación (EN PROGRESO)
- [x] `.claude/` skills + context files (productividad dev ↑↑)
- [x] settings.local.json (protección ops destructivas)
- [x] Voice Agent `/demo/voz` — OpenAI Realtime API (WebRTC, voz "shimmer")
  - `app/api/voice/session/route.ts` — ephemeral token endpoint
  - `components/voice/VoiceDemoClient.tsx` — WebRTC + AudioContext visualizer
  - Tools: capture_lead, book_demo, get_agents, get_pricing
- [x] Trigger.dev v4 para automatización programada robusta
  - `app/trigger.config.ts`, `app/trigger/daily-report.ts`, `app/trigger/lead-nurture.ts`
  - `daily-report`: cron 11:00 UTC (08:00 ART) → n8n `daily-report` webhook
  - `lead-nurture`: delay 3 días → n8n `lead-nurture-d3` webhook
  - `/api/leads` dispara nurture task (non-fatal si no hay TRIGGER_SECRET_KEY)
  - **Pendiente activación**: crear proyecto en trigger.dev → `TRIGGER_PROJECT_REF` + `TRIGGER_SECRET_KEY` → `npx trigger.dev deploy`

## V3 — Escala (PLANIFICADO)
- [ ] WhatsApp Bridge (WF06) — Meta Business App configurada
- [ ] Excalidraw diagrams en listings de agentes
- [ ] GHL Bridge (WF16) — cuando GoHighLevel esté contratado
- [ ] Multi-tenancy — agentes de terceros en el marketplace
- [ ] Afiliados dashboard
- [ ] API pública para integraciones de clientes

## Pendiente inmediato
- Verificar credenciales Gmail + Sheets en n8n UI para WF15
- Configurar webhook de Calendly → `N8N_WEBHOOK_BASE/lead-created`
- WhatsApp: configurar Meta Business App para WF06
