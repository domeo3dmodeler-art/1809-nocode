export async function POST(req: Request) {
  const { cart } = await req.json()
  const items = Array.isArray(cart?.items) ? cart.items : []
  const header = ['SKU','Model','Width','Height','Color','Qty','UnitPrice','Sum']
  const lines = items.map((i:any)=>[
    `${i.model}-${i.width}x${i.height}-${i.color||''}`, i.model, i.width, i.height, i.color||'', i.qty, i.unitPrice, (i.unitPrice||0)*(i.qty||0)
  ].join(','))
  const csv = [header.join(','), ...lines].join('\n')
  return new Response(csv, { headers: { 'Content-Type':'text/csv; charset=utf-8' } })
}
