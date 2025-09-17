// app/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Категории = уникальные значения по полю `type` из products
export async function GET() {
  try {
    // Вариант 1: groupBy (быстрее, если поддерживается)
    const groups = await prisma.products.groupBy({
      by: ['type'],
      _count: { _all: true },
      orderBy: { type: 'asc' },
    });

    const items = groups
      .filter(g => g.type !== null && g.type !== '')
      .map(g => ({ type: g.type as string, count: (g as any)._count._all as number }));

    return NextResponse.json({ ok: true, total: items.length, items });
  } catch (err) {
    // Фолбэк: distinct (если groupBy для модели не поддержан)
    try {
      const rows = await prisma.products.findMany({
        where: { NOT: [{ type: null }, { type: '' }] },
        distinct: ['type'],
        select: { type: true },
        orderBy: { type: 'asc' },
      });

      // посчитаем количество для каждого type отдельным запросом (реже нужно)
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
