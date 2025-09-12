export async function POST(req: Request) {
  const { cart } = await req.json()
  const items = Array.isArray(cart?.items) ? cart.items : []
  const total = items.reduce((s:any,i:any)=> s + (i.unitPrice||0)*(i.qty||1), 0)
  const html = `<!doctype html><html><head><meta charset="utf-8"/></head><body>
  <h1>Счет на оплату</h1><p>Итого: ${total} ₽</p></body></html>`
  return new Response(html, { headers: { 'Content-Type':'text/html; charset=utf-8' } })
}
