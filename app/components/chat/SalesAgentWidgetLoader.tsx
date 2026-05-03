'use client'
import dynamic from 'next/dynamic'

const SalesAgentWidget = dynamic(
  () => import('./SalesAgentWidget'),
  { ssr: false }
)

export default SalesAgentWidget
