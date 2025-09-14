import { NextRequest } from "next/server";

function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function POST(req: NextRequest) {
  const { cart } = await req.json().catch(() => ({ cart: { items: [] } }));
  const items = Array.isArray(cart?.items) ? cart.items : [];

  const header = ["SKU", "Model", "Width", "Height", "Color", "Qty", "UnitPrice", "Sum"];
  const rows = items.map((i: any) => {
    const qty = Number(i.qty || 1);
    const unit = Number(i.unitPrice || 0);
    const sum = qty * unit;
    const sku = `${i.model ?? ""}-${i.width ?? ""}x${i.height ?? ""}-${i.color ?? ""}`;
    return [
      csvEscape(sku),
      csvEscape(i.model ?? ""),
      csvEscape(i.width ?? ""),
      csvEscape(i.height ?? ""),
      csvEscape(i.color ?? ""),
      csvEscape(qty),
      csvEscape(unit),
      csvEscape(sum),
    ].join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="factory.csv"',
    },
  });
}
