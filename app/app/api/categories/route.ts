// app/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Возвращаем список «категорий» как уникальные значения поля `type` из таблицы продуктов.
// Если нужно группировать по другому полю (например, `style`), поменяй 'type' ниже.
export async function GET() {
  try {
    // groupBy по полю `type`
    const groups = await prisma.product.groupBy({
      by: ['type'],
      _count: { _all: true },
      orderBy: { type: 'asc' },
    });

    const items = groups
      .filter(g => g.type !== null && g.type !== '')
      .map(g => ({ type: g.type as string, count: (g as any)._count._all as number }));

    return NextResponse.json({
      ok: true,
      total: items.length,
      items,
    });
  } catch (err: any) {
    // Возможный кейс: если в схеме нет поля `type`, можно быстро переключить на `style`
    const msg = err?.message || 'unknown error';
    return NextResponse.json({ ok: false, error: 'categories_failed', message: msg }, { status: 500 });
  }
}
