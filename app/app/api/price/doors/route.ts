import { prisma } from '@/lib/db'
export async function POST(req: Request) {
  const { selection } = await req.json()
  const required = ['model','finish','color','type','width','height']
  if (!required.every(k => selection?.[k] !== undefined && selection?.[k] !== null)) {
    return new Response(JSON.stringify({ error: 'selection incomplete' }), { status: 400 })
  }
  const prod = await prisma.products.findFirst({
    where: {
      model: selection.model, finish: selection.finish, color: selection.color,
      type: selection.type, width: Number(selection.width), height: Number(selection.height)
    }
  })
  const rrc = Number(prod?.rrc_price || 0)
  let total = rrc
  if (selection?.hardware_kit?.id) {
    const k = await prisma.kits.findFirst({ where: { id: selection.hardware_kit.id } })
    if (k) total += Number((k as any).price_rrc || 0)
  }
  if (selection?.handle?.id) {
    const h = await prisma.handles.findFirst({ where: { id: selection.handle.id } })
    if (h) total += Number((h as any).price_opt || 0) * Number((h as any).price_group_multiplier || 1)
  }
  return Response.json({ ok: true, currency: 'RUB', base: rrc,
    breakdown: [{ label:'Полотно (РРЦ)', amount: rrc }], total })
}
