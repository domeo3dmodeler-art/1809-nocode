export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

// app/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Категории = уникальные значения по полю `type` из products
export async function GET() {
  try {
    // Быстрый путь: groupBy
    const groups = await prisma.products.groupBy({
      by: ['type'],
      _count: { _all: true },
      orderBy: { type: 'asc' },
    });

    const items = groups
      .filter(g => (g.type as string) !== '')
      .map(g => ({ type: g.type as string, count: (g as any)._count._all as number }));

    return NextResponse.json({ ok: true, total: items.length, items });
  } catch (_err) {
    // Фолбэк: distinct + последующий count
    try {
      const rows = await prisma.products.findMany({
        where: { type: { not: '' } },     // без not: null — поле не nullable
        distinct: ['type'],
        select: { type: true },
        orderBy: { type: 'asc' },
      });

      const items = await Promise.all(
        rows.map(async r => ({
          type: r.type as string,
          count: await prisma.products.count({ where: { type: r.type as string } }),
        }))
      );

      return NextResponse.json({ ok: true, total: items.length, items });
    } catch (e: any) {
      return NextResponse.json(
        { ok: false, error: 'categories_failed', message: e?.message || 'unknown error' },
        { status: 500 }
      );
    }
  }
}
