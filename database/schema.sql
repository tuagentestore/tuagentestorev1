-- ============================================================
-- TuAgenteStore — Schema principal
-- PostgreSQL 16
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ── Trigger helper ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────────────────────────
-- TENANTS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) UNIQUE NOT NULL,
    plan        VARCHAR(50) NOT NULL DEFAULT 'starter',
    industry    VARCHAR(100),
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

CREATE TRIGGER set_updated_at_tenants
    BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'member', -- admin | member | vendor
    tenant_id       UUID REFERENCES tenants(id) ON DELETE SET NULL,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    google_id       VARCHAR(255),
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- AGENTS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                    VARCHAR(255) NOT NULL,
    slug                    VARCHAR(200) UNIQUE NOT NULL,
    tagline                 VARCHAR(500),
    description             TEXT,
    category                VARCHAR(100),
    capabilities            TEXT[] DEFAULT '{}',
    integrations            TEXT[] DEFAULT '{}',
    use_cases               TEXT[] DEFAULT '{}',
    faqs                    JSONB DEFAULT '[]',
    image_url               TEXT,

    -- Pricing
    pricing_basic           INTEGER,
    pricing_pro             INTEGER,
    pricing_enterprise      INTEGER,
    actions_basic           INTEGER DEFAULT 500,
    actions_pro             INTEGER DEFAULT 2000,

    -- Setup
    setup_time_hours        INTEGER DEFAULT 24,
    setup_time              VARCHAR(50) DEFAULT '24-48h',

    -- Demo
    featured                BOOLEAN NOT NULL DEFAULT FALSE,
    demo_available          BOOLEAN NOT NULL DEFAULT FALSE,
    demo_max_messages       INTEGER DEFAULT 3,
    demo_model              VARCHAR(100) DEFAULT 'gpt-4o-mini',
    demo_prompt             TEXT,
    demo_initial_message    TEXT,
    demo_suggestions        TEXT[] DEFAULT '{}',

    -- Extended fields (migration 002)
    industry                VARCHAR(100),
    what_it_does            TEXT[] DEFAULT '{}',
    deliverables            TEXT[] DEFAULT '{}',
    limits_and_security     TEXT,

    -- Status
    status                  VARCHAR(50) NOT NULL DEFAULT 'active', -- active | draft | archived
    sort_order              INTEGER DEFAULT 0,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_slug     ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_agents_status   ON agents(status);

CREATE TRIGGER set_updated_at_agents
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- DEMO SESSIONS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demo_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id        UUID REFERENCES agents(id) ON DELETE CASCADE,
    user_email      VARCHAR(255),
    ip_address      INET,
    messages_used   INTEGER NOT NULL DEFAULT 0,
    max_messages    INTEGER NOT NULL DEFAULT 3,
    status          VARCHAR(50) NOT NULL DEFAULT 'active', -- active | completed | expired
    conversation    JSONB NOT NULL DEFAULT '[]',
    tokens_used     INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_agent  ON demo_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_status ON demo_sessions(status, created_at);

CREATE TRIGGER set_updated_at_demo_sessions
    BEFORE UPDATE ON demo_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- RESERVATIONS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id          UUID REFERENCES agents(id) ON DELETE SET NULL,
    user_name         VARCHAR(255) NOT NULL,
    user_email        VARCHAR(255) NOT NULL,
    phone             VARCHAR(50),
    company           VARCHAR(255),
    industry          VARCHAR(100),
    use_case          TEXT,
    plan_interest     VARCHAR(50) DEFAULT 'starter',
    preferred_date    VARCHAR(100),
    scheduled_at      TIMESTAMPTZ,
    utm_source        VARCHAR(100),
    utm_medium        VARCHAR(100),
    utm_campaign      VARCHAR(100),
    demo_session_id   UUID,
    status            VARCHAR(50) NOT NULL DEFAULT 'new', -- new | contacted | scheduled | closed | lost
    admin_notes       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_email  ON reservations(user_email);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_agent  ON reservations(agent_id);

CREATE TRIGGER set_updated_at_reservations
    BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- SUBSCRIPTIONS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
    plan        VARCHAR(50) NOT NULL DEFAULT 'starter',
    status      VARCHAR(50) NOT NULL DEFAULT 'active', -- active | cancelled | past_due
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id, status);

CREATE TRIGGER set_updated_at_subscriptions
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- USER_AGENTS (agents activated per tenant)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_agents (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id        UUID REFERENCES tenants(id) ON DELETE CASCADE,
    agent_id         UUID REFERENCES agents(id) ON DELETE CASCADE,
    status           VARCHAR(50) NOT NULL DEFAULT 'inactive', -- active | inactive | suspended
    activated_at     TIMESTAMPTZ,
    actions_count    INTEGER NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_user_agents_tenant ON user_agents(tenant_id);

-- ──────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(80) NOT NULL,
    title       VARCHAR(255) NOT NULL,
    message     TEXT,
    action_url  TEXT,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

-- ──────────────────────────────────────────────────────────
-- ONBOARDING_SUBMISSIONS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_submissions (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    industry      VARCHAR(100),
    channels      JSONB DEFAULT '[]',
    lead_volume   VARCHAR(100),
    main_problem  TEXT,
    current_tools TEXT,
    urgency       VARCHAR(50),
    phone         VARCHAR(50),
    company       VARCHAR(255),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_onboarding
    BEFORE UPDATE ON onboarding_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- CASES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title                    VARCHAR(500) NOT NULL,
    slug                     VARCHAR(200) UNIQUE NOT NULL,
    industry                 VARCHAR(100) NOT NULL,
    agent_ids                UUID[] DEFAULT '{}',
    stack                    TEXT[] DEFAULT '{}',
    setup_time               VARCHAR(50),
    primary_metric_label     VARCHAR(200),
    primary_metric_value     VARCHAR(100),
    summary_bullets          TEXT[] DEFAULT '{}',
    confidentiality          VARCHAR(30) DEFAULT 'anonimizado',
    problem                  TEXT,
    solution                 TEXT,
    workflow_map             JSONB DEFAULT '[]',
    requirements             TEXT[] DEFAULT '{}',
    deliverables             TEXT[] DEFAULT '{}',
    actions_definition       TEXT,
    actions_per_month_example TEXT,
    risk_controls            TEXT,
    before_after             JSONB DEFAULT '[]',
    roi_notes                TEXT,
    featured                 BOOLEAN DEFAULT FALSE,
    is_beta                  BOOLEAN DEFAULT FALSE,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_slug     ON cases(slug);
CREATE INDEX IF NOT EXISTS idx_cases_industry ON cases(industry);
CREATE INDEX IF NOT EXISTS idx_cases_featured ON cases(featured) WHERE featured = TRUE;

CREATE TRIGGER set_updated_at_cases
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────
-- USER_ACTIVITY
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_activity (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_id      UUID REFERENCES tenants(id) ON DELETE SET NULL,
    session_id     VARCHAR(255),
    activity_type  VARCHAR(80) NOT NULL,
    page           VARCHAR(500),
    agent_id       UUID REFERENCES agents(id) ON DELETE SET NULL,
    case_id        UUID REFERENCES cases(id) ON DELETE SET NULL,
    metadata       JSONB DEFAULT '{}',
    ip_address     INET,
    user_agent_str TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user  ON user_activity(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_type  ON user_activity(activity_type, created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_agent ON user_activity(agent_id) WHERE agent_id IS NOT NULL;
