// app/api/catalog/doors/options/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // если у тебя иной хелпер — скажи, адаптирую

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const model  = searchParams.get('model');
  const finish = searchParams.get('finish');
  const type   = searchParams.get('type');
  const width  = searchParams.get('width')  ? Number(searchParams.get('width'))  : null;
  const height = searchParams.get('height') ? Number(searchParams.get('height')) : null;

  // Домены конфигуратора
  const domains = await prisma.$queryRawUnsafe(`
    SELECT DISTINCT model, finish, color, type, width, height
    FROM doors_catalog
    ORDER BY model, finish, color, type, width, height
    LIMIT 10000
  `);

  const hasAnyFilter = !!(model || finish || type || width || height);

  // KITS
  const kits = hasAnyFilter
    ? await prisma.$queryRaw`
        SELECT k.*
        FROM kits k
        LEFT JOIN kit_suiting s ON s.kit_id = k.id
        WHERE
          ( ${model}::text  IS NULL OR s.model  IS NULL OR s.model  = ${model}::text ) AND
          ( ${finish}::text IS NULL OR s.finish IS NULL OR s.finish = ${finish}::text ) AND
          ( ${type}::text   IS NULL OR s.type   IS NULL OR s.type   = ${type}::text )   AND
          ( ${width}::int   IS NULL OR s.width_min  IS NULL OR s.width_min  <= ${width}::int ) AND
          ( ${width}::int   IS NULL OR s.width_max  IS NULL OR s.width_max  >= ${width}::int ) AND
          ( ${height}::int  IS NULL OR s.height_min IS NULL OR s.height_min <= ${height}::int ) AND
          ( ${height}::int  IS NULL OR s.height_max IS NULL OR s.height_max >= ${height}::int )
        GROUP BY k.id
        ORDER BY k.id
      `
    : await prisma.$queryRaw`SELECT * FROM kits ORDER BY id`;

  // HANDLES
  const handles = hasAnyFilter
    ? await prisma.$queryRaw`
        SELECT h.*
        FROM handles h
        LEFT JOIN handle_suiting s ON s.handle_id = h.id
        WHERE
          ( ${model}::text  IS NULL OR s.model  IS NULL OR s.model  = ${model}::text ) AND
          ( ${finish}::text IS NULL OR s.finish IS NULL OR s.finish = ${finish}::text ) AND
          ( ${type}::text   IS NULL OR s.type   IS NULL OR s.type   = ${type}::text )   AND
          ( ${width}::int   IS NULL OR s.width_min  IS NULL OR s.width_min  <= ${width}::int ) AND
          ( ${width}::int   IS NULL OR s.width_max  IS NULL OR s.width_max  >= ${width}::int ) AND
          ( ${height}::int  IS NULL OR s.height_min IS NULL OR s.height_min <= ${height}::int ) AND
          ( ${height}::int  IS NULL OR s.height_max IS NULL OR s.height_max >= ${height}::int )
        GROUP BY h.id
        ORDER BY h.id
      `
    : await prisma.$queryRaw`SELECT * FROM handles ORDER BY id`;

  return NextResponse.json({ domains, kits, handles });
}
