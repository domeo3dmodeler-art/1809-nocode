import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { cart } = await req.json().catch(() => ({ cart: { items: [] } }));
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const total = items.reduce(
    (s: number, i: any) => s + (Number(i.unitPrice) || 0) * (Number(i.qty) || 1),
    0
  );

  const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"/></head><body style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Arial;margin:24px">
  <h1>Счёт на оплату</h1>
  <p>К оплате: <strong>${total.toFixed(0)} ₽</strong></p>
  <p style="color:#666">* Демоверсия. Подключим шаблон и реквизиты позже.</p>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": "inline; filename=invoice.html",
    },
  });
}
