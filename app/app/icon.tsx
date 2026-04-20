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
          background: '#0e1529',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* The logo PNG is landscape with significant whitespace.
            Setting width to 740px in a 512px overflow:hidden container
            crops ~114px of whitespace from each horizontal side,
            making the actual icon glyph fill ~95% of the canvas. */}
        <img src={src} style={{ width: 740, flexShrink: 0 }} />
      </div>
    ),
    { width: 512, height: 512 },
  )
}
