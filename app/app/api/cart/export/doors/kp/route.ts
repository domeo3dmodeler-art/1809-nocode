import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { cart } = await req.json().catch(() => ({ cart: { items: [] } }));
  const items = Array.isArray(cart?.items) ? cart.items : [];
  const total = items.reduce(
    (s: number, i: any) => s + (Number(i.unitPrice) || 0) * (Number(i.qty) || 1),
    0
  );

  const rows = items
    .map(
      (i: any) => `
        <tr>
          <td>${i.model ?? ""}</td>
          <td>${i.qty ?? 1}</td>
          <td>${Number(i.unitPrice || 0)}</td>
          <td>${(Number(i.unitPrice || 0) * Number(i.qty || 1)).toFixed(0)}</td>
        </tr>`
    )
    .join("");

  const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"/>
<style>
  body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Arial;margin:24px}
  table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #ddd;padding:6px;text-align:left}
  th{background:#f6f6f6}
  h1{margin:0 0 12px}
</style></head><body>
  <h1>Коммерческое предложение</h1>
  <table>
    <thead><tr><th>Наименование</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <h3>Итого: ${total.toFixed(0)} ₽</h3>
</body></html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": "inline; filename=kp.html",
    },
  });
}
