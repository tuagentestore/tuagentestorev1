-- ============================================================
-- Migration 003 — Dashboard BI Data Tables
-- Fecha: 2026-04-29
-- Tablas: ad_spend, operating_costs, creative_assets, income_records
-- Propósito: entrada manual de datos financieros/marketing hasta
--            integrar APIs de Meta Ads, Stripe, etc.
-- ============================================================

-- ── 1. GASTOS PUBLICITARIOS ──
CREATE TABLE IF NOT EXISTS ad_spend (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE NOT NULL,
  channel        VARCHAR(50)  NOT NULL CHECK (channel IN ('meta','tiktok','google','linkedin','other')),
  campaign_name  VARCHAR(255),
  impressions    INTEGER      DEFAULT 0,
  clicks         INTEGER      DEFAULT 0,
  leads          INTEGER      DEFAULT 0,
  spend_usd      DECIMAL(10,2) DEFAULT 0,
  revenue_attributed_usd DECIMAL(10,2) DEFAULT 0,
  notes          TEXT,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_spend_date    ON ad_spend (date DESC);
CREATE INDEX IF NOT EXISTS idx_ad_spend_channel ON ad_spend (channel);

-- ── 2. COSTOS OPERATIVOS ──
CREATE TABLE IF NOT EXISTS operating_costs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month       DATE        NOT NULL,   -- primer día del mes: 2026-04-01
  category    VARCHAR(100) NOT NULL CHECK (category IN ('hosting','openai','tools','freelancers','ads_mgmt','other')),
  item        VARCHAR(255) NOT NULL,
  amount_usd  DECIMAL(10,2) NOT NULL,
  recurring   BOOLEAN      DEFAULT FALSE,
  notes       TEXT,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operating_costs_month    ON operating_costs (month DESC);
CREATE INDEX IF NOT EXISTS idx_operating_costs_category ON operating_costs (category);

-- ── 3. CREATIVOS / PIEZAS DE CONTENIDO ──
CREATE TABLE IF NOT EXISTS creative_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date             DATE        NOT NULL,
  platform         VARCHAR(50)  NOT NULL CHECK (platform IN ('instagram','tiktok','linkedin','youtube','twitter','other')),
  format           VARCHAR(50)  NOT NULL CHECK (format IN ('reel','carousel','post','story','short','article','email')),
  agent_topic      VARCHAR(255),
  hook             TEXT,
  angle            VARCHAR(255),
  status           VARCHAR(50)  DEFAULT 'pending' CHECK (status IN ('pending','generated','approved','published','archived')),
  ad_spend_id      UUID         REFERENCES ad_spend(id) ON DELETE SET NULL,
  impressions      INTEGER      DEFAULT 0,
  clicks           INTEGER      DEFAULT 0,
  leads            INTEGER      DEFAULT 0,
  engagement_rate  DECIMAL(5,2),
  notes            TEXT,
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_assets_date     ON creative_assets (date DESC);
CREATE INDEX IF NOT EXISTS idx_creative_assets_status   ON creative_assets (status);
CREATE INDEX IF NOT EXISTS idx_creative_assets_platform ON creative_assets (platform);

-- ── 4. INGRESOS ──
CREATE TABLE IF NOT EXISTS income_records (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE        NOT NULL,
  client_name    VARCHAR(255),
  agent_sold     VARCHAR(255),
  plan           VARCHAR(50)  CHECK (plan IN ('starter','pro','enterprise','diagnostic','custom')),
  amount_usd     DECIMAL(10,2) NOT NULL,
  type           VARCHAR(50)  DEFAULT 'implementation' CHECK (type IN ('implementation','recurring','upsell','diagnostic','refund')),
  channel        VARCHAR(100) CHECK (channel IN ('meta_ads','tiktok_ads','google_ads','organic','referral','whatsapp','linkedin','other')),
  reservation_id UUID         REFERENCES reservations(id) ON DELETE SET NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_income_records_date   ON income_records (date DESC);
CREATE INDEX IF NOT EXISTS idx_income_records_type   ON income_records (type);
CREATE INDEX IF NOT EXISTS idx_income_records_channel ON income_records (channel);
