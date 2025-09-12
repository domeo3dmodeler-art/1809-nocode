import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verify } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!verify(token)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!verify(token)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { slug, title } = await req.json()
  const cat = await prisma.category.create({ data: { slug, title } })
  return NextResponse.json(cat)
}
