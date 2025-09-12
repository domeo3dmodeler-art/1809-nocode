import { prisma } from '@/lib/db'

const PRODUCT_TABLE_CANDIDATES = ['products', '"Product"'] as const
const KITS_TABLE_CANDIDATES    = ['kits', '"Kit"'] as const
const HANDLES_TABLE_CANDIDATES = ['handles', '"Handle"'] as const

async function toRegclass(name: string) {
  const rows = await prisma.$queryRaw<{ exists: string | null }[]>`
    SELECT to_regclass('public.${prisma.$unsafe(name)}') as exists
  `
  return rows[0]?.exists ? name : null
}

async function resolveTable(candidates: readonly string[]) {
  for (const t of candidates) {
    const ok = await toRegclass(t)
    if (ok) return ok
  }
  return null
}

export async function POST(req: Request) {
  const { selection } = await req.json()
  const required = ['model','finish','color','type','width','height']
  if (!required.every(k => selection?.[k] !== undefined && selection?.[k] !== null)) {
    return new Response(JSON.stringify({ error: 'selection incomplete' }), { status: 400 })
  }

  const prodTbl   = await resolveTable(PRODUCT_TABLE_CANDIDATES)
  const kitsTbl   = await resolveTable(KITS_TABLE_CANDIDATES)
  const handleTbl = await resolveTable(HANDLES_TABLE_CANDIDATES)

  if (!prodTbl) {
    return new Response(JSON.stringify({ error: 'products table not found' }), { status: 500 })
  }

  // базовый продукт
  const rows = await prisma.$queryRawUnsafe<any[]>(
    `SELECT * FROM ${prodTbl}
     WHERE model = $1 AND finish = $2 AND color = $3 AND type = $4 AND width = $5 AND height = $6
     LIMIT 1`,
    selection.model, selection.finish, selection.color, selection.type, Number(selection.width), Number(selection.height)
  )
  const prod = rows[0]
  const rrc  = Number(prod?.rrc_price || 0)
  let total  = rrc
  const breakdown: { label: string; amount: number }[] = [{ label: 'Полотно (РРЦ)', amount: rrc }]

  // комплект фурнитуры
  if (selection?.hardware_kit?.id && kitsTbl) {
    const kitRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT price_rrc FROM ${kitsTbl} WHERE id = $1 LIMIT 1`, selection.hardware_kit.id
    )
    const k = kitRows[0]
    if (k) { const add = Number(k.price_rrc || 0); total += add; breakdown.push({ label: 'Комплект', amount: add }) }
  }

  // ручка
  if (selection?.handle?.id && handleTbl) {
    const hRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT price_opt, price_group_multiplier FROM ${handleTbl} WHERE id = $1 LIMIT 1`, selection.handle.id
    )
    const h = hRows[0]
    if (h) {
      const add = Number(h.price_opt || 0) * Number(h.price_group_multiplier || 1)
      total += add; breakdown.push({ label: 'Ручка', amount: add })
    }
  }

  return Response.json({ ok: true, currency: 'RUB', base: rrc, breakdown, total })
}
