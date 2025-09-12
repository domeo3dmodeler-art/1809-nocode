import { prisma } from '@/lib/db'

// безопасный белый список допустимых имён таблиц
const PRODUCT_TABLE_CANDIDATES = ['products', '"Product"'] as const

async function pickTable(name: string) {
  // to_regclass вернёт NULL, если таблицы нет
  const rows = await prisma.$queryRaw<{ exists: string | null }[]>`
    SELECT to_regclass('public.${prisma.$unsafe(name)}') as exists
  `
  return rows[0]?.exists ? name : null
}

async function resolveProductTable() {
  for (const t of PRODUCT_TABLE_CANDIDATES) {
    const ok = await pickTable(t)
    if (ok) return ok
  }
  throw new Error('products table not found (tried products and "Product")')
}

export async function GET() {
  const tbl = await resolveProductTable()

  // Собираем поля через $queryRawUnsafe (строго с whitelisted именем)
  const q = (col: string) =>
    prisma.$queryRawUnsafe<{ v: string }[]>(
      `SELECT DISTINCT ${col} as v FROM ${tbl} WHERE ${col} IS NOT NULL`
    )

  const [models, finishes, colors, types] = await Promise.all([
    q('model'), q('finish'), q('color'), q('type')
  ])

  return Response.json({
    model:   models.map(m => m.v).filter(Boolean),
    finish:  finishes.map(f => f.v).filter(Boolean),
    color:   colors.map(c => c.v).filter(Boolean),
    type:    types.map(t => t.v).filter(Boolean),
  })
}
