import { NextResponse, type NextRequest } from 'next/server'
import { invalidateSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value

  if (accessToken) {
    await invalidateSession(accessToken, refreshToken)
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  return response
}
