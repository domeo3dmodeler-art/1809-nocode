'use client'
import { useEffect, useMemo, useState } from 'react'

type Opts={model:string[];finish:string[];color:string[];type:string[];width?:any[];height?:any[];kits?:any[];handles?:any[]}
type Sel={model?:string;finish?:string;color?:string;type?:string;width?:number;height?:number;hardware_kit?:{id?:string};handle?:{id?:string};qty?:number}
type Price={currency:string;total:number;breakdown:{label:string,amount:number}[]} | null
const fmt=(n:number,c='RUB')=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:c}).format(n)

function Field({label,value,opts,on}:{label:string;value:any;opts?:any[];on:(v:any)=>void}){
  return <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-600">{label}</label>
    <select className="border rounded-xl px-3 py-2" value={value??''} onChange={e=>on(e.target.value||undefined)}>
      <option value="">— не выбрано —</option>
      {(opts||[]).map((v,i)=><option key={i} value={v}>{String(v)}</option>)}
    </select>
  </div>
}

export default function Page(){
  const [opts,setOpts]=useState<Opts|null>(null)
  const [sel,setSel]=useState<Sel>({qty:1})
  const [price,setPrice]=useState<Price>(null)
  const qty=sel.qty||1
  const totalWithQty=useMemo(()=> (price?.total||0)*(qty||1),[price,qty])

  async function loadOptions(next:Sel){
    const p=new URLSearchParams()
    ;(['model','finish','color','type','width','height'] as const).forEach(k=>{
      const v=(next as any)[k]; if(v!==undefined&&v!==null&&v!=='') p.set(k,String(v))
    })
    const r=await fetch('/api/catalog/doors/options?'+p.toString(),{cache:'no-store'})
    const data:Opts=await r.json(); setOpts(data)
    const auto:{[k:string]:any}={...next}
    ;(['model','finish','color','type','width','height'] as const).forEach(k=>{
      const arr=(data as any)[k]; if(!auto[k] && Array.isArray(arr) && arr.length===1) auto[k]=arr[0]
    })
    setSel(auto); return auto
  }

  async function calc(next:Sel){
    const need=['model','finish','color','type','width','height'] as const
    if(!need.every(k => (next as any)[k]!==undefined && (next as any)[k]!==null)){ setPrice(null); return }
    const r=await fetch('/api/price/doors',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({selection:next})})
    setPrice(await r.json())
  }

  useEffect(()=>{ loadOptions({qty:1}).then(calc).catch(console.error) },[])

  async function change<K extends keyof Sel>(k:K,v:Sel[K]){
    const next={...sel,[k]:v}
    if(k!=='hardware_kit') next.hardware_kit={id:undefined}
    if(k!=='handle') next.handle={id:undefined}
    const after=await loadOptions(next); await calc(after)
  }

  async function exportDoc(kind:'kp'|'invoice'|'factory'){
    const item={model:sel.model,width:sel.width,height:sel.height,color:sel.color,qty,unitPrice:price?.total||0}
    const r=await fetch(`/api/cart/export/doors/${kind}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cart:{items:[item]}})})
    const b=await r.blob(); const a=document.createElement('a'); const ext=kind==='factory'?'csv':'html'
    a.href=URL.createObjectURL(b); a.download=`domeo_doors_${kind}.${ext}`; a.click(); URL.revokeObjectURL(a.href)
  }
  return <div className="max-w-5xl mx-auto p-6">
    <h1 className="text-2xl font-semibold mb-4">Domeo Doors — Конфигуратор</h1>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Field label="Модель"  value={sel.model}  opts={opts?.model}  on={v=>change('model',v as any)} />
      <Field label="Покрытие" value={sel.finish} opts={opts?.finish} on={v=>change('finish',v as any)} />
      <Field label="Цвет"    value={sel.color}  opts={opts?.color}  on={v=>change('color',v as any)} />
      <Field label="Тип"     value={sel.type}   opts={opts?.type}   on={v=>change('type',v as any)} />
      <Field label="Ширина"  value={sel.width}  opts={opts?.width}  on={v=>change('width',v as any)} />
      <Field label="Высота"  value={sel.height} opts={opts?.height} on={v=>change('height',v as any)} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Комплект фурнитуры</label>
        <select className="border rounded-xl px-3 py-2" value={sel.hardware_kit?.id||''}
          onChange={e=>change('hardware_kit',{id:e.target.value||undefined})}>
          <option value="">— без комплекта —</option>
          {(opts?.kits||[]).map((k:any)=><option key={k.id} value={k.id}>{k.name||k.id}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Ручка</label>
        <select className="border rounded-xl px-3 py-2" value={sel.handle?.id||''}
          onChange={e=>change('handle',{id:e.target.value||undefined})}>
          <option value="">— без ручки —</option>
          {(opts?.handles||[]).map((h:any)=><option key={h.id} value={h.id}>{h.name_web||h.id}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-600">Количество</label>
        <input type="number" min={1} step={1} className="border rounded-xl px-3 py-2"
          value={sel.qty||1} onChange={e=>setSel(s=>({...s,qty:Math.max(1,Number(e.target.value)||1)}))}/>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <div className="md:col-span-2 border rounded-2xl p-4">
        <h2 className="font-medium mb-2">Расчёт</h2>
        {!price && <div className="text-sm text-gray-500">Заполните параметры.</div>}
        {price && <div className="space-y-2">
          <ul className="text-sm">{price.breakdown.map((b,i)=>
            <li key={i} className="flex justify-between"><span>{b.label}</span><span>{fmt(b.amount)}</span></li>)}
          </ul>
          <div className="border-t pt-2 flex justify-between font-medium"><span>Итого за 1 шт</span><span>{fmt(price.total)}</span></div>
          <div className="flex justify-between"><span>× Кол-во: {sel.qty||1}</span><span className="text-lg font-semibold">{fmt(totalWithQty)}</span></div>
        </div>}
      </div>
      <div className="border rounded-2xl p-4 flex flex-col gap-3">
        <button onClick={()=>exportDoc('kp')} className="bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700">Скачать КП (HTML)</button>
        <button onClick={()=>exportDoc('invoice')} className="bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700">Скачать Счёт (HTML)</button>
        <button onClick={()=>exportDoc('factory')} className="bg-emerald-600 text-white rounded-xl px-4 py-2 hover:bg-emerald-700">Скачать заказ (CSV)</button>
      </div>
    </div>
  </div>
}
