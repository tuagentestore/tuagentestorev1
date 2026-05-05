# TuAgenteStore — CLAUDE.md

@.claude/context/project.md
@.claude/context/decisions.md
@.claude/context/roadmap.md

## Instrucciones de comportamiento para Claude
- **Antes de cualquier cambio de UI/frontend:** invocar skill `/frontend-design` para aplicar guardrails de diseño
- **Para deployar:** invocar skill `/deploy` — nunca SSH manual sin el script
- **Para ops destructivas (rm -rf, force push, DROP TABLE):** pedir confirmación explícita al usuario antes de ejecutar
- **Git root es `v1/`** — staging siempre con paths relativos a `v1/`
- **SSH al VPS:** usar Bash tool (no PowerShell) con `ssh -i ~/.ssh/id_ed25519 root@76.13.172.79`

## Project overview
B2B marketplace of AI agents for Latin American SMBs. Landing → lead → n8n → email → admin pipeline.
Domain: tuagentestore.com | VPS: 76.13.172.79 | GitHub: tuagentestore/tuagentestarev1 (branch: main)

## Directory layout
```
v1/                          ← git root
├── app/                     ← Next.js app root (use this as cwd for npm/next)
│   ├── app/                 ← App Router pages + API routes
│   │   ├── api/             ← API routes (see list below)
│   │   └── [page]/page.tsx  ← route pages
│   ├── components/          ← React components
│   ├── lib/                 ← shared utilities
│   ├── public/              ← static assets
│   └── middleware.ts        ← auth middleware (uses lib/auth-edge.ts)
├── database/
│   ├── migrations/          ← SQL migrations 002–004
│   └── seeds/               ← 001_agents.sql (canonical seed)
├── n8n-workflows/           ← JSON exports of n8n workflows
├── docker-compose.yml
├── Dockerfile
├── deploy.sh                ← pull + build + up -d + health check
└── schema.sql               ← full DB schema
```

## Stack
- **Frontend:** Next.js 15 App Router + Tailwind CSS, dark mode (`#0a0f1e` base)
- **Backend:** Next.js API Routes + PostgreSQL 16 + Redis 7
- **Infra:** Docker Compose — Caddy + Next.js + PostgreSQL + Redis + n8n + pg-backup
- **n8n:** self-hosted at https://n8n.tuagentestore.com (container: `tuagentestore-n8n-1`)
- **Email:** Gmail OAuth2 via n8n
- **AI:** gpt-4o-mini (demos), gpt-4o (content gen)

## Key lib files
| File | Purpose |
|------|---------|
| `lib/db.ts` | PostgreSQL query helpers (`query`, `queryOne`) |
| `lib/auth.ts` | JWT sign/verify, session helpers |
| `lib/auth-edge.ts` | Edge-compatible auth — used ONLY by `middleware.ts` |
| `lib/n8n.ts` | `triggerN8n(event, payload)` fire-and-forget helper |
| `lib/n8n-catalog.ts` | Static n8n workflow catalog data |
| `lib/openai.ts` | OpenAI client wrapper |
| `lib/redis.ts` | Upstash Redis client |
| `lib/analytics.ts` | Internal analytics helpers |
| `lib/pricing.ts` | Pricing tier logic |
| `lib/ai.ts` | AI utilities |

## API routes
```
/api/activity              GET  — recent activity feed
/api/agents                GET  — agent catalog list
/api/agents/[slug]         GET  — single agent detail
/api/auth/login            POST — JWT login
/api/auth/logout           POST — clear session
/api/auth/me               GET  — current user from JWT
/api/auth/refresh          POST — refresh access token
/api/auth/register         POST — new user registration
/api/auth/google           GET  — OAuth initiate
/api/auth/google/callback  GET  — OAuth callback
/api/calendar              GET/POST — availability / booking
/api/cases                 GET  — case study list
/api/cases/[slug]          GET  — single case detail
/api/chat/sales-agent      POST — Vera sales agent (OpenAI streaming)
/api/demos                 POST — create demo session
/api/demos/[id]/message    POST — send message in demo (called by DemoChat)
/api/health                GET  — { status, db, redis, version }
/api/leads                 POST — capture lead + fire n8n WF01+WF15
/api/notifications         GET  — bell notifications
/api/onboarding/submit     POST — onboarding form submission
/api/reservations          GET/POST — reservation CRUD
/api/reservations/[id]     GET/PATCH/DELETE
/api/stream/activity       GET  — SSE activity stream
/api/stream/publish        POST — push to SSE stream
/api/user-agents           GET  — agents for logged-in user
/api/wizard                POST — wizard recommendation
/api/admin/dashboard       GET  — admin KPIs
/api/admin/reservations    GET  — all reservations
/api/admin/reservations/[id] PATCH/DELETE
/api/admin/users           GET  — all users
/api/admin/users/[id]      PATCH/DELETE
/api/admin/upload          POST — file upload
/api/admin/n8n-status      GET  — n8n webhook health
/api/admin/ad-spend        GET/POST
/api/admin/costs           GET/POST
/api/admin/creatives       GET/POST
/api/admin/income          GET/POST
/api/og                    GET  — OG image generation
```

## n8n webhooks (active)
| WF | Webhook path | Status |
|----|-------------|--------|
| 01 | `lead-created` | Active |
| 02 | `demo-started` | Active |
| 03 | `demo-completed` | Active |
| 04 | `reservation-created` | Active |
| 15 | `lead-intake` | Active (6 email templates) |

N8N_WEBHOOK_BASE = `https://n8n.srv1565607.hstgr.cloud`

## Env vars (required in prod)
```
DATABASE_URL        Neon PostgreSQL connection string
REDIS_URL           Upstash Redis URL
OPENAI_API_KEY      OpenAI key
JWT_SECRET          Random 32+ byte secret
NEXTAUTH_SECRET     Random 32+ byte secret
N8N_WEBHOOK_BASE    https://n8n.srv1565607.hstgr.cloud
NEXT_PUBLIC_APP_URL https://tuagentestore.com
```

## Deploy
```bash
# From local machine (PowerShell / bash):
cd v1
git add <files> && git commit -m "message" && git push origin main

# SSH into VPS and run deploy:
ssh root@76.13.172.79 "cd /opt/tuagentestore && bash deploy.sh"

# Check health after deploy:
curl https://tuagentestore.com/api/health
```

## Pages
| Route | Notes |
|-------|-------|
| `/` | Home — HeroPrimary, FAQ, SocialProof, etc. |
| `/agents` | Agent catalog |
| `/agents/[slug]` | Agent detail with DemoChat |
| `/casos` | Case studies grid |
| `/casos/[slug]` | Case detail |
| `/marketplace` | Marketplace hub |
| `/marketplace/catalogo` | n8n workflow catalog |
| `/marketplace/comparar` | Agent comparison |
| `/empezar` | Lead wizard (alias for `/wizard`) |
| `/wizard` | AI recommendation wizard |
| `/pricing` | Pricing page |
| `/precios` | Redirect → `/pricing` |
| `/contact` | Contact form |
| `/login` | Login |
| `/register` | Registration (phone + industry captured) |
| `/dashboard` | User dashboard (post-login) |
| `/admin` | Admin dashboard |
| `/privacy` | Privacy policy (LPDP + GDPR) |
| `/terms` | Terms of service |
| `/soporte` | Support center |
| `/docs` | Internal docs (not in main nav) |
| `/para/[industry]` | Industry landing pages (not in nav) |
| `/onboarding` | Onboarding flow |

## Database tables (core)
- `users` — registered users
- `agents` — agent catalog
- `reservations` — leads + reservations (plan_interest='lead' for leads)
- `cases` — case studies
- `activity_log` — activity feed

## Important patterns
- **Lead capture:** POST `/api/leads` → inserts to `reservations` (non-fatal if DB down) → fires WF01 + WF15
- **DB errors non-fatal in leads:** catch block logs but doesn't return — n8n always fires
- **Auth gate:** `middleware.ts` protects `/dashboard`, `/admin`, `/onboarding`; catalog shows content immediately, overlay appears after auth resolves
- **Git root is `v1/`** not `v1/app/` — stage files with paths like `app/app/...`
- **SSH via bash tool** (not PowerShell) for VPS operations
