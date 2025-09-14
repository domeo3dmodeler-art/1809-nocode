import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Sel = {
  model?: string; finish?: string; color?: string; type?: string;
  width?: number; height?: number;
  hardware_kit?: { id: string } | undefined;
  handle?: { id: string } | undefined;
};

export async function POST(req: NextRequest) {
  const { selection } = await req.json().catch(()=>({ selection: {} as Sel }));
  const s: Sel = selection || {};
  if(!s.model || !s.finish || !s.color || !s.type || !s.width || !s.height){
    return NextResponse.json({ ok:false, error:"incomplete selection" }, { status: 400 });
  }

  const prod = (await prisma.$queryRaw<any[]>`
    SELECT rrc_price, sku_1c
    FROM doors_catalog
    WHERE model=${s.model} AND finish=${s.finish} AND color=${s.color}
      AND type=${s.type} AND width=${s.width} AND height=${s.height}
    LIMIT 1
  `)[0];

  if(!prod) return NextResponse.json({ ok:false, error:"not found" }, { status: 404 });

  const base = Number(prod.rrc_price||0);
  const breakdown: { label:string; amount:number }[] = [];
  let total = base;

  if(s.hardware_kit?.id){
    const kit = (await prisma.$queryRaw<any[]>`
      SELECT name, price_rrc FROM doors_kits WHERE id=${s.hardware_kit.id} LIMIT 1
    `)[0];
    if(kit){
      const add = Number(kit.price_rrc||0);
      breakdown.push({ label: `Комплект: ${kit.name}`, amount: add });
      total += add;
    }
  }

  if(s.handle?.id){
    const h = (await prisma.$queryRaw<any[]>`
      SELECT name, price_opt, COALESCE(price_group_multiplier,1.0) AS mul
      FROM doors_handles WHERE id=${s.handle.id} LIMIT 1
    `)[0];
    if(h){
      const add = Math.round(Number(h.price_opt||0) * Number(h.mul||1));
      breakdown.push({ label: `Ручка: ${h.name}`, amount: add });
      total += add;
    }
  }

  return NextResponse.json({
    ok: true,
    currency: "RUB",
    base,
    breakdown,
    total,
    sku_1c: prod.sku_1c || null,
  });
}
