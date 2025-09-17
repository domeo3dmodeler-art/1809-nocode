import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: any = {}
  try { body = await req.json() } catch {}
  return NextResponse.json({ ok: true, type: 'kp', received: body ?? {} }, { status: 200 })
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}
