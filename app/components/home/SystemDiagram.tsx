'use client'
import { useRef } from 'react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { useGSAP } from '@gsap/react'

// DrawSVGPlugin requires GSAP Club — using strokeDashoffset manually instead
// for the same signal-flow effect without the paid plugin.

const INTEGRATIONS = [
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', angle: -90 },
  { id: 'hubspot',  label: 'HubSpot',  color: '#FF7A59', angle: -30 },
  { id: 'shopify',  label: 'Shopify',  color: '#96BF48', angle: 30 },
  { id: 'calendar', label: 'Calendar', color: '#4285F4', angle: 90 },
  { id: 'n8n',      label: 'n8n',      color: '#EA4B71', angle: 150 },
  { id: 'zapier',   label: 'Zapier',   color: '#FF4A00', angle: -150 },
]

const CX = 200
const CY = 200
const R = 130
const NODE_R = 28

function toXY(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) }
}

const PATH_LEN = 136

export default function SystemDiagram() {
  const svgRef = useRef<SVGSVGElement>(null)

  useGSAP(() => {
    const lines = svgRef.current?.querySelectorAll<SVGLineElement>('.sd-line')
    if (!lines) return

    lines.forEach((line, i) => {
      gsap.set(line, { strokeDasharray: PATH_LEN, strokeDashoffset: PATH_LEN })
      gsap.to(line, {
        strokeDashoffset: 0,
        duration: 0.6,
        delay: 0.2 + i * 0.1,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.to(line, {
            strokeDashoffset: -PATH_LEN,
            duration: 1.2,
            ease: 'none',
            repeat: -1,
            repeatDelay: 1.5 + i * 0.3,
          })
        },
      })
    })

    gsap.fromTo(
      svgRef.current?.querySelectorAll('.sd-node') ?? [],
      { scale: 0, transformOrigin: '50% 50%' },
      { scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)', delay: 0.1 }
    )
  }, { scope: svgRef })

  return (
    <div className="flex justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        className="w-full max-w-[400px]"
        aria-label="Diagrama de sistema TuAgenteStore"
      >
        {/* Connection lines */}
        {INTEGRATIONS.map(({ id, color, angle }) => {
          const { x, y } = toXY(angle)
          return (
            <line
              key={id}
              className="sd-line"
              x1={CX} y1={CY} x2={x} y2={y}
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          )
        })}

        {/* Center node */}
        <g className="sd-node">
          <circle cx={CX} cy={CY} r={48} fill="#1e3a8a" opacity="0.15" />
          <circle cx={CX} cy={CY} r={38} fill="#1e3a8a" />
          <circle cx={CX} cy={CY} r={38} fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.6" />
          <text x={CX} y={CY - 6} textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="system-ui">TuAgente</text>
          <text x={CX} y={CY + 7} textAnchor="middle" fill="#06B6D4" fontSize="7" fontWeight="600" fontFamily="system-ui">STORE</text>
          {/* Pulse ring */}
          <circle cx={CX} cy={CY} r={44} fill="none" stroke="#06B6D4" strokeWidth="1" opacity="0.3">
            <animate attributeName="r" values="38;52;38" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Integration nodes */}
        {INTEGRATIONS.map(({ id, label, color, angle }) => {
          const { x, y } = toXY(angle)
          return (
            <g key={id} className="sd-node">
              <circle cx={x} cy={y} r={NODE_R} fill={color} opacity="0.12" />
              <circle cx={x} cy={y} r={NODE_R - 4} fill={color} opacity="0.18" />
              <circle cx={x} cy={y} r={NODE_R - 8} fill={color} opacity="0.9" />
              <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="6.5" fontWeight="700" fontFamily="system-ui">
                {label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
