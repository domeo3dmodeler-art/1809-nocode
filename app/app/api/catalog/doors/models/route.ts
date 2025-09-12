import { prisma } from '@/lib/db'
export async function GET(req: Request) {
  const url = new URL(req.url)
  const style = url.searchParams.get('style') || undefined
  const rows = await prisma.products.findMany({
    where: style ? { style } : {},
    select: { model: true, style: true, model_photo: true },
    distinct: ['model'],
    orderBy: { model: 'asc' },
  })
  return Response.json(rows.map(r => ({ model: r.model, style: r.style, photo: r.model_photo || '' })))
}
