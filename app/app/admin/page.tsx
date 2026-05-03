'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Users, Bot, DollarSign, Eye, CheckCircle, Clock, XCircle,
  RefreshCw, Shield, Settings, UserCog, LayoutDashboard, Image as ImageIcon,
  ChevronDown, Save, Search, Edit2, Upload, Loader2,
  BarChart3, Activity, Film, Plus, ArrowUpRight, TrendingDown,
  CheckSquare, AlertCircle, Zap,
} from 'lucide-react'

// ─── types ───────────────────────────────────────────────────────────
interface KPIs {
  leads_today: number
  demos_24h: number
  revenue_month_usd: number
  reservations_by_status: Record<string, number>
}

interface Reservation {
  id: string; user_name: string; user_email: string; phone: string
  company: string; status: string; plan_interest: string
  agent_name: string | null; created_at: string; admin_notes: string | null
}

interface UserRow {
  id: string; email: string; full_name: string
  role: string; created_at: string; plan: string
}

interface IncomeRow {
  id: string; date: string; client_name: string; agent_sold: string
  plan: string; amount_usd: string; type: string; channel: string; notes: string
}

interface CostRow {
  id: string; month: string; category: string; item: string
  amount_usd: string; recurring: boolean; notes: string
}

interface AdRow {
  id: string; date: string; channel: string; campaign_name: string
  impressions: number; clicks: number; leads: number
  spend_usd: string; revenue_attributed_usd: string
}

interface CreativeRow {
  id: string; date: string; platform: string; format: string
  agent_topic: string; hook: string; status: string
  impressions: number; clicks: number; leads: number; engagement_rate: string
}

interface N8nWorkflow { id: string; name: string; active: boolean; updatedAt: string }
interface N8nExecution { id: string; workflowId: string; status: string; startedAt: string }

// ─── constants ───────────────────────────────────────────────────────
const ROLES = [
  { value: 'admin',             label: 'Admin',             color: 'bg-red-500/10 text-red-400 border-red-500/20',       desc: 'Acceso total' },
  { value: 'manager',           label: 'Manager',           color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', desc: 'Reservas + usuarios' },
  { value: 'community_manager', label: 'Community Manager', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', desc: 'Contenido + imágenes' },
  { value: 'support',           label: 'Soporte',           color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    desc: 'Ver leads + notas' },
  { value: 'user',              label: 'Usuario',           color: 'bg-muted text-muted-foreground border-border',        desc: 'Acceso básico' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin:             ['Ver todo', 'Editar todo', 'Subir imágenes', 'Gestionar usuarios', 'Ver revenue', 'Eliminar contenido'],
  manager:           ['Ver leads', 'Editar leads', 'Gestionar reservas', 'Ver revenue', 'Ver usuarios'],
  community_manager: ['Editar contenido', 'Subir imágenes', 'Ver catálogo', 'Publicar agentes'],
  support:           ['Ver leads', 'Agregar notas', 'Ver reservas'],
  user:              ['Ver su dashboard', 'Ver sus agentes'],
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  new:       { label: 'Nuevo',      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: Eye },
  contacted: { label: 'Contactado', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  qualified: { label: 'Calificado', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: TrendingUp },
  validated: { label: 'Validado',   color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: CheckCircle },
  paid:      { label: 'Pagado',     color: 'bg-green-500/10 text-green-400 border-green-500/20',   icon: DollarSign },
  cancelled: { label: 'Cancelado',  color: 'bg-red-500/10 text-red-400 border-red-500/20',         icon: XCircle },
}

const NEXT_STATUS: Record<string, string> = {
  new: 'contacted', contacted: 'qualified', qualified: 'validated', validated: 'paid',
}

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'leads',      label: 'Leads / CRM',  icon: Users },
  { id: 'financiero', label: 'Financiero',   icon: BarChart3 },
  { id: 'workflows',  label: 'Workflows',    icon: Activity },
  { id: 'creativos',  label: 'Creativos',    icon: Film },
  { id: 'users',      label: 'Usuarios',     icon: UserCog },
  { id: 'content',    label: 'Contenido',    icon: ImageIcon },
] as const
type TabId = typeof TABS[number]['id']

const CREATIVE_STATUSES = ['pending','generated','approved','published','archived']
const PLATFORMS = ['instagram','tiktok','linkedin','youtube','twitter','other']
const FORMATS   = ['reel','carousel','post','story','short','article','email']
const CHANNELS  = ['meta','tiktok','google','linkedin','other']
const COST_CATS = ['hosting','openai','tools','freelancers','ads_mgmt','other']
const INCOME_TYPES = ['implementation','recurring','upsell','diagnostic','refund']
const INCOME_CHANNELS = ['meta_ads','tiktok_ads','google_ads','organic','referral','whatsapp','linkedin','other']

// ─── Known n8n workflows (fallback when API key not configured) ───────
const KNOWN_WORKFLOWS = [
  { id:'01', name:'WF01 — Lead Created',           webhook:'lead-created' },
  { id:'02', name:'WF02 — Demo Started',           webhook:'demo-started' },
  { id:'03', name:'WF03 — Demo Completed',         webhook:'demo-completed' },
  { id:'04', name:'WF04 — Reservation Created',    webhook:'reservation-created' },
  { id:'05', name:'WF05 — Reservation Updated',    webhook:'reservation-updated' },
  { id:'06', name:'WF06 — WhatsApp Intake',        webhook:'whatsapp' },
  { id:'07', name:'WF07 — Nurture Start',          webhook:'nurture-start' },
  { id:'08', name:'WF08 — Content Repurpose',      webhook:'content-repurpose' },
  { id:'09', name:'WF09 — Testimonial Request',    webhook:'request-testimonial' },
  { id:'10', name:'WF10 — Daily Report (cron)',    webhook:'cron-9AM' },
  { id:'12', name:'WF12 — Onboarding Trigger',     webhook:'reservation-updated-wf12' },
  { id:'13', name:'WF13 — Re-engagement (cron)',   webhook:'cron-lunes-10AM' },
  { id:'14', name:'WF14 — Demo-Nurture 5 días',   webhook:'demo-completed-wf14' },
  { id:'15', name:'WF15 — Lead Intake Avanzado',  webhook:'lead-intake' },
]

// ─── helpers ─────────────────────────────────────────────────────────
function fmt(n: string | number) { return `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0 })}` }
function fmtDate(s: string) { return new Date(s).toLocaleDateString('es-AR') }

// ─── component ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>('dashboard')

  // ── core ──
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [editNotesId, setEditNotesId] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null)

  // ── content/upload ──
  const [uploadSlug, setUploadSlug] = useState('')
  const [uploadType, setUploadType] = useState<'agent'|'logo'|'general'>('agent')
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ ok: boolean; url?: string; error?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── financiero ──
  const [finTab, setFinTab] = useState<'income'|'costs'|'ads'>('income')
  const [incomeData, setIncomeData]   = useState<{ rows: IncomeRow[]; summary: Record<string,string>; byChannel: {channel:string;total:string}[] } | null>(null)
  const [costsData, setCostsData]     = useState<{ rows: CostRow[]; byCategory: {category:string;total:string}[]; totalCost: string } | null>(null)
  const [adsData, setAdsData]         = useState<{ rows: AdRow[]; summary: Record<string,string> } | null>(null)
  const [finLoading, setFinLoading]   = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addSaving, setAddSaving]     = useState(false)
  const [addForm, setAddForm]         = useState<Record<string,string>>({})

  // ── workflows ──
  const [wfData, setWfData]       = useState<{ workflows: N8nWorkflow[]; executions: N8nExecution[]; error?: string } | null>(null)
  const [wfLoading, setWfLoading] = useState(false)

  // ── creativos ──
  const [creativesData, setCreativesData]   = useState<{ rows: CreativeRow[]; byStatus: {status:string;count:number}[] } | null>(null)
  const [creativesLoading, setCreativesLoading] = useState(false)
  const [creativesFilter, setCreativesFilter]   = useState('all')
  const [showAddCreative, setShowAddCreative]   = useState(false)
  const [creativeSaving, setCreativeSaving]     = useState(false)
  const [creativeForm, setCreativeForm]         = useState<Record<string,string>>({})

  // ─── initial load ─────────────────────────────────────────────────
  const fetchCore = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/reservations').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/users').then(r => r.ok ? r.json() : null),
    ]).then(([kpisData, resData, usersData]) => {
      if (kpisData) setKpis(kpisData)
      if (resData?.reservations) setReservations(resData.reservations)
      if (usersData?.users) setUsers(usersData.users)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchCore() }, [])

  // ─── lazy loads ───────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== 'financiero' || finLoading) return
    fetchFinanciero()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab !== 'workflows' || wfLoading || wfData) return
    fetchWorkflows()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab !== 'creativos' || creativesLoading || creativesData) return
    fetchCreatives()
  }, [tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFinanciero = async () => {
    setFinLoading(true)
    const [inc, cos, ads] = await Promise.all([
      fetch('/api/admin/income').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/costs').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/ad-spend').then(r => r.ok ? r.json() : null),
    ])
    if (inc) setIncomeData(inc)
    if (cos) setCostsData(cos)
    if (ads) setAdsData(ads)
    setFinLoading(false)
  }

  const fetchWorkflows = async () => {
    setWfLoading(true)
    try {
      const data = await fetch('/api/admin/n8n-status').then(r => r.json())
      setWfData(data)
    } finally { setWfLoading(false) }
  }

  const fetchCreatives = async () => {
    setCreativesLoading(true)
    try {
      const data = await fetch('/api/admin/creatives').then(r => r.ok ? r.json() : null)
      if (data) setCreativesData(data)
    } finally { setCreativesLoading(false) }
  }

  // ─── actions ──────────────────────────────────────────────────────
  const advanceStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    } finally { setUpdating(null) }
  }

  const saveNotes = async (id: string) => {
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: notesText }),
      })
      if (res.ok) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, admin_notes: notesText } : r))
        setEditNotesId(null)
      }
    } finally { setSavingNotes(false) }
  }

  const updateRole = async (userId: string, newRole: string) => {
    setRoleUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } finally { setRoleUpdating(null) }
  }

  const saveFinancialEntry = async () => {
    setAddSaving(true)
    try {
      const endpoint = finTab === 'income' ? '/api/admin/income'
        : finTab === 'costs' ? '/api/admin/costs'
        : '/api/admin/ad-spend'
      const res = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      if (res.ok) { setShowAddForm(false); setAddForm({}); await fetchFinanciero() }
    } finally { setAddSaving(false) }
  }

  const saveCreative = async () => {
    setCreativeSaving(true)
    try {
      const res = await fetch('/api/admin/creatives', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creativeForm),
      })
      if (res.ok) { setShowAddCreative(false); setCreativeForm({}); await fetchCreatives() }
    } finally { setCreativeSaving(false) }
  }

  // ─── derived ──────────────────────────────────────────────────────
  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter)
  const filteredUsers = users.filter(u =>
    !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
  )
  const filteredCreatives = creativesFilter === 'all'
    ? creativesData?.rows ?? []
    : (creativesData?.rows ?? []).filter(c => c.status === creativesFilter)
  const totalLeads = Object.values(kpis?.reservations_by_status ?? {}).reduce((a, b) => a + b, 0)
  const roleConfig = (role: string) => ROLES.find(r => r.value === role) ?? ROLES[ROLES.length - 1]

  // ─── wf map for execution lookup ─────────────────────────────────
  const liveWfMap = Object.fromEntries((wfData?.workflows ?? []).map(w => [w.name, w]))
  const lastExecMap: Record<string, N8nExecution> = {}
  for (const ex of (wfData?.executions ?? [])) {
    if (!lastExecMap[ex.workflowId]) lastExecMap[ex.workflowId] = ex
  }

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-muted-foreground">Panel de Administración</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">TuAgente Store — Admin</h1>
          </div>
          <button
            onClick={fetchCore}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit mb-8 border border-border overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === id
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: DASHBOARD ──────────────────────────── */}
        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Leads hoy',         value: kpis?.leads_today ?? 0,                               icon: Users,      color: 'text-blue-400',   bg: 'from-blue-600/10 to-indigo-600/10',   border: 'border-blue-500/20' },
                { label: 'Demos 24h',          value: kpis?.demos_24h ?? 0,                                 icon: Bot,        color: 'text-indigo-400', bg: 'from-indigo-600/10 to-violet-600/10', border: 'border-indigo-500/20' },
                { label: 'Pipeline total',     value: totalLeads,                                           icon: TrendingUp, color: 'text-violet-400', bg: 'from-violet-600/10 to-purple-600/10', border: 'border-violet-500/20' },
                { label: 'Revenue mes (USD)',  value: `$${(kpis?.revenue_month_usd ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-400',  bg: 'from-green-600/10 to-emerald-600/10', border: 'border-green-500/20' },
              ].map(stat => (
                <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} border ${stat.border} rounded-2xl p-5`}>
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {kpis?.reservations_by_status && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-bold text-foreground mb-4">Pipeline por estado</h2>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(kpis.reservations_by_status).map(([status, count]) => {
                    const cfg = STATUS_CONFIG[status]
                    if (!cfg) return null
                    return (
                      <div key={status} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${cfg.color}`}>
                        <cfg.icon className="w-4 h-4" />
                        {cfg.label}: <strong>{count}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB: LEADS ──────────────────────────────── */}
        {tab === 'leads' && (
          <div className="bg-card border border-border rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
              <h2 className="font-bold text-foreground text-lg">Reservas / Leads</h2>
              <div className="flex gap-2 overflow-x-auto">
                {['all','new','contacted','qualified','validated','paid'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      filter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {s === 'all' ? 'Todos' : STATUS_CONFIG[s]?.label ?? s}
                    {s !== 'all' && kpis?.reservations_by_status[s] ? ` (${kpis.reservations_by_status[s]})` : ''}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No hay reservas en esta categoría</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Lead','Contacto','Agente','Plan','Estado','Fecha','Acciones'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(r => {
                      const cfg  = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.new
                      const next = NEXT_STATUS[r.status]
                      return (
                        <React.Fragment key={r.id}>
                          <tr className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">{r.user_name}</div>
                              <div className="text-xs text-muted-foreground">{r.company ?? '—'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <a href={`mailto:${r.user_email}`} className="text-primary hover:underline text-xs">{r.user_email}</a>
                              <div className="text-xs text-muted-foreground">{r.phone}</div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{r.agent_name ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs capitalize">{r.plan_interest}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                                <cfg.icon className="w-3 h-3" />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(r.created_at)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {next && (
                                  <button
                                    onClick={() => advanceStatus(r.id, next)}
                                    disabled={updating === r.id}
                                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {updating === r.id ? '...' : 'Avanzar'}
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (editNotesId === r.id) setEditNotesId(null)
                                    else { setEditNotesId(r.id); setNotesText(r.admin_notes ?? '') }
                                  }}
                                  className={`p-1.5 rounded-lg transition-colors ${r.admin_notes ? 'bg-yellow-500/10 text-yellow-400' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {editNotesId === r.id && (
                            <tr key={`${r.id}-notes`} className="bg-muted/10">
                              <td colSpan={7} className="px-4 pb-3 pt-1">
                                <div className="flex gap-2 items-start">
                                  <textarea
                                    value={notesText}
                                    onChange={e => setNotesText(e.target.value)}
                                    placeholder="Nota interna..."
                                    rows={2}
                                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50 resize-none"
                                  />
                                  <div className="flex flex-col gap-1 shrink-0">
                                    <button onClick={() => saveNotes(r.id)} disabled={savingNotes}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50">
                                      <Save className="w-3 h-3" />{savingNotes ? '...' : 'Guardar'}
                                    </button>
                                    <button onClick={() => setEditNotesId(null)} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs">Cancelar</button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: FINANCIERO ─────────────────────────── */}
        {tab === 'financiero' && (
          <div className="space-y-6">
            {/* Sub-tabs */}
            <div className="flex gap-2">
              {(['income','costs','ads'] as const).map(t => (
                <button key={t} onClick={() => { setFinTab(t); setShowAddForm(false) }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${finTab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  {t === 'income' ? 'Ingresos' : t === 'costs' ? 'Costos Operativos' : 'Ad Spend'}
                </button>
              ))}
            </div>

            {finLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground p-8"><Loader2 className="w-5 h-5 animate-spin" /> Cargando datos financieros...</div>
            ) : (
              <>
                {/* ── INGRESOS ── */}
                {finTab === 'income' && (
                  <div className="space-y-4">
                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Total ingresos', value: fmt(incomeData?.summary?.total_income ?? 0), icon: ArrowUpRight, color: 'text-green-400' },
                        { label: 'Ticket promedio',  value: fmt(incomeData?.summary?.avg_ticket ?? 0),  icon: DollarSign, color: 'text-blue-400' },
                        { label: 'Ventas cerradas',  value: incomeData?.summary?.count ?? 0,             icon: CheckSquare, color: 'text-indigo-400' },
                      ].map(c => (
                        <div key={c.label} className="bg-card border border-border rounded-xl p-4">
                          <c.icon className={`w-4 h-4 ${c.color} mb-2`} />
                          <div className="text-xl font-bold text-foreground">{c.value}</div>
                          <div className="text-xs text-muted-foreground">{c.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* By channel */}
                    {(incomeData?.byChannel ?? []).length > 0 && (
                      <div className="bg-card border border-border rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Por canal</h3>
                        <div className="flex flex-wrap gap-2">
                          {incomeData?.byChannel.map(c => (
                            <div key={c.channel} className="px-3 py-1.5 rounded-lg bg-muted text-xs">
                              <span className="text-muted-foreground capitalize">{c.channel ?? 'sin canal'}: </span>
                              <span className="font-semibold text-foreground">{fmt(c.total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Table */}
                    <div className="bg-card border border-border rounded-2xl">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">Registros</h3>
                        <button onClick={() => setShowAddForm(v => !v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20">
                          <Plus className="w-3.5 h-3.5" /> Agregar ingreso
                        </button>
                      </div>

                      {showAddForm && (
                        <div className="p-4 border-b border-border bg-muted/10">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                            {[
                              { k:'date', label:'Fecha', type:'date' },
                              { k:'client_name', label:'Cliente', type:'text' },
                              { k:'agent_sold', label:'Agente vendido', type:'text' },
                              { k:'amount_usd', label:'Monto (USD)', type:'number' },
                            ].map(f => (
                              <div key={f.k}>
                                <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                                <input type={f.type} value={addForm[f.k] ?? ''}
                                  onChange={e => setAddForm(p => ({ ...p, [f.k]: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50" />
                              </div>
                            ))}
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Tipo</label>
                              <select value={addForm.type ?? 'implementation'} onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50">
                                {INCOME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Canal origen</label>
                              <select value={addForm.channel ?? ''} onChange={e => setAddForm(p => ({ ...p, channel: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50">
                                <option value="">Sin canal</option>
                                {INCOME_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Notas</label>
                              <input type="text" value={addForm.notes ?? ''} onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveFinancialEntry} disabled={addSaving}
                              className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50">
                              <Save className="w-3 h-3" />{addSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="px-3 py-2 bg-muted text-muted-foreground rounded-lg text-xs">Cancelar</button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="border-b border-border">
                            {['Fecha','Cliente','Agente','Tipo','Canal','Monto'].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-border">
                            {(incomeData?.rows ?? []).map(row => (
                              <tr key={row.id} className="hover:bg-muted/10">
                                <td className="px-4 py-3 text-muted-foreground">{fmtDate(row.date)}</td>
                                <td className="px-4 py-3 font-medium text-foreground">{row.client_name ?? '—'}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.agent_sold ?? '—'}</td>
                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">{row.type}</span></td>
                                <td className="px-4 py-3 text-muted-foreground capitalize">{row.channel ?? '—'}</td>
                                <td className="px-4 py-3 font-bold text-green-400">{fmt(row.amount_usd)}</td>
                              </tr>
                            ))}
                            {!incomeData?.rows?.length && (
                              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin registros aún</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── COSTOS OPERATIVOS ── */}
                {finTab === 'costs' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(costsData?.byCategory ?? []).map(c => (
                        <div key={c.category} className="bg-card border border-border rounded-xl p-4">
                          <TrendingDown className="w-4 h-4 text-red-400 mb-2" />
                          <div className="text-lg font-bold text-foreground">{fmt(c.total)}</div>
                          <div className="text-xs text-muted-foreground capitalize">{c.category}</div>
                        </div>
                      ))}
                      {!costsData?.byCategory?.length && (
                        <div className="col-span-4 bg-card border border-border rounded-xl p-4 text-center text-muted-foreground text-sm">Sin costos registrados aún</div>
                      )}
                    </div>

                    <div className="bg-card border border-border rounded-2xl">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">
                          Costos totales: <span className="text-red-400">{fmt(costsData?.totalCost ?? 0)}</span>
                        </h3>
                        <button onClick={() => setShowAddForm(v => !v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20">
                          <Plus className="w-3.5 h-3.5" /> Agregar costo
                        </button>
                      </div>

                      {showAddForm && (
                        <div className="p-4 border-b border-border bg-muted/10">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                            {[
                              { k:'month', label:'Mes', type:'month' },
                              { k:'item', label:'Ítem', type:'text' },
                              { k:'amount_usd', label:'Monto (USD)', type:'number' },
                            ].map(f => (
                              <div key={f.k}>
                                <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                                <input type={f.type} value={addForm[f.k] ?? ''}
                                  onChange={e => setAddForm(p => ({ ...p, [f.k]: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50" />
                              </div>
                            ))}
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Categoría</label>
                              <select value={addForm.category ?? 'hosting'} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50">
                                {COST_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                              <input type="checkbox" id="recurring" checked={addForm.recurring === 'true'}
                                onChange={e => setAddForm(p => ({ ...p, recurring: String(e.target.checked) }))}
                                className="rounded" />
                              <label htmlFor="recurring" className="text-xs text-muted-foreground">Recurrente</label>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveFinancialEntry} disabled={addSaving}
                              className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50">
                              <Save className="w-3 h-3" />{addSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="px-3 py-2 bg-muted text-muted-foreground rounded-lg text-xs">Cancelar</button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="border-b border-border">
                            {['Mes','Categoría','Ítem','Monto','Recurrente'].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-border">
                            {(costsData?.rows ?? []).map(row => (
                              <tr key={row.id} className="hover:bg-muted/10">
                                <td className="px-4 py-3 text-muted-foreground">{fmtDate(row.month)}</td>
                                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">{row.category}</span></td>
                                <td className="px-4 py-3 font-medium text-foreground">{row.item}</td>
                                <td className="px-4 py-3 font-bold text-red-400">{fmt(row.amount_usd)}</td>
                                <td className="px-4 py-3 text-muted-foreground">{row.recurring ? '✓' : '—'}</td>
                              </tr>
                            ))}
                            {!costsData?.rows?.length && (
                              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sin registros aún</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── AD SPEND ── */}
                {finTab === 'ads' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: 'Total invertido', value: fmt(adsData?.summary?.total_spend ?? 0), color: 'text-red-400' },
                        { label: 'Revenue atribuido', value: fmt(adsData?.summary?.total_revenue ?? 0), color: 'text-green-400' },
                        { label: 'Leads generados', value: adsData?.summary?.total_leads ?? 0, color: 'text-blue-400' },
                        { label: 'Total clicks', value: adsData?.summary?.total_clicks ?? 0, color: 'text-indigo-400' },
                      ].map(c => (
                        <div key={c.label} className="bg-card border border-border rounded-xl p-4">
                          <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{c.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-card border border-border rounded-2xl">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-semibold text-foreground">Registros de inversión publicitaria</h3>
                        <button onClick={() => setShowAddForm(v => !v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20">
                          <Plus className="w-3.5 h-3.5" /> Agregar
                        </button>
                      </div>

                      {showAddForm && (
                        <div className="p-4 border-b border-border bg-muted/10">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                            {[
                              { k:'date', label:'Fecha', type:'date' },
                              { k:'campaign_name', label:'Campaña', type:'text' },
                              { k:'spend_usd', label:'Gasto (USD)', type:'number' },
                              { k:'impressions', label:'Impresiones', type:'number' },
                              { k:'clicks', label:'Clicks', type:'number' },
                              { k:'leads', label:'Leads', type:'number' },
                              { k:'revenue_attributed_usd', label:'Revenue atribuido', type:'number' },
                            ].map(f => (
                              <div key={f.k}>
                                <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                                <input type={f.type} value={addForm[f.k] ?? ''}
                                  onChange={e => setAddForm(p => ({ ...p, [f.k]: e.target.value }))}
                                  className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50" />
                              </div>
                            ))}
                            <div>
                              <label className="block text-xs text-muted-foreground mb-1">Canal</label>
                              <select value={addForm.channel ?? 'meta'} onChange={e => setAddForm(p => ({ ...p, channel: e.target.value }))}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50">
                                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveFinancialEntry} disabled={addSaving}
                              className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium disabled:opacity-50">
                              <Save className="w-3 h-3" />{addSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button onClick={() => setShowAddForm(false)} className="px-3 py-2 bg-muted text-muted-foreground rounded-lg text-xs">Cancelar</button>
                          </div>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead><tr className="border-b border-border">
                            {['Fecha','Canal','Campaña','Gasto','Leads','Clicks','ROAS'].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                            ))}
                          </tr></thead>
                          <tbody className="divide-y divide-border">
                            {(adsData?.rows ?? []).map(row => {
                              const roas = Number(row.spend_usd) > 0
                                ? (Number(row.revenue_attributed_usd) / Number(row.spend_usd)).toFixed(1)
                                : '—'
                              return (
                                <tr key={row.id} className="hover:bg-muted/10">
                                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(row.date)}</td>
                                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted capitalize">{row.channel}</span></td>
                                  <td className="px-4 py-3 text-foreground">{row.campaign_name ?? '—'}</td>
                                  <td className="px-4 py-3 font-bold text-red-400">{fmt(row.spend_usd)}</td>
                                  <td className="px-4 py-3 text-blue-400">{row.leads}</td>
                                  <td className="px-4 py-3 text-muted-foreground">{row.clicks}</td>
                                  <td className={`px-4 py-3 font-semibold ${roas !== '—' && Number(roas) >= 2 ? 'text-green-400' : 'text-muted-foreground'}`}>{roas}</td>
                                </tr>
                              )
                            })}
                            {!adsData?.rows?.length && (
                              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Sin registros aún</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── TAB: WORKFLOWS ──────────────────────────── */}
        {tab === 'workflows' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground text-lg">Estado de Workflows n8n</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {wfData?.error
                    ? <span className="text-yellow-400">{wfData.error} — mostrando listado estático</span>
                    : `${wfData?.workflows?.length ?? KNOWN_WORKFLOWS.length} workflows`}
                </p>
              </div>
              <button onClick={() => { setWfData(null); fetchWorkflows() }}
                disabled={wfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                <RefreshCw className={`w-4 h-4 ${wfLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {wfLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground p-8"><Loader2 className="w-5 h-5 animate-spin" /> Conectando a n8n...</div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    {['WF','Nombre','Webhook / Trigger','Estado','Última ejecución'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {KNOWN_WORKFLOWS.map(wf => {
                      const live = wfData?.workflows?.find(w => w.name.includes(wf.id.split('-')[0]) || w.name.toLowerCase().includes(wf.webhook))
                      const isActive = live ? live.active : true
                      const lastEx   = live ? lastExecMap[live.id] : null
                      return (
                        <tr key={wf.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{wf.id}</td>
                          <td className="px-4 py-3 font-medium text-foreground text-xs">{wf.name.replace(/^WF\d+ — /, '')}</td>
                          <td className="px-4 py-3">
                            <code className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs">{wf.webhook}</code>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${
                              isActive
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground'}`} />
                              {isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {lastEx ? (
                              <span className={`flex items-center gap-1 ${lastEx.status === 'success' ? 'text-green-400' : lastEx.status === 'error' ? 'text-red-400' : 'text-muted-foreground'}`}>
                                {lastEx.status === 'success' ? <CheckSquare className="w-3 h-3" /> : lastEx.status === 'error' ? <AlertCircle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                {lastEx.status} · {fmtDate(lastEx.startedAt)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {wfData?.error && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-sm text-yellow-400">
                <strong>Para ver estado live:</strong> Crear API Key en n8n → Settings &gt; API → agregar <code className="bg-black/20 px-1 rounded">N8N_API_KEY=...</code> al .env del VPS.
              </div>
            )}
          </div>
        )}

        {/* ── TAB: CREATIVOS ──────────────────────────── */}
        {tab === 'creativos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground text-lg">Piezas de Contenido</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{creativesData?.rows?.length ?? 0} piezas registradas</p>
              </div>
              <button onClick={() => setShowAddCreative(v => !v)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20">
                <Plus className="w-4 h-4" /> Nueva pieza
              </button>
            </div>

            {showAddCreative && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Agregar pieza de contenido</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                  {[
                    { k:'date', label:'Fecha', type:'date' },
                    { k:'agent_topic', label:'Agente / tema', type:'text' },
                    { k:'hook', label:'Hook (gancho)', type:'text' },
                    { k:'angle', label:'Ángulo', type:'text' },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="block text-xs text-muted-foreground mb-1">{f.label}</label>
                      <input type={f.type} value={creativeForm[f.k] ?? ''}
                        onChange={e => setCreativeForm(p => ({ ...p, [f.k]: e.target.value }))}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Plataforma</label>
                    <select value={creativeForm.platform ?? 'instagram'} onChange={e => setCreativeForm(p => ({ ...p, platform: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50">
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Formato</label>
                    <select value={creativeForm.format ?? 'reel'} onChange={e => setCreativeForm(p => ({ ...p, format: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50">
                      {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Estado</label>
                    <select value={creativeForm.status ?? 'pending'} onChange={e => setCreativeForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50">
                      {CREATIVE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveCreative} disabled={creativeSaving}
                    className="flex items-center gap-1 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium disabled:opacity-50">
                    <Save className="w-4 h-4" />{creativeSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => setShowAddCreative(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm">Cancelar</button>
                </div>
              </div>
            )}

            {/* Status filter + status counts */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setCreativesFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${creativesFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                Todos ({creativesData?.rows?.length ?? 0})
              </button>
              {CREATIVE_STATUSES.map(s => {
                const count = creativesData?.byStatus?.find(b => b.status === s)?.count ?? 0
                if (!count) return null
                return (
                  <button key={s} onClick={() => setCreativesFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${creativesFilter === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                    {s} ({count})
                  </button>
                )
              })}
            </div>

            {creativesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground p-8"><Loader2 className="w-5 h-5 animate-spin" /> Cargando creativos...</div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    {['Fecha','Plataforma','Formato','Agente / Tema','Hook','Estado','Metrics'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {filteredCreatives.map(c => {
                      const statusColor: Record<string,string> = {
                        pending: 'bg-muted text-muted-foreground', generated: 'bg-blue-500/10 text-blue-400',
                        approved: 'bg-indigo-500/10 text-indigo-400', published: 'bg-green-500/10 text-green-400', archived: 'bg-muted text-muted-foreground'
                      }
                      return (
                        <tr key={c.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(c.date)}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-xs capitalize">{c.platform}</span></td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-xs capitalize">{c.format}</span></td>
                          <td className="px-4 py-3 text-xs font-medium text-foreground max-w-[160px] truncate">{c.agent_topic ?? '—'}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{c.hook ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs capitalize border ${statusColor[c.status] ?? 'bg-muted text-muted-foreground'} border-transparent`}>{c.status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {c.impressions || c.clicks || c.leads
                              ? `${c.impressions} imp · ${c.clicks} clk · ${c.leads} leads`
                              : '—'}
                          </td>
                        </tr>
                      )
                    })}
                    {!filteredCreatives.length && (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        <Film className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        Sin piezas de contenido aún. ¡Agregá la primera!
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: USERS & ROLES ──────────────────────── */}
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4">Niveles de acceso</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <div key={r.value} className={`flex items-start gap-3 p-4 rounded-xl border ${r.color}`}>
                    <div className="flex-1">
                      <div className="text-sm font-semibold mb-1">{r.label}</div>
                      <div className="text-xs opacity-70 mb-2">{r.desc}</div>
                      <div className="flex flex-wrap gap-1">
                        {(ROLE_PERMISSIONS[r.value] ?? []).map(p => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
                <h2 className="font-bold text-foreground text-lg">Usuarios registrados</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Buscar usuario..." value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 w-64" />
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Cargando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      {['Usuario','Email','Plan','Rol actual','Registro','Cambiar rol'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map(u => {
                        const rc = roleConfig(u.role)
                        return (
                          <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">{u.full_name || '—'}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs capitalize">{u.plan || 'starter'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${rc.color}`}>{rc.label}</span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(u.created_at)}</td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} disabled={roleUpdating === u.id}
                                  className="appearance-none pl-3 pr-8 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50 disabled:opacity-50 cursor-pointer">
                                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: CONTENT ────────────────────────────── */}
        {tab === 'content' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-1">Subir imagen</h2>
              <p className="text-sm text-muted-foreground mb-5">JPG, PNG, WebP o SVG · máx. 5 MB</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                  <select value={uploadType} onChange={e => setUploadType(e.target.value as 'agent'|'logo'|'general')}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50">
                    <option value="agent">Imagen de agente</option>
                    <option value="logo">Logo de integración</option>
                    <option value="general">General</option>
                  </select>
                </div>
                {uploadType === 'agent' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Slug del agente</label>
                    <input type="text" placeholder="sales-ai-closer" value={uploadSlug}
                      onChange={e => setUploadSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                )}
              </div>

              <div onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${uploadPreview ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted/20'}`}>
                {uploadPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadPreview} alt="preview" className="max-h-32 rounded-xl object-contain" />
                    <p className="text-xs text-muted-foreground">{uploadFile?.name}</p>
                    <button type="button" onClick={e => { e.stopPropagation(); setUploadPreview(null); setUploadFile(null); setUploadResult(null) }}
                      className="text-xs text-red-400 hover:underline">Cambiar archivo</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">Hacé clic para seleccionar</p>
                    <p className="text-xs">o arrastrá una imagen aquí</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setUploadFile(f); setUploadResult(null)
                  const reader = new FileReader()
                  reader.onload = ev => setUploadPreview(ev.target?.result as string)
                  reader.readAsDataURL(f)
                }} />

              {uploadResult && (
                <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${uploadResult.ok ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {uploadResult.ok ? <>Imagen subida → <code className="font-mono text-xs">{uploadResult.url}</code></> : uploadResult.error}
                </div>
              )}

              <button disabled={!uploadFile || uploading}
                onClick={async () => {
                  if (!uploadFile) return
                  setUploading(true); setUploadResult(null)
                  try {
                    const fd = new FormData()
                    fd.append('file', uploadFile); fd.append('type', uploadType)
                    if (uploadSlug) fd.append('slug', uploadSlug)
                    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                    const data = await res.json()
                    setUploadResult(res.ok ? { ok: true, url: data.url } : { ok: false, error: data.error ?? 'Error al subir' })
                    if (res.ok) { setUploadFile(null); setUploadPreview(null); setUploadSlug('') }
                  } catch { setUploadResult({ ok: false, error: 'Error de red' }) }
                  finally { setUploading(false) }
                }}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow transition-all">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir imagen</>}
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-2">Agentes del catálogo</h2>
              <div className="space-y-2">
                {[
                  { name: 'Sales AI Closer',       slug: 'sales-ai-closer',            cat: 'Ventas' },
                  { name: 'AI Support Agent',       slug: 'ai-support-agent',           cat: 'Soporte' },
                  { name: 'AI Lead Engine',         slug: 'ai-lead-engine',             cat: 'Ventas' },
                  { name: 'Appointment Setting',    slug: 'appointment-setting-agent',  cat: 'Ventas' },
                  { name: 'Marketing AI Agent',     slug: 'marketing-ai-agent',         cat: 'Marketing' },
                  { name: 'E-Commerce Agent',       slug: 'ecommerce-agent',            cat: 'E-Commerce' },
                ].map(a => (
                  <div key={a.name} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{a.name}</div>
                        <div className="text-xs text-muted-foreground">{a.cat} · <span className="font-mono">{a.slug}</span></div>
                      </div>
                    </div>
                    <button onClick={() => { setUploadType('agent'); setUploadSlug(a.slug); setTab('content'); fileInputRef.current?.click() }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-muted border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all">
                      <Upload className="w-3.5 h-3.5" /> Imagen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
