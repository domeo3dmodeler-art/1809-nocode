import { prisma } from '@/lib/db'

type Row = { model?: string; finish?: string; color?: string; type?: string }

export async function GET() {
  try {
    const models   = await prisma.$queryRaw<Row[]>`SELECT DISTINCT model  FROM products WHERE model  IS NOT NULL`
    const finishes = await prisma.$queryRaw<Row[]>`SELECT DISTINCT finish FROM products WHERE finish IS NOT NULL`
    const colors   = await prisma.$queryRaw<Row[]>`SELECT DISTINCT color  FROM products WHERE color  IS NOT NULL`
    const types    = await prisma.$queryRaw<Row[]>`SELECT DISTINCT type   FROM products WHERE type   IS NOT NULL`

    return Response.json({
      model:  models.map(x => x.model!).filter(Boolean),
      finish: finishes.map(x => x.finish!).filter(Boolean),
      color:  colors.map(x => x.color!).filter(Boolean),
      type:   types.map(x => x.type!).filter(Boolean),
    })
  } catch (e: any) {
    console.error('[options] fallback:', e?.message || e)
    // Дев-фоллбек, чтобы фронт ожил до наличия БД (см. Master Spec: /options обязателен для smoke). :contentReference[oaicite:0]{index=0}
    return Response.json({
      model: ['PG Base 1'],
      finish: ['Нанотекс'],
      color: ['Белый'],
      type: ['Распашная'],
    })
  }
}
