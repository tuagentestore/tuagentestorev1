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
- [ ] Voice Agent `/demo/voz` — Gemini Flash Live API, agente "Vera Voice"
  - Backend: FastAPI + WebSocket + Gemini SDK (contenedor `tuagentestore-voice-1`)
  - Frontend: WebAudio API + AudioWorklet
  - Herramientas: pricing, disponibilidad de agentes, Calendly booking
- [ ] Trigger.dev para automatización programada robusta
  - `app/trigger/daily-report.ts` — cron 08:00 AR
  - `app/trigger/lead-nurture.ts` — delay task D+3
  - Reemplaza WF10 y WF15 step 2

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
