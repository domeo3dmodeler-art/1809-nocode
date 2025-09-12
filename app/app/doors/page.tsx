'use client'
import { useEffect, useMemo, useState } from 'react'

type Domain = {
  model: string[]; finish: string[]; color: string[]; type: string[];
  width?: (number|string)[]; height?: (number|string)[];
  kits?: { id:string; name?:string; price_rrc?:number }[];
  handles?: { id:string; name_web?:string; price_opt?:number; price_group_multiplier?:number }[];
}
type Selection = {
  model?:string; finish?:string; color?:string; type?:string;
  width?:number; height?:number; qty?:number;
  hardware_kit?:{ id?:string }; handle?:{ id?:string };
}
type Price = { currency:string; total:number; breakdown:{label:string;amount:number}[] } | null
const fmt = (n:number)=> new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB'}).format(n)

function Field({label,value,opts,on}:{label:string;value:any;opts?:any[];on:(v:any)=>void}){
  const list = Array.isArray(opts) ? opts : []
  return <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600">{label}</label>
    <select className="border rounded-xl px-3 py-2" value={value ?? ''} onChange={e=>on(e.target.value || undefined)}>
      <option value="">— не выбрано —</option>
      {list.map((v,i)=><option key={i} value={String(v)}>{String(v)}</option>)}
    </select>
  </div>
}

export default function Page(){
  const [domain,setDomain]=useState<Domain|null>(null)
  const [sel,setSel]=useState<Selection>({ qty:1 })
  const [price,setPrice]=useState<Price>(null)

  const qs = useMemo(()=>{
    const p=new URLSearchParams()
    ;(['model','finish','color','type','width','height'] as const).forEach(k=>{
      const v=(sel as any)[k]; if(v!==undefined && v!==null && v!=='') p.set(k,String(v))
    })
    return p.toString()
  },[sel])

  // загрузка доменов (dependsOn)
  useEffect(()=>{ let off=false;(async ()=>{
    try{
      const r=await fetch('/api/catalog/doors/options?'+qs,{cache:'no-store'})
      const d=await r.json()
      if(off) return
      const norm:Domain = {
        model: Array.isArray(d?.model)? d.model : [],
        finish:Array.isArray(d?.finish)? d.finish: [],
        color: Array.isArray(d?.color)? d.color : [],
        type:  Array.isArray(d?.type)?  d.type  : [],
        width: Array.isArray(d?.width)? d.width : [],
        height:Array.isArray(d?.height)?d.height: [],
        kits:  Array.isArray(d?.kits)?  d.kits  : [],
        handles:Array.isArray(d?.handles)?d.handles: []
      }
      setDomain(norm)
      // авто-подстановка, если единственный вариант
      const next={...sel}
      ;(['model','finish','color','type','width','height'] as const).forEach(k=>{
        const arr=(norm as any)[k]; if(!next[k] && Array.isArray(arr) && arr.length===1) (next as any)[k]= (k==='width'||k==='height') ? Number(arr[0]) : String(arr[0])
      })
      setSel(next)
    }catch(e){ console.error('options error', e) }
  })(); return ()=>{off=true} },[qs])

  // автопрайсинг
  useEffect(()=>{ let off=false;(async ()=>{
    const need=['model','finish','color','type','width','height'] as const
    if(!need.every(k => (sel as any)[k]!==undefined && (sel as any)[k]!==null)){ setPrice(null); return }
    try{
      const r=await fetch('/api/price/doors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({selection:sel})})
      const data=await r.json(); if(!off) setPrice(data)
    }catch(e){ console.error('price error', e); if(!off) setPrice(null) }
  })(); return ()=>{off=true} },[sel])

  const change=<K extends keyof Selection>(k:K,v:Selection[K])=>{
    const next={...sel,[k]:v}
    if(k!=='hardware_kit') next.hardware_kit={id:undefined}
    if(k!=='handle') next.handle={id:undefined}
    setSel(next)
  }

  async function exportDoc(kind:'kp'|'invoice'|'factory'){
    const item={model:sel.model,width:sel.width,height:sel.height,color:sel.color,qty:sel.qty||1,unitPrice:price?.total||0}
    const r=await fetch(`/api/cart/export/doors/${kind}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cart:{items:[item]}})})
    const b=await r.blob(); const a=document.createElement('a'); const ext=kind==='factory'?'csv':'html'
    a.href=URL.createObjectURL(b); a.download=`domeo_doors_${kind}.${ext}`; a.click(); URL.revokeObjectURL(a.href)
  }

  return <div className="max-w-5xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-semibold">Domeo Doors — Конфигутор</h1>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Field label="Модель"  value={sel.model}  opts={domain?.model}  on={v=>change('model',v as any)} />
      <Field label="Покрытие" value={sel.finish} opts={domain?.finish} on={v=>change('finish',v as any)} />
      <Field label="Цвет"    value={sel.color}  opts={domain?.color}  on={v=>change('color',v as any)} />
      <Field label="Тип"     value={sel.type}   opts={domain?.type}   on={v=>change('type',v as any)} />
      <Field label="Ширина"  value={sel.width}  opts={domain?.width}  on={v=>change('width',Number(v))} />
      <Field label="Высота"  value={sel.height} opts={domain?.height} on={v=>change('height',Number(v))} />
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Комплект фурнитуры</label>
        <select className="border rounded-xl px-3 py-2" value={sel.hardware_kit?.id||''}
          onChange={e=>change('hardware_kit',{id:e.target.value||undefined})}>
          <option value="">— без комплекта —</option>
          {(domain?.kits||[]).map(k=><option key={k.id} value={k.id}>{k.name||k.id}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Ручка</label>
        <select className="border rounded-xl px-3 py-2" value={sel.handle?.id||''}
          onChange={e=>change('handle',{id:e.target.value||undefined})}>
          <option value="">— без ручки —</option>
          {(domain?.handles||[]).map(h=>{
            const add = Math.round((Number(h.price_opt)||0) * (Number(h.price_group_multiplier)||1))
            return <option key={h.id} value={h.id}>{h.name_web||h.id} (+{fmt(add)})</option>
          })}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Количество</label>
        <input type="number" min={1} className="border rounded-xl px-3 py-2" value={sel.qty||1}
          onChange={e=>setSel(s=>({...s,qty:Math.max(1,Number(e.target.value)||1)}))}/>
      </div>
    </div>

    <div className="border rounded-2xl p-4">
      <h2 className="font-medium mb-2">Расчёт</h2>
      {!price && <div className="text-sm text-gray-500">Заполните параметры выше.</div>}
      {!!price && <div className="space-y-2">
        <ul className="text-sm">{price.breakdown?.map?.((b,i)=>
          <li key={i} className="flex justify-between"><span>{b.label}</span><span>{fmt(Number(b.amount)||0)}</span></li>)}
        </ul>
        <div className="border-t pt-2 flex justify-between font-medium">
          <span>Итого за 1 шт</span><span>{fmt(price.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>× Кол-во: {sel.qty||1}</span><span className="text-lg font-semibold">{fmt((price.total||0)*(sel.qty||1))}</span>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={()=>exportDoc('kp')} className="bg-blue-600 text-white rounded-xl px-3 py-2">КП</button>
          <button onClick={()=>exportDoc('invoice')} className="bg-indigo-600 text-white rounded-xl px-3 py-2">Счёт</button>
          <button onClick={()=>exportDoc('factory')} className="bg-emerald-600 text-white rounded-xl px-3 py-2">Заказ (CSV)</button>
        </div>
      </div>}
    </div>
  </div>
}
