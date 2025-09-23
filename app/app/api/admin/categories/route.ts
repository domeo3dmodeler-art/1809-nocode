export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const list = await prisma.category.findMany({ include: { attributes: true } });
  return NextResponse.json(list);
}
export async function POST(req: Request) {
  const b = await req.json();
  const created = await prisma.category.create({ data: { code: b.code, name: b.name } });
  return NextResponse.json(created);
}
