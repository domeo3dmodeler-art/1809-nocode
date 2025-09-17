import { prisma } from '@/lib/db'
import { parse as parseCsv } from 'csv-parse/sync'
import * as XLSX from 'xlsx'

type Row = {
  style?: string
  model: string
  finish: string
  color: string
  type: string
  width: number | string
  height: number | string
  rrc_price: number | string
  model_photo?: string
}

function normalize(r: any): Row {
  const mapKey = (s: string) => (s||'').trim().toLowerCase()
  const key = (k: string) => Object.keys(r).find(x => x && x.toLowerCase() === k)
  const val = (k: string) => (key(k) ? r[key(k)!] : undefined)

  return {
    style: val('style') ?? val('стиль'),
    model: String(val('model') ?? val('модель') ?? '').trim(),
    finish: String(val('finish') ?? val('покрытие') ?? '').trim(),
    color: String(val('color') ?? val('цвет') ?? '').trim(),
    type: String(val('type') ?? val('тип') ?? '').trim(),
    width: Number(val('width') ?? val('ширина') ?? 0),
    height: Number(val('height') ?? val('высота') ?? 0),
    rrc_price: Number(String(val('rrc_price') ?? val('цена') ?? 0).replace(',','.')),
    model_photo: val('model_photo') ?? val('фото'),
  }
}

function groupKey(r: Row) {
  return [r.model, r.finish, r.color, r.type, r.width, r.height].join('|')
}

async function bufferFromFile(file: File): Promise<Buffer> {
  const ab = await file.arrayBuffer()
  return Buffer.from(new Uint8Array(ab))
}

function rowsFromBuffer(name: string, buf: Buffer): Row[] {
  if (name.toLowerCase().endsWith('.csv')) {
    const rows = parseCsv(buf, { columns: true, skip_empty_lines: true, bom: true })
    return (rows as any[]).map(normalize)
  }
  if (/\.(xlsx?|xlsm)$/i.test(name)) {
    const wb = XLSX.read(buf, { type: 'buffer' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
    return (rows as any[]).map(normalize)
  }
  throw new Error('Unsupported file type')
}

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return new Response(JSON.stringify({ error: 'file is required' }), { status: 400 })

  const buf = await bufferFromFile(file)
  const data = rowsFromBuffer(file.name || 'import.xlsx', buf).filter(r => r.model && r.finish && r.color && r.type)

  if (!data.length) return new Response(JSON.stringify({ error: 'no rows' }), { status: 400 })

  // 1) соберём конфликты внутри файла
  const byKey = new Map<string, Row[]>()
  for (const r of data) {
    const k = groupKey(r)
    if (!byKey.has(k)) byKey.set(k, [])
    byKey.get(k)!.push(r)
  }
  const conflicts: { key: string; rows: Row[] }[] = []
  for (const [k, rows] of byKey) {
    const prices = Array.from(new Set(rows.map(x => Number(x.rrc_price||0))))
    if (prices.length > 1) conflicts.push({ key: k, rows })
  }

  // 2) добьём конфликты с БД (если в базе уже есть другая РРЦ)
  if (conflicts.length === 0) {
    for (const [k, rows] of byKey) {
      const [model, finish, color, type, width, height] = k.split('|')
      const db = await prisma.$queryRawUnsafe<any[]>(
        `SELECT rrc_price FROM products WHERE model=$1 AND finish=$2 AND color=$3 AND type=$4 AND width=$5::int AND height=$6::int LIMIT 1`,
        model, finish, color, type, Number(width), Number(height)
      )
      if (db.length) {
        const dbp = Number(db[0].rrc_price || 0)
        const importPrices = Array.from(new Set(rows.map(x => Number(x.rrc_price||0))))
        const all = Array.from(new Set([dbp, ...importPrices]))
        if (all.length > 1) conflicts.push({ key: k, rows })
      }
    }
  }

  // 3) если есть конфликты — вернём 409 + CSV отчёт
  if (conflicts.length > 0) {
    const lines = ['model,finish,color,type,width,height,rrc_price_existing,rrc_price_import,resolution']
    for (const c of conflicts) {
      const [model, finish, color, type, width, height] = c.key.split('|')
      // возьмём существующую цену (если есть)
      const db = await prisma.$queryRawUnsafe<any[]>(
        `SELECT rrc_price FROM products WHERE model=$1 AND finish=$2 AND color=$3 AND type=$4 AND width=$5::int AND height=$6::int LIMIT 1`,
        model, finish, color, type, Number(width), Number(height)
      )
      const existing = db[0]?.rrc_price ?? ''
      for (const r of c.rows) {
        lines.push([model,finish,color,type,width,height,existing, r.rrc_price, 'choose_min_or_fix_file'].join(','))
      }
    }
    const csv = lines.join('\n')
    return new Response(csv, { status: 409, headers: { 'Content-Type': 'text/csv; charset=utf-8' } })
  }

  // 4) upsert в products (category='doors')
  const inserted = []
  for (const r of data) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO products (category,style,model,finish,color,type,width,height,rrc_price,model_photo)
       VALUES ('doors',$1,$2,$3,$4,$5,$6::int,$7::int,$8,$9)
       ON CONFLICT (category,model,finish,color,type,width,height)
       DO UPDATE SET rrc_price=EXCLUDED.rrc_price, style=COALESCE(EXCLUDED.style,products.style), model_photo=COALESCE(EXCLUDED.model_photo,products.model_photo)`,
      r.style ?? null, r.model, r.finish, r.color, r.type, r.width, r.height, r.rrc_price, r.model_photo ?? null
    )
    inserted.push(r)
  }

  return Response.json({ ok: true, inserted: inserted.length })
}
