import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  const imgBuffer = readFileSync(join(process.cwd(), 'public', 'favicon.png'))
  const src = `data:image/png;base64,${imgBuffer.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Scale up by 1.35x to fill transparent padding, making icon appear larger in browser tabs */}
        <img src={src} style={{ width: 900, height: 900 }} />
      </div>
    ),
    { width: 512, height: 512 },
  )
}
