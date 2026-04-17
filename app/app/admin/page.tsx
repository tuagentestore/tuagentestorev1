'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  TrendingUp, Users, Bot, DollarSign, Eye, CheckCircle, Clock, XCircle,
  RefreshCw, Shield, Settings, UserCog, LayoutDashboard, Image as ImageIcon,
  ChevronDown, Save, Search, Edit2, Trash2, Plus, Upload, Loader2,
} from 'lucide-react'

// ─── types ───────────────────────────────────────────────────────────
interface KPIs {
  leads_today: number
  demos_24h: number
  revenue_month_usd: number
  reservations_by_status: Record<string, number>
}

interface Reservation {
  id: string
  user_name: string
  user_email: string
  phone: string
  company: string
  status: string
  plan_interest: string
  agent_name: string | null
  created_at: string
  admin_notes: string | null
}

interface UserRow {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  plan: string
}

// ─── constants ───────────────────────────────────────────────────────
const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-red-500/10 text-red-400 border-red-500/20', desc: 'Acceso total' },
  { value: 'manager', label: 'Manager', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', desc: 'Reservas + usuarios' },
  { value: 'community_manager', label: 'Community Manager', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', desc: 'Contenido + imágenes' },
  { value: 'support', label: 'Soporte', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', desc: 'Ver leads + notas' },
  { value: 'user', label: 'Usuario', color: 'bg-muted text-muted-foreground border-border', desc: 'Acceso básico' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['Ver todo', 'Editar todo', 'Subir imágenes', 'Gestionar usuarios', 'Ver revenue', 'Eliminar contenido'],
  manager: ['Ver leads', 'Editar leads', 'Gestionar reservas', 'Ver revenue', 'Ver usuarios'],
  community_manager: ['Editar contenido', 'Subir imágenes', 'Ver catálogo', 'Publicar agentes'],
  support: ['Ver leads', 'Agregar notas', 'Ver reservas'],
  user: ['Ver su dashboard', 'Ver sus agentes'],
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  new: { label: 'Nuevo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Eye },
  contacted: { label: 'Contactado', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  qualified: { label: 'Calificado', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: TrendingUp },
  validated: { label: 'Validado', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20', icon: CheckCircle },
  paid: { label: 'Pagado', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: DollarSign },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
}

const NEXT_STATUS: Record<string, string> = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'validated',
  validated: 'paid',
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads / Reservas', icon: Users },
  { id: 'users', label: 'Usuarios & Roles', icon: UserCog },
  { id: 'content', label: 'Contenido', icon: ImageIcon },
] as const
type TabId = typeof TABS[number]['id']

// ─── component ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>('dashboard')
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [users, setUsers] = useState<UserRow[]>([])
  const [filter, setFilter] = useState('all')
  const [uploadSlug, setUploadSlug] = useState('')
  const [uploadType, setUploadType] = useState<'agent' | 'logo' | 'general'>('agent')
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{ ok: boolean; url?: string; error?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null)

  const fetchData = () => {
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

  useEffect(() => { fetchData() }, [])

  const advanceStatus = async (id: string, newStatus: string) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    } finally { setUpdating(null) }
  }

  const updateRole = async (userId: string, newRole: string) => {
    setRoleUpdating(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } finally { setRoleUpdating(null) }
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter)
  const filteredUsers = users.filter(u =>
    userSearch === '' ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
  )
  const totalLeads = Object.values(kpis?.reservations_by_status ?? {}).reduce((a, b) => a + b, 0)

  const roleConfig = (role: string) => ROLES.find(r => r.value === role) ?? ROLES[ROLES.length - 1]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
            onClick={fetchData}
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
                { label: 'Leads hoy', value: kpis?.leads_today ?? 0, icon: Users, color: 'text-blue-400', bg: 'from-blue-600/10 to-indigo-600/10', border: 'border-blue-500/20' },
                { label: 'Demos 24h', value: kpis?.demos_24h ?? 0, icon: Bot, color: 'text-indigo-400', bg: 'from-indigo-600/10 to-violet-600/10', border: 'border-indigo-500/20' },
                { label: 'Pipeline total', value: totalLeads, icon: TrendingUp, color: 'text-violet-400', bg: 'from-violet-600/10 to-purple-600/10', border: 'border-violet-500/20' },
                { label: 'Revenue mes (USD)', value: `$${(kpis?.revenue_month_usd ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-400', bg: 'from-green-600/10 to-emerald-600/10', border: 'border-green-500/20' },
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
                {['all', 'new', 'contacted', 'qualified', 'validated', 'paid'].map(s => (
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
                      {['Lead', 'Contacto', 'Agente', 'Plan', 'Estado', 'Fecha', 'Acción'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map(r => {
                      const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.new
                      const next = NEXT_STATUS[r.status]
                      return (
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
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
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {new Date(r.created_at).toLocaleDateString('es-AR')}
                          </td>
                          <td className="px-4 py-3">
                            {next && (
                              <button
                                onClick={() => advanceStatus(r.id, next)}
                                disabled={updating === r.id}
                                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 whitespace-nowrap"
                              >
                                {updating === r.id ? '...' : `Avanzar`}
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: USERS & ROLES ──────────────────────── */}
        {tab === 'users' && (
          <div className="space-y-6">
            {/* Role legend */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-4">Niveles de acceso</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ROLES.map(r => (
                  <div key={r.value} className={`flex items-start gap-3 p-4 rounded-xl border ${r.color}`}>
                    <div className="flex-1">
                      <div className={`text-sm font-semibold mb-1`}>{r.label}</div>
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

            {/* User list */}
            <div className="bg-card border border-border rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-border">
                <h2 className="font-bold text-foreground text-lg">Usuarios registrados</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50 w-64"
                  />
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-muted-foreground">Cargando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {['Usuario', 'Email', 'Plan', 'Rol actual', 'Registro', 'Cambiar rol'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map(u => {
                        const rc = roleConfig(u.role)
                        return (
                          <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-foreground">{u.full_name || '—'}</div>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs capitalize">{u.plan || 'starter'}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${rc.color}`}>
                                {rc.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString('es-AR')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <select
                                  value={u.role}
                                  onChange={e => updateRole(u.id, e.target.value)}
                                  disabled={roleUpdating === u.id}
                                  className="appearance-none pl-3 pr-8 py-1.5 bg-background border border-border rounded-lg text-xs focus:outline-none focus:border-primary/50 disabled:opacity-50 cursor-pointer"
                                >
                                  {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                  ))}
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

            {/* ── Upload panel ── */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-1">Subir imagen</h2>
              <p className="text-sm text-muted-foreground mb-5">JPG, PNG, WebP o SVG · máx. 5 MB</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Type selector */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo</label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as 'agent' | 'logo' | 'general')}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="agent">Imagen de agente</option>
                    <option value="logo">Logo de integración</option>
                    <option value="general">General</option>
                  </select>
                </div>

                {/* Slug (optional) */}
                {uploadType === 'agent' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Slug del agente <span className="text-muted-foreground/50">(opcional)</span></label>
                    <input
                      type="text"
                      placeholder="sales-ai-closer"
                      value={uploadSlug}
                      onChange={e => setUploadSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  uploadPreview ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-muted/20'
                }`}
              >
                {uploadPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadPreview} alt="preview" className="max-h-32 rounded-xl object-contain" />
                    <p className="text-xs text-muted-foreground">{uploadFile?.name}</p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setUploadPreview(null); setUploadFile(null); setUploadResult(null) }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Cambiar archivo
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8 opacity-40" />
                    <p className="text-sm font-medium">Hacé clic para seleccionar</p>
                    <p className="text-xs">o arrastrá una imagen aquí</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setUploadFile(f)
                  setUploadResult(null)
                  const reader = new FileReader()
                  reader.onload = ev => setUploadPreview(ev.target?.result as string)
                  reader.readAsDataURL(f)
                }}
              />

              {uploadResult && (
                <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                  uploadResult.ok
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {uploadResult.ok
                    ? <>Imagen subida exitosamente → <code className="font-mono text-xs">{uploadResult.url}</code></>
                    : uploadResult.error}
                </div>
              )}

              <button
                disabled={!uploadFile || uploading}
                onClick={async () => {
                  if (!uploadFile) return
                  setUploading(true)
                  setUploadResult(null)
                  try {
                    const fd = new FormData()
                    fd.append('file', uploadFile)
                    fd.append('type', uploadType)
                    if (uploadSlug) fd.append('slug', uploadSlug)
                    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                    const data = await res.json()
                    setUploadResult(res.ok ? { ok: true, url: data.url } : { ok: false, error: data.error ?? 'Error al subir' })
                    if (res.ok) { setUploadFile(null); setUploadPreview(null); setUploadSlug('') }
                  } catch {
                    setUploadResult({ ok: false, error: 'Error de red' })
                  } finally {
                    setUploading(false)
                  }
                }}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow transition-all"
              >
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir imagen</>}
              </button>
            </div>

            {/* ── Agent list ── */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-bold text-foreground mb-2">Agentes del catálogo</h2>
              <p className="text-sm text-muted-foreground mb-4">Listado de agentes activos en el marketplace</p>
              <div className="space-y-2">
                {[
                  { name: 'Sales AI Closer', slug: 'sales-ai-closer', cat: 'Ventas', status: 'Publicado' },
                  { name: 'AI Support Agent', slug: 'ai-support-agent', cat: 'Soporte', status: 'Publicado' },
                  { name: 'AI Lead Engine', slug: 'ai-lead-engine', cat: 'Ventas', status: 'Publicado' },
                  { name: 'Appointment Setting', slug: 'appointment-setting-agent', cat: 'Ventas', status: 'Publicado' },
                  { name: 'Marketing AI Agent', slug: 'marketing-ai-agent', cat: 'Marketing', status: 'Publicado' },
                  { name: 'E-Commerce Agent', slug: 'ecommerce-agent', cat: 'E-Commerce', status: 'Publicado' },
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
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs">{a.status}</span>
                      <button
                        onClick={() => { setUploadType('agent'); setUploadSlug(a.slug); setTab('content'); fileInputRef.current?.click() }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-muted border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-primary/30 transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Imagen
                      </button>
                    </div>
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
