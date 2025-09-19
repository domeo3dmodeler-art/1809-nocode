import { NextRequest, NextResponse } from "next/server";
import { applyPricing } from "@/lib/doors/pricing";
import { toFactoryRows } from "@/lib/doors/factory-map";
import { buildFactoryXLSX } from "@/lib/xlsx/buildWorkbook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // exceljs требует nodejs-рантайм

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const format = (url.searchParams.get("format") || "xlsx").toLowerCase();

    const parsed = await req.json().catch(() => ({} as any));
    const cart = Array.isArray(parsed?.cart) ? parsed.cart : [];
    if (!cart.length) {
      return NextResponse.json(
        { type: "about:blank", title: "Empty cart", detail: "Поле cart пусто.", status: 400 },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (format !== "xlsx") {
      return NextResponse.json(
        { type: "about:blank", title: "Unsupported format", detail: "Factory поддерживает только XLSX.", status: 400 },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const priced = applyPricing(cart);
    const rows = toFactoryRows(priced);

    const buf = await buildFactoryXLSX(rows);
    const safeNum = (parsed?.doc?.number || "factory").toString().replace(/[^0-9A-Za-z._-]+/g, "_");
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Domeo_factory_${safeNum}_${date}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { type: "about:blank", title: "Export error (Factory)", detail: e?.message ?? "unknown", status: 500 },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
