import { NextRequest, NextResponse } from 'next/server'
import { login, seedAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  await seedAdmin()
  const token = await login(email, password)
  if (!token) return NextResponse.json({ error: 'invalid' }, { status: 401 })
  return NextResponse.json({ token })
}
