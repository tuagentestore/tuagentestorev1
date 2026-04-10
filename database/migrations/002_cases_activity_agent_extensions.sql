-- ============================================================
-- Migration 002 — Cases, UserActivity + Agent field extensions
-- Fecha: 2026-04-10
-- ============================================================

-- ── Extend agents table ─────────────────────────────────────
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS industry        VARCHAR(100),
  ADD COLUMN IF NOT EXISTS what_it_does    TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deliverables    TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS limits_and_security TEXT,
  ADD COLUMN IF NOT EXISTS setup_time      VARCHAR(50) DEFAULT '24-48h',
  ADD COLUMN IF NOT EXISTS demo_initial_message TEXT,
  ADD COLUMN IF NOT EXISTS demo_suggestions TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS actions_basic   INT      DEFAULT 500,
  ADD COLUMN IF NOT EXISTS actions_pro     INT      DEFAULT 2000;

-- ── Cases table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                  VARCHAR(500) NOT NULL,
    slug                   VARCHAR(200) UNIQUE NOT NULL,

    industry               VARCHAR(100) NOT NULL,
    agent_ids              UUID[] DEFAULT '{}',
    stack                  TEXT[] DEFAULT '{}',
    setup_time             VARCHAR(50),

    -- Main metric
    primary_metric_label   VARCHAR(200),
    primary_metric_value   VARCHAR(100),

    summary_bullets        TEXT[] DEFAULT '{}',
    confidentiality        VARCHAR(30) DEFAULT 'anonimizado', -- anonimizado | confidencial | verificable

    problem                TEXT,
    solution               TEXT,

    -- Workflow map: [{step, description}]
    workflow_map           JSONB DEFAULT '[]',

    -- Checklist to replicate
    requirements           TEXT[] DEFAULT '{}',
    deliverables           TEXT[] DEFAULT '{}',

    -- Actions definition
    actions_definition     TEXT,
    actions_per_month_example TEXT,
    risk_controls          TEXT,

    -- Before/after: [{metric, before, after, period}]
    before_after           JSONB DEFAULT '[]',

    roi_notes              TEXT,

    featured               BOOLEAN DEFAULT FALSE,
    is_beta                BOOLEAN DEFAULT FALSE,

    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_slug     ON cases(slug);
CREATE INDEX IF NOT EXISTS idx_cases_industry ON cases(industry);
CREATE INDEX IF NOT EXISTS idx_cases_featured ON cases(featured) WHERE featured = TRUE;

-- ── user_activity table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activity (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    session_id     VARCHAR(255),

    activity_type  VARCHAR(80) NOT NULL,
    -- page_view | agent_view | demo_started | demo_completed |
    -- reservation_created | filter_used | search_performed |
    -- plan_viewed | faq_opened | wizard_completed | case_view

    page           VARCHAR(500),
    agent_id       UUID REFERENCES agents(id) ON DELETE SET NULL,
    case_id        UUID REFERENCES cases(id)  ON DELETE SET NULL,
    metadata       JSONB DEFAULT '{}',

    ip_address     INET,
    user_agent_str TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user   ON user_activity(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_type   ON user_activity(activity_type, created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_agent  ON user_activity(agent_id) WHERE agent_id IS NOT NULL;

-- ── Trigger for cases.updated_at ────────────────────────────
CREATE TRIGGER set_updated_at_cases
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Seed: sample cases ───────────────────────────────────────
INSERT INTO cases (title, slug, industry, stack, setup_time, primary_metric_label, primary_metric_value,
  summary_bullets, problem, solution, workflow_map, requirements, deliverables,
  actions_definition, actions_per_month_example, risk_controls, before_after, roi_notes, featured)
VALUES
(
  'Inmobiliaria automatiza gestión de leads con IA',
  'inmobiliaria-gestion-leads',
  'Inmobiliaria',
  ARRAY['HubSpot', 'Gmail', 'Zapier', 'WhatsApp'],
  '36 horas',
  'Reducción en tiempo de gestión',
  '-65%',
  ARRAY[
    'Leads calificados automáticamente antes de llegar al equipo',
    'Respuesta a consultas en WhatsApp en menos de 2 minutos',
    'Equipo se enfoca solo en leads con intención real de compra'
  ],
  'El equipo de ventas pasaba 4 horas diarias clasificando y respondiendo consultas iniciales de leads que llegaban por múltiples canales.',
  'Implementamos el Agente Inmobiliario que captura, califica y responde automáticamente. Solo escala leads con score alto al equipo humano.',
  '[
    {"step": 1, "description": "Lead llega por WhatsApp, web o formulario"},
    {"step": 2, "description": "Agente califica intención, presupuesto y zona"},
    {"step": 3, "description": "Si score > 70: agenda visita automáticamente"},
    {"step": 4, "description": "CRM actualizado en tiempo real"},
    {"step": 5, "description": "Reporte diario al equipo con leads prioritarios"}
  ]',
  ARRAY['Cuenta WhatsApp Business API', 'HubSpot CRM (cualquier plan)', 'Gmail corporativo'],
  ARRAY['Agente configurado con propiedades disponibles', 'Flujos de calificación personalizados', 'Integración CRM activa', 'Dashboard de métricas'],
  'Una acción = una interacción con un lead (mensaje recibido y respondido, lead calificado, visita agendada)',
  '~1.200 acciones/mes en cartera de 400 propiedades',
  'Escalación automática a humano si el lead menciona urgencia extrema o presupuesto > $500K',
  '[
    {"metric": "Tiempo respuesta inicial", "before": "4 horas", "after": "90 segundos", "period": "Promedio"},
    {"metric": "Leads calificados/semana", "before": "12", "after": "47", "period": "Semana"},
    {"metric": "Horas equipo en admin", "before": "20h/sem", "after": "7h/sem", "period": "Semana"}
  ]',
  'ROI calculado sobre ahorro de 13h/semana de trabajo comercial + incremento en leads calificados procesados.',
  TRUE
),
(
  'Aseguradora procesa 1.200 consultas en primer mes',
  'aseguradora-consultas-automaticas',
  'Seguros',
  ARRAY['Zendesk', 'Notion', 'Google Sheets', 'WhatsApp'],
  '48 horas',
  'Consultas procesadas automáticamente',
  '1.200+',
  ARRAY[
    '90% de consultas resueltas sin intervención humana',
    'Cotizaciones automáticas en menos de 60 segundos',
    'Seguimiento de renovaciones totalmente automatizado'
  ],
  'El equipo de atención recibía +60 consultas diarias por WhatsApp y email. Tiempo de respuesta promedio: 3 horas. Clientes se iban con la competencia.',
  'Agente de Seguros configurado con catálogo de pólizas, reglas de cotización y scripts de seguimiento. Integrado a Zendesk para tickets complejos.',
  '[
    {"step": 1, "description": "Cliente consulta por WhatsApp o email"},
    {"step": 2, "description": "Agente identifica tipo de seguro requerido"},
    {"step": 3, "description": "Cotización automática con datos del cliente"},
    {"step": 4, "description": "Si complejo → ticket en Zendesk para humano"},
    {"step": 5, "description": "Seguimiento automático a los 3 y 7 días"}
  ]',
  ARRAY['WhatsApp Business API', 'Zendesk (cualquier plan)', 'Catálogo de pólizas en formato digital'],
  ARRAY['Agente con catálogo configurado', 'Flujos de cotización automática', 'Sistema de escalación', 'Reportes mensuales en Sheets'],
  'Una acción = consulta procesada completa (desde recepción hasta respuesta o escalación)',
  '~1.200 acciones en primer mes sobre base de 800 clientes activos',
  'Handoff inmediato a humano para siniestros, cancelaciones y montos > $10.000',
  '[
    {"metric": "Tiempo respuesta", "before": "3 horas", "after": "< 60 segundos", "period": "Promedio"},
    {"metric": "Consultas resueltas sin humano", "before": "0%", "after": "90%", "period": "Mes 1"},
    {"metric": "Satisfacción cliente", "before": "3.2/5", "after": "4.7/5", "period": "Mes 1"}
  ]',
  'ROI medido en reducción de horas de atención (2 FTE equivalente) más retención de clientes por velocidad de respuesta.',
  TRUE
),
(
  'Estudio legal automatiza clasificación de documentos',
  'legal-clasificacion-documentos',
  'Legal',
  ARRAY['Gmail', 'Google Drive', 'n8n', 'Notion'],
  '42 horas',
  'Automatización en clasificación',
  '80%',
  ARRAY[
    'Documentos clasificados y archivados automáticamente',
    'Seguimiento de casos sin intervención del equipo',
    'Intake de nuevos clientes completamente automatizado'
  ],
  'El estudio recibía 50+ documentos diarios por email. La clasificación manual tomaba 2 horas/día. Los seguimientos de casos se perdían frecuentemente.',
  'Agente Legal configurado con estructura de casos del estudio. Procesa emails entrantes, clasifica documentos, actualiza Notion y envía recordatorios automáticos.',
  '[
    {"step": 1, "description": "Email con documento llega a Gmail del estudio"},
    {"step": 2, "description": "Agente extrae metadata y clasifica por tipo/caso"},
    {"step": 3, "description": "Archiva en Drive con nomenclatura estándar"},
    {"step": 4, "description": "Actualiza estado del caso en Notion"},
    {"step": 5, "description": "Notifica al abogado responsable si urgente"}
  ]',
  ARRAY['Gmail corporativo', 'Google Drive organizado por casos', 'Notion como gestor de casos'],
  ARRAY['Agente configurado con taxonomía del estudio', 'Flujos de clasificación', 'Sistema de alertas', 'Dashboard de casos en Notion'],
  'Una acción = documento procesado (clasificado + archivado + caso actualizado)',
  '~1.500 acciones/mes en estudio con 30 casos activos simultáneos',
  'Escalación a humano para documentos con firma urgente requerida o montos judiciales > $50.000',
  '[
    {"metric": "Tiempo clasificación diaria", "before": "2 horas", "after": "0 minutos", "period": "Por día"},
    {"metric": "Documentos mal archivados", "before": "15%", "after": "< 1%", "period": "Por mes"},
    {"metric": "Seguimientos perdidos", "before": "8/mes", "after": "0/mes", "period": "Por mes"}
  ]',
  'ROI calculado sobre 2 horas/día ahorradas de trabajo paralegal + eliminación de errores de archivo.',
  TRUE
)
ON CONFLICT (slug) DO NOTHING;
