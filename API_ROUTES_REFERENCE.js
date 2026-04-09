// ============================================================
// AI AGENT HUB — API Routes Reference (Next.js App Router)
// Este archivo documenta TODAS las rutas API necesarias
// Implementar en: app/api/[route]/route.ts
// ============================================================

/**
 * ═══════════════════════════════════════════
 * AUTH ROUTES
 * ═══════════════════════════════════════════
 */

// POST /api/auth/register
// → Crear usuario + tenant default
// → Enviar email verificación
// → Trigger: n8n webhook user.created

// POST /api/auth/login
// → Validar credentials
// → Generar JWT + refresh token
// → Guardar session en DB + Redis

// POST /api/auth/logout
// → Invalidar session
// → Limpiar Redis

// POST /api/auth/refresh
// → Rotar refresh token
// → Nuevo JWT

// POST /api/auth/forgot-password
// → Generar token reset
// → Enviar email

// POST /api/auth/reset-password
// → Validar token
// → Actualizar password

// GET /api/auth/me
// → Retornar user + tenant + plan activo

/**
 * ═══════════════════════════════════════════
 * AGENTS (Catálogo — público)
 * ═══════════════════════════════════════════
 */

// GET /api/agents
// → Listar agentes activos
// → Filtros: category, status, featured
// → Público (no requiere auth)

// GET /api/agents/[slug]
// → Detalle de un agente
// → Incluye: FAQs, capabilities, pricing
// → Público

// GET /api/agents/[slug]/demo
// → Obtener config de demo
// → Crear demo_session si no existe

/**
 * ═══════════════════════════════════════════
 * DEMO SESSIONS
 * ═══════════════════════════════════════════
 */

// POST /api/demos
// → Crear sesión de demo
// → Límite: 3 mensajes
// → Trigger: n8n webhook demo.started

// POST /api/demos/[id]/message
// → Enviar mensaje al demo
// → Llamar OpenAI con demo_prompt del agente
// → Incrementar messages_used
// → Si messages_used >= 3: marcar completed
// → Trigger: n8n webhook demo.completed (si termina)

// GET /api/demos/[id]
// → Estado de la sesión

/**
 * ═══════════════════════════════════════════
 * RESERVATIONS (Leads)
 * ═══════════════════════════════════════════
 */

// POST /api/reservations
// → Crear reserva/lead
// → Validar datos
// → Trigger: n8n webhook lead.created
// → Trigger: n8n webhook reservation.created

// GET /api/reservations (auth: admin)
// → Listar todas las reservas
// → Filtros: status, priority, date range

// PATCH /api/reservations/[id] (auth: admin)
// → Actualizar estado
// → Trigger: n8n webhook reservation.updated

/**
 * ═══════════════════════════════════════════
 * USER AGENTS (Agentes contratados)
 * ═══════════════════════════════════════════
 */

// GET /api/user-agents (auth: member)
// → Mis agentes activos
// → Incluye: métricas, status, usage

// GET /api/user-agents/[id] (auth: member)
// → Detalle de mi agente

// GET /api/user-agents/[id]/usage (auth: member)
// → Historial de acciones/metering

/**
 * ═══════════════════════════════════════════
 * BILLING (Stripe + MercadoPago)
 * ═══════════════════════════════════════════
 */

// POST /api/billing/checkout
// → Crear checkout session (Stripe o MP)
// → Parámetros: plan_id, payment_provider

// POST /api/billing/portal
// → Generar URL del portal de facturación (Stripe)

// GET /api/billing/subscription (auth: member)
// → Suscripción activa + usage actual

// GET /api/billing/invoices (auth: member)
// → Historial de pagos

/**
 * ═══════════════════════════════════════════
 * WEBHOOKS ENTRANTES (desde servicios externos)
 * ═══════════════════════════════════════════
 */

// POST /api/webhooks/stripe
// → Verificar signature (whsec_)
// → Eventos:
//   - checkout.session.completed → activar plan
//   - invoice.paid → mantener acceso
//   - invoice.payment_failed → dunning
//   - customer.subscription.updated → sync plan
//   - customer.subscription.deleted → cancelar

// POST /api/webhooks/mercadopago
// → Verificar signature
// → Eventos:
//   - payment.created
//   - payment.updated
//   - subscription_preapproval.updated

// POST /api/webhooks/calendly
// → Verificar signature
// → Eventos:
//   - invitee.created → actualizar reservation
//   - invitee.canceled → marcar no-show

// POST /api/webhooks/n8n
// → Verificar WEBHOOK_SECRET_INTERNAL
// → Eventos internos de n8n hacia la app
//   - agent.activated
//   - agent.error
//   - report.generated

/**
 * ═══════════════════════════════════════════
 * WEBHOOKS SALIENTES (hacia n8n)
 * Base URL: https://auto.aiagenthub.com/webhook/
 * ═══════════════════════════════════════════
 */

const N8N_WEBHOOKS = {
    // Leads & CRM
    'lead.created':         '/webhook/lead-created',
    'lead.qualified':       '/webhook/lead-qualified',
    
    // Demos
    'demo.started':         '/webhook/demo-started',
    'demo.completed':       '/webhook/demo-completed',
    
    // Reservations
    'reservation.created':  '/webhook/reservation-created',
    'reservation.updated':  '/webhook/reservation-updated',
    
    // Users
    'user.created':         '/webhook/user-created',
    'user.invited':         '/webhook/user-invited',
    
    // Billing
    'payment.succeeded':    '/webhook/payment-succeeded',
    'payment.failed':       '/webhook/payment-failed',
    'subscription.updated': '/webhook/subscription-updated',
    
    // Agents
    'agent.activated':      '/webhook/agent-activated',
    'agent.error':          '/webhook/agent-error',
    'actions.80_percent':   '/webhook/actions-80',
    'actions.100_percent':  '/webhook/actions-100',
    
    // Onboarding
    'onboarding.submitted': '/webhook/onboarding-submitted',
    'credentials.connected':'/webhook/credentials-connected',
    
    // Support
    'ticket.created':       '/webhook/ticket-created',
    'ticket.escalated':     '/webhook/ticket-escalated',
};

/**
 * ═══════════════════════════════════════════
 * ADMIN ROUTES
 * ═══════════════════════════════════════════
 */

// GET /api/admin/dashboard (auth: admin)
// → KPIs: leads, demos, conversiones, revenue, MRR

// GET /api/admin/reservations (auth: admin)
// → Pipeline de leads

// GET /api/admin/agents (auth: admin)
// → CRUD de agentes del catálogo

// POST /api/admin/agents (auth: admin)
// → Crear agente

// PUT /api/admin/agents/[id] (auth: admin)
// → Editar agente

// GET /api/admin/users (auth: superadmin)
// → Listado de usuarios

// GET /api/admin/usage (auth: admin)
// → Reporte de uso global

/**
 * ═══════════════════════════════════════════
 * ONBOARDING
 * ═══════════════════════════════════════════
 */

// POST /api/onboarding/submit
// → Guardar respuestas del form
// → Trigger: n8n webhook onboarding.submitted

// GET /api/onboarding/status/[id] (auth: member)
// → Estado del onboarding + checklist

/**
 * ═══════════════════════════════════════════
 * HEALTH & MONITORING
 * ═══════════════════════════════════════════
 */

// GET /api/health
// → { status: 'ok', db: 'ok', redis: 'ok', timestamp }

// GET /api/health/detailed (auth: admin)
// → { ...health, n8n: 'ok', queue_size, memory, uptime }
