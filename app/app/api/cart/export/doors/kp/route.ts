export async function POST(req: Request) {
  const { cart } = await req.json()
  const items = Array.isArray(cart?.items) ? cart.items : []
  const total = items.reduce((s:any,i:any)=> s + (i.unitPrice||0)*(i.qty||1), 0)
  const rows = items.map((i:any)=>`<tr><td>${i.model} (${i.width}×${i.height}${i.color?`, ${i.color}`:''})</td><td>${i.qty}</td><td>${i.unitPrice}</td><td>${(i.unitPrice||0)*(i.qty||0)}</td></tr>`).join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"/></head><body>
  <h1>Коммерческое предложение</h1>
  <table border="1" cellspacing="0" cellpadding="6">
  <tr><th>Наименование</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr>${rows}</table>
  <h3>Итого: ${total} ₽</h3></body></html>`
  return new Response(html, { headers: { 'Content-Type':'text/html; charset=utf-8' } })
}
