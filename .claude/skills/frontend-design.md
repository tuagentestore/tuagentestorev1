---
name: frontend-design
description: Guardrails de diseño UI para TuAgenteStore — colores, tipografía, sombras, patrones
user-invocable: true
allowed-tools: Read, Glob
---

Antes de cualquier cambio de UI, confirmar que se respetan estas reglas:

## Paleta de colores (obligatorio)
- Base: `#0a0f1e` (dark navy — fondo principal)
- Cards/surfaces: `#1e293b`
- Accent primario: `#06B6D4` (AI Cyan — CTAs, highlights, links)
- Accent secundario: `#8B5CF6` (violeta — badges, tags)
- Texto principal: `#f1f5f9`
- Texto secundario: `#94a3b8`

## Tipografía
- Métricas y números grandes: `font-black` (no `font-bold`)
- Keywords y valor prop: `bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent`
- Subtítulos de sección: `text-2xl font-bold text-slate-100`

## Componentes
- NO usar `transition-all` — usar transiciones específicas como `transition-colors`, `transition-transform`
- NO usar colores Tailwind por defecto (blue-500, indigo-600, gray-800) — usar los de la paleta
- Sombras: `shadow-[0_0_30px_rgba(6,182,212,0.15)]` para glow cyan, no `shadow-lg`
- Bordes: `border border-slate-700/50` — semitransparente

## Verificación obligatoria
Si hay acceso a localhost:3000, hacer screenshot de la página afectada antes de marcar como completado.
Si no hay acceso, describir exactamente qué se cambió y confirmar que ningún color por defecto de Tailwind fue usado.
