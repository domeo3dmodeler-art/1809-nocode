import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

const FIELDS = ['style','model','finish','color','type','width','height'] as const
type Field = typeof FIELDS[number]

function buildWhere(selected: Partial<Record<Field, string|number>>) {
  const parts: any[] = []
  if (selected.style   !== undefined && selected.style   !== '') parts.push(Prisma.sql`AND style  = ${selected.style}`)
  if (selected.model   !== undefined && selected.model   !== '') parts.push(Prisma.sql`AND model  = ${selected.model}`)
  if (selected.finish  !== undefined && selected.finish  !== '') parts.push(Prisma.sql`AND finish = ${selected.finish}`)
  if (selected.color   !== undefined && selected.color   !== '') parts.push(Prisma.sql`AND color  = ${selected.color}`)
  if (selected.type    !== undefined && selected.type    !== '') parts.push(Prisma.sql`AND type   = ${selected.type}`)
  if (selected.width   !== undefined && selected.width   !== '') parts.push(Prisma.sql`AND width  = ${Number(selected.width)}`)
  if (selected.height  !== undefined && selected.height  !== '') parts.push(Prisma.sql`AND height = ${Number(selected.height)}`)
  return parts.length ? Prisma.sql`${Prisma.join(parts, Prisma.sql` `)}` : Prisma.sql``
}

async function distinctOf(col: Field, where: any) {
  const order = (col === 'width' || col === 'height')
    ? Prisma.sql`ORDER BY ${Prisma.raw(col)}::int`
    : Prisma.sql`ORDER BY ${Prisma.raw(col)}`
  const rows = await prisma.$queryRaw<{ v: any }[]>(Prisma.sql`
    SELECT DISTINCT ${Prisma.raw(col)} AS v FROM products
    WHERE 1=1 ${where} ${order}
  `)
  return rows.map(r => r.v).filter((x:any)=> x!==null && x!=='')
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const selected: Partial<Record<Field, string|number>> = {}
  FIELDS.forEach(k => {
    const v = url.searchParams.get(k)
    if (v !== null && v !== '') (selected as any)[k] = (k==='width'||k==='height') ? Number(v) : v
  })

  const where = buildWhere(selected)

  // домены
  const styleRows = await prisma.$queryRaw<{v:string}[]>(Prisma.sql`
    SELECT DISTINCT style AS v FROM products
    WHERE 1=1 ${selected.style? Prisma.sql`AND style = ${selected.style}` : Prisma.sql``}
    ORDER BY style
  `)
  const style  = styleRows.map(r=>r.v).filter(Boolean)
  const model  = await distinctOf('model',  where)
  const finish = await distinctOf('finish', where)
  const color  = await distinctOf('color',  where)
  const type   = await distinctOf('type',   where)
  const width  = await distinctOf('width',  where)
  const height = await distinctOf('height', where)

  // доп. домены
  let kits:any[] = []; let handles:any[] = []
  try {
    kits = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT id, COALESCE(name,'') AS name, COALESCE(price_rrc,0)::numeric AS price_rrc
      FROM kits ORDER BY name
    `)
  } catch {}
  try {
    handles = await prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT id, COALESCE(name_web,'') AS name_web,
             COALESCE(price_opt,0)::numeric AS price_opt,
             COALESCE(price_group_multiplier,1)::numeric AS price_group_multiplier
      FROM handles ORDER BY name_web
    `)
  } catch {}

  return Response.json({ style, model, finish, color, type, width, height, kits, handles })
}
