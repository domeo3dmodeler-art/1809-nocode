import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function POST(req: Request) {
  const { selection } = await req.json()
  const need = ['model','finish','color','type','width','height'] as const
  if (!selection || !need.every(k => selection[k] !== undefined && selection[k] !== null)) {
    return new Response(JSON.stringify({ error: 'selection incomplete' }), { status: 400 })
  }

  const baseRow = await prisma.$queryRaw<any[]>(Prisma.sql`
    SELECT COALESCE(rrc_price,0)::numeric AS rrc_price
    FROM products
    WHERE model=${selection.model} AND finish=${selection.finish} AND color=${selection.color}
      AND type=${selection.type} AND width=${Number(selection.width)} AND height=${Number(selection.height)}
    LIMIT 1
  `)
  const base = Number(baseRow?.[0]?.rrc_price || 0)

  let addKit = 0
  if (selection?.hardware_kit?.id) {
    const k = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT COALESCE(price_rrc,0)::numeric AS price_rrc FROM kits WHERE id=${selection.hardware_kit.id} LIMIT 1
    `)
    addKit = Number(k?.[0]?.price_rrc || 0)
  }

  let addHandle = 0
  if (selection?.handle?.id) {
    const h = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT COALESCE(price_opt,0)::numeric AS price_opt,
             COALESCE(price_group_multiplier,1)::numeric AS mul
      FROM handles WHERE id=${selection.handle.id} LIMIT 1
    `)
    addHandle = Number(h?.[0]?.price_opt || 0) * Number(h?.[0]?.mul || 1)
  }

  const breakdown = [
    { label: 'Полотно (РРЦ)', amount: base },
    ...(addKit    ? [{ label: 'Комплект фурнитуры', amount: addKit }] : []),
    ...(addHandle ? [{ label: 'Ручка', amount: Math.round(addHandle) }] : []),
  ]
  const total = Math.round(base + addKit + addHandle)

  return Response.json({ ok: true, currency: 'RUB', base, breakdown, total })
}
