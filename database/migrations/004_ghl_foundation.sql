-- ============================================================
-- Migration 004 — GHL Foundation + Lead Funnel columns
-- Fecha: 2026-04-29
-- Propósito: preparar reservations para sync con GoHighLevel
--            y capturar datos del funnel /empezar
-- ============================================================

-- ── Columnas de lead funnel (form /empezar) ──
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS channel_origin  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS problem_area    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS budget_range    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS company_size    VARCHAR(100),
  ADD COLUMN IF NOT EXISTS wants_call      VARCHAR(20) DEFAULT 'si',
  ADD COLUMN IF NOT EXISTS industry        VARCHAR(255);

-- ── Columnas de sync GHL ──
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS ghl_contact_id     VARCHAR(255),
  ADD COLUMN IF NOT EXISTS ghl_pipeline_stage VARCHAR(100);

-- Índice para búsquedas por email (evitar duplicados en /api/leads)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_user_email_unique
  ON reservations (user_email)
  WHERE status = 'new';

-- ── Cola de eventos para GHL ──
CREATE TABLE IF NOT EXISTS ghl_event_queue (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type  VARCHAR(100) NOT NULL,
  payload     JSONB        NOT NULL,
  status      VARCHAR(20)  DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','skipped')),
  attempts    INTEGER      DEFAULT 0,
  error_msg   TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  sent_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ghl_event_queue_status ON ghl_event_queue (status);
CREATE INDEX IF NOT EXISTS idx_ghl_event_queue_created ON ghl_event_queue (created_at DESC);
