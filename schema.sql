-- ============================================================
-- AI AGENT HUB — PostgreSQL Schema
-- Versión: 1.0.0 | Fecha: 2026-02-16
-- Stack: Postgres 16 (self-hosted en Hostinger VPS)
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TENANTS (Multi-tenant)
-- ============================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    plan VARCHAR(50) NOT NULL DEFAULT 'free', -- free, starter, pro, enterprise
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, suspended, cancelled
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. USERS + AUTH
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    role VARCHAR(30) NOT NULL DEFAULT 'member', -- superadmin, admin, member
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PLANS + SUBSCRIPTIONS
-- ============================================================
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- Starter, Pro, Enterprise
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    setup_fee DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    limits JSONB NOT NULL DEFAULT '{
        "max_agents": 1,
        "max_actions_month": 500,
        "max_integrations": 3,
        "max_team_members": 1,
        "support_level": "email",
        "sla_hours": 48
    }',
    stripe_price_id VARCHAR(255),
    mp_plan_id VARCHAR(255), -- MercadoPago
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status VARCHAR(30) NOT NULL DEFAULT 'active', -- trialing, active, past_due, cancelled, suspended
    payment_provider VARCHAR(20), -- stripe, mercadopago
    provider_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. AGENTS (Catálogo del marketplace)
-- ============================================================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    tagline VARCHAR(500),
    description TEXT,
    long_description TEXT,
    category VARCHAR(50) NOT NULL, -- Marketing, Ventas, Atención al Cliente, Datos, Legal, Operaciones
    capabilities TEXT[] DEFAULT '{}',
    integrations TEXT[] DEFAULT '{}',
    image_url TEXT,
    icon VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, coming_soon, beta, archived
    featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    
    -- Pricing por agente (override de plan si aplica)
    pricing_basic DECIMAL(10,2),
    pricing_pro DECIMAL(10,2),
    pricing_enterprise DECIMAL(10,2),
    
    -- Demo config
    demo_available BOOLEAN DEFAULT TRUE,
    demo_prompt TEXT,
    demo_max_messages INT DEFAULT 3,
    demo_model VARCHAR(100) DEFAULT 'gpt-4o-mini',
    
    -- SEO & metadata
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    
    -- FAQs
    faqs JSONB DEFAULT '[]', -- [{question, answer}]
    
    -- Documentación
    how_it_works TEXT,
    implementation_steps TEXT,
    requirements TEXT,
    automated_tasks TEXT[] DEFAULT '{}',
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. DEMO SESSIONS
-- ============================================================
CREATE TABLE demo_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    messages_used INT DEFAULT 0,
    max_messages INT DEFAULT 3,
    conversation JSONB DEFAULT '[]', -- [{role, content, timestamp}]
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, completed, expired
    converted_to_reservation BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ============================================================
-- 6. RESERVATIONS (Lead → Activación)
-- ============================================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Datos del lead
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    use_case TEXT,
    budget_range VARCHAR(50),
    
    -- Estado del funnel
    plan_interest VARCHAR(50) DEFAULT 'starter',
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, contacted, qualified, demo_scheduled, validated, paid, implementing, active, cancelled
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    source VARCHAR(50), -- landing, marketplace, referral, direct
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    
    -- Scheduling
    preferred_date DATE,
    scheduled_at TIMESTAMPTZ,
    calendly_event_id VARCHAR(255),
    
    -- Tracking
    lead_score INT DEFAULT 0,
    notes TEXT,
    admin_notes TEXT,
    contacted_at TIMESTAMPTZ,
    qualified_at TIMESTAMPTZ,
    validated_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Asignación
    assigned_to UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. USER AGENTS (Agentes contratados/activos por tenant)
-- ============================================================
CREATE TABLE user_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES agents(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    status VARCHAR(20) NOT NULL DEFAULT 'provisioning', -- provisioning, active, paused, inactive
    plan VARCHAR(50) DEFAULT 'basic',
    
    -- Config del agente para este tenant
    custom_config JSONB DEFAULT '{}',
    credentials_encrypted TEXT, -- Encrypted credentials for integrations
    
    -- Métricas
    actions_count INT DEFAULT 0,
    actions_limit INT DEFAULT 500,
    last_activity_at TIMESTAMPTZ,
    
    -- N8N workflow
    n8n_workflow_id VARCHAR(255),
    webhook_url TEXT,
    
    activation_date DATE,
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, agent_id)
);

-- ============================================================
-- 8. USAGE ACTIONS (Metering — lo que cobrás)
-- ============================================================
CREATE TABLE usage_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_agent_id UUID NOT NULL REFERENCES user_agents(id),
    agent_id UUID NOT NULL REFERENCES agents(id),
    
    action_type VARCHAR(100) NOT NULL, -- message_sent, email_processed, lead_qualified, report_generated, etc.
    tokens_input INT DEFAULT 0,
    tokens_output INT DEFAULT 0,
    cost_usd DECIMAL(10,6) DEFAULT 0, -- Costo real del token/acción
    
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partición por mes para performance
CREATE INDEX idx_usage_actions_tenant_date ON usage_actions(tenant_id, created_at);
CREATE INDEX idx_usage_actions_user_agent ON usage_actions(user_agent_id, created_at);

-- ============================================================
-- 9. PAYMENTS + INVOICES
-- ============================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    subscription_id UUID REFERENCES subscriptions(id),
    
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(30) NOT NULL, -- pending, succeeded, failed, refunded
    
    payment_provider VARCHAR(20) NOT NULL, -- stripe, mercadopago
    provider_payment_id VARCHAR(255),
    provider_invoice_id VARCHAR(255),
    
    payment_method VARCHAR(50), -- card, transfer, mercadopago
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. INTEGRATIONS CONFIG (por tenant)
-- ============================================================
CREATE TABLE integration_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_agent_id UUID REFERENCES user_agents(id) ON DELETE CASCADE,
    
    provider VARCHAR(50) NOT NULL, -- gmail, sheets, notion, whatsapp, hubspot, pipedrive, etc.
    status VARCHAR(20) DEFAULT 'pending', -- pending, connected, error, revoked
    
    -- OAuth / credentials (encrypted)
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    credentials_encrypted TEXT,
    
    scopes TEXT[],
    expires_at TIMESTAMPTZ,
    last_sync_at TIMESTAMPTZ,
    error_message TEXT,
    
    config JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(tenant_id, user_agent_id, provider)
);

-- ============================================================
-- 11. WEBHOOKS LOG (Auditoría de eventos)
-- ============================================================
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL, -- stripe, mercadopago, calendly, n8n, whatsapp
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    headers JSONB,
    status VARCHAR(20) DEFAULT 'received', -- received, processed, failed
    error_message TEXT,
    processing_time_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. AUDIT LOG
-- ============================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- user.created, agent.activated, payment.succeeded, etc.
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 13. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    type VARCHAR(50) NOT NULL, -- info, warning, success, error
    title VARCHAR(255) NOT NULL,
    message TEXT,
    action_url TEXT,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 14. ONBOARDING SUBMISSIONS
-- ============================================================
CREATE TABLE onboarding_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID REFERENCES reservations(id),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    
    -- Respuestas del formulario
    industry VARCHAR(100),
    objective TEXT,
    primary_channel VARCHAR(50), -- whatsapp, web, email
    current_tools TEXT[], -- CRM, Sheets, etc.
    monthly_volume VARCHAR(50),
    tone VARCHAR(50), -- formal, casual, professional
    restrictions TEXT,
    sla_expectation VARCHAR(50),
    integrations_needed TEXT[],
    additional_notes TEXT,
    
    -- Estado
    status VARCHAR(30) DEFAULT 'submitted', -- submitted, reviewing, approved, provisioning, completed
    checklist JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 15. SUPPORT TICKETS
-- ============================================================
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES users(id),
    
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- bug, feature, billing, general
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, waiting, resolved, closed
    
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_featured ON agents(featured) WHERE featured = TRUE;
CREATE INDEX idx_demo_sessions_agent ON demo_sessions(agent_id);
CREATE INDEX idx_demo_sessions_token ON demo_sessions(session_token);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_email ON reservations(user_email);
CREATE INDEX idx_user_agents_tenant ON user_agents(tenant_id);
CREATE INDEX idx_user_agents_status ON user_agents(status);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id, created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_webhook_logs_source ON webhook_logs(source, created_at);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE column_name = 'updated_at'
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()',
            t
        );
    END LOOP;
END;
$$;

-- ============================================================
-- SEED: Default Plans
-- ============================================================
INSERT INTO plans (name, slug, description, price_monthly, price_yearly, setup_fee, currency, limits, sort_order) VALUES
(
    'Starter',
    'starter',
    '1 agente IA, 500 acciones/mes, soporte por email',
    49.00,
    470.00,
    299.00,
    'USD',
    '{"max_agents": 1, "max_actions_month": 500, "max_integrations": 3, "max_team_members": 1, "support_level": "email", "sla_hours": 48}',
    1
),
(
    'Pro',
    'pro',
    '3 agentes IA, 2000 acciones/mes, soporte prioritario',
    199.00,
    1910.00,
    599.00,
    'USD',
    '{"max_agents": 3, "max_actions_month": 2000, "max_integrations": 10, "max_team_members": 5, "support_level": "priority", "sla_hours": 24}',
    2
),
(
    'Enterprise',
    'enterprise',
    'Agentes ilimitados, acciones custom, soporte dedicado',
    NULL,
    NULL,
    NULL,
    'USD',
    '{"max_agents": -1, "max_actions_month": -1, "max_integrations": -1, "max_team_members": -1, "support_level": "dedicated", "sla_hours": 4}',
    3
);
