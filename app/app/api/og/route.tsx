import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') ?? 'TuAgente Store'
  const subtitle = searchParams.get('subtitle') ?? 'Marketplace de Agentes IA para empresas latinoamericanas'
  const type = searchParams.get('type') ?? 'default' // 'agent' | 'case' | 'default'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 50%, #111827 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 72px',
            height: '100%',
          }}
        >
          {/* Top: logo area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              🤖
            </div>
            <span style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>
              TuAgente Store
            </span>
          </div>

          {/* Middle: main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {type === 'agent' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 999,
                  padding: '6px 16px',
                  width: 'fit-content',
                  color: '#a5b4fc',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ⚡ Agente IA
              </div>
            )}
            {type === 'case' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(34,197,94,0.15)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 999,
                  padding: '6px 16px',
                  width: 'fit-content',
                  color: '#86efac',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                📊 Caso de Implementación
              </div>
            )}

            <h1
              style={{
                color: '#f8fafc',
                fontSize: title.length > 50 ? 44 : 54,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-1px',
                margin: 0,
                maxWidth: 780,
              }}
            >
              {title}
            </h1>

            <p
              style={{
                color: '#94a3b8',
                fontSize: 22,
                lineHeight: 1.5,
                margin: 0,
                maxWidth: 680,
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom: badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {['Listo en 24h', 'Sin código', 'Soporte incluido'].map(badge => (
              <div
                key={badge}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: '#cbd5e1',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <span style={{ color: '#4ade80', fontSize: 16 }}>✓</span>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
