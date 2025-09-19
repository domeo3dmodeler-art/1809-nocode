import { NextRequest, NextResponse } from "next/server";
import { applyPricing } from "@/lib/doors/pricing";
import { renderTemplate } from "@/lib/templates/render";
import { htmlToPdfBuffer } from "@/lib/pdf/htmlToPdf";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qFormat = (url.searchParams.get("format") || "").toLowerCase();
    const accept = req.headers.get("accept") || "";
    const wantPdf = qFormat === "pdf" || accept.includes("application/pdf");

    const parsed = await req.json().catch(() => ({} as any));
    const cart = Array.isArray(parsed?.cart) ? parsed.cart : [];
    if (!cart.length) {
      return NextResponse.json(
        { type: "about:blank", title: "Empty cart", detail: "Поле cart пусто.", status: 400 },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const priced = applyPricing(cart);

    // Таблица: основная строка + строка ручки
    let i = 1;
    const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
    const rowsHtml = priced.map(p => {
      const main = `<tr><td>${i++}</td><td>${p.sku_1c ?? ""}</td><td>${p.name_kp}</td><td class="right">${nf.format(p.rrc_price)}</td><td class="right">${p.qty}</td><td class="right">${nf.format(p.sum_rrc)}</td></tr>`;
      const handle = p.handle
        ? `<tr><td></td><td>${p.handle.sku_1c ?? ""}</td><td>Ручка: ${p.handle.name}</td><td class="right">${nf.format(p.handle_price_rrc ?? 0)}</td><td class="right">${p.qty}</td><td class="right">${nf.format((p.handle_price_rrc ?? 0) * p.qty)}</td></tr>`
        : "";
      return main + handle;
    }).join("");

    const grandTotal = priced.reduce((s, p) => s + p.sum_rrc, 0);

    const html = await renderTemplate("kp", {
      doc: {
        number: parsed?.doc?.number || "—",
        date: parsed?.doc?.date || new Date().toLocaleDateString("ru-RU"),
        validTill: parsed?.doc?.validTill || "10 дней",
        deliveryTerms: parsed?.doc?.deliveryTerms || "3–4 недели",
        paymentTerms: parsed?.doc?.paymentTerms || "100% предоплата",
      },
      manager: parsed?.manager || { name: "—", email: "—" },
      customer: parsed?.customer || { name: "—" },
      rowsHtml,
      grandTotal,
    });

    const safeNum = (parsed?.doc?.number || "kp").toString().replace(/[^0-9A-Za-z._-]+/g, "_");
    const date = new Date().toISOString().slice(0, 10);

    if (wantPdf) {
      const pdf = await htmlToPdfBuffer(html);
      return new NextResponse(pdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Domeo_kp_${safeNum}_${date}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="Domeo_kp_${safeNum}_${date}.html"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { type: "about:blank", title: "Export error (KP)", detail: e?.message ?? "unknown", status: 500 },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
