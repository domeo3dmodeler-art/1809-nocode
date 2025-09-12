'use client'

import { useEffect, useMemo, useState } from 'react'

type OptionsPayload = {
  style?: string[]
  model: string[]
  finish: string[]
  color: string[]
  type: string[]
  width?: number[] | string[]
  height?: number[] | string[]
  kits?: { id: string, name: string, price_rrc: number }[]
  handles?: { id: string, name_web: string, price_opt: number, price_group_multiplier: number }[]
}

type Selection = {
  style?: string
  model?: string
  finish?: string
  color?: string
  type?: string
  width?: number
  height?: number
  hardware_kit?: { id?: string }
  handle?: { id?: string }
  qty?: number
}

type PriceResp = {
  ok: boolean
  currency: string
  base: number
  breakdown: { label: string, amount: number }[]
  total: number
}

const fmt = (n: number, currency='RUB') =>
  new Intl.NumberFormat('ru-RU', { style:'currency', currency }).format(n)

function Field<T extends string | number>({
  label, value, onChange, options, placeholder
}: {
  label: string
  value?: T
  onChange: (v?: T) => void
  options?: T[]
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>
      <select
        className="border rounded-xl px-3 py-2"
        value={value === undefined ? '' : String(value)}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === '' ? undefined : (isNaN(Number(v)) ? (v as any) : (Number(v) as any)))
        }}
      >
        <option value="">{placeholder ?? '— не выбрано —'}</option>
        {(options ?? []).map((opt, i) => (
          <option key={String(opt)+'-'+i} value={String(opt)}>
            {String(opt)}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function DoorsConfigurator() {
  const [opts, setOpts] = useState<OptionsPayload | null>(null)
  const [sel, setSel] = useState<Selection>({ qty: 1 })
  const [price, setPrice] = useState<PriceResp | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadOptions(nextSel: Selection) {
    const params = new URLSearchParams()
    for (const k of ['style','model','finish','color','type'] as const) {
      if (nextSel[k]) params.set(k, String(nextSel[k]))
    }
    if (nextSel.width) params.set('width', String(nextSel.width))
    if (nextSel.height) params.set('height', String(nextSel.height))

    const res = await fetch(`/api/catalog/doors/options?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('options request failed')
    const data: OptionsPayload = await res.json()
    setOpts(data)

    const withAuto: Selection = { ...nextSel }
    const autoPick = <K extends keyof Selection>(key: K, list?: any[]) => {
      if (!withAuto[key] && list && list.length === 1) (withAuto as any)[key] = list[0]
    }
    autoPick('model', data.model)
    autoPick('finish', data.finish)
    autoPick('color', data.color)
    autoPick('type', data.type)
    autoPick('width', data.width as any)
    autoPick('height', data.height as any)

    setSel(withAuto)
    return withAuto
  }

  async function calcPrice(nextSel: Selection) {
    const required = ['model','finish','color','type','width','height'] as const
    if (!required.every(k => (nextSel as any)[k] !== undefined && (nextSel as any)[k] !== null)) {
      setPrice(null)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/price/doors', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ selection: nextSel })
      })
      const data: PriceResp = await res.json()
      setPrice(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOptions({ qty: 1 }).then(calcPrice).catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onChange<K extends keyof Selection>(key: K, val?: Selection[K]) {
    const nextSel = { ...sel, [key]: val }
    if (key !== 'hardware_kit') nextSel.hardware_kit = { id: undefined }
    if (key !== 'handle') nextSel.handle = { id: undefined }
    const afterOpts = await loadOptions(nextSel)
    await calcPrice(afterOpts)
  }

  const qty = sel.qty ?? 1
  const totalWithQty = useMemo(() => (price?.total ?? 0) * (qty || 1), [price, qty])

  async function exportDoc(kind: 'kp'|'invoice'|'factory') {
    const url = `/api/cart/export/doors/${kind}`
    const item = {
      model: sel.model, width: sel.width, height: sel.height, color: sel.color,
      qty, unitPrice: price?.total ?? 0
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ cart: { items: [item] } })
    })
    const blob = await res.blob()
    const a = document.createElement('a')
    const ext = kind === 'factory' ? 'csv' : 'html'
    a.href = URL.createObjectURL(blob)
    a.download = `domeo_doors_${kind}.${ext}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Domeo Doors — Конфигуратор</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Field label="Стиль" value={sel.style} onChange={(v)=>onChange('style', v)} options={opts?.style} placeholder="Любой" />
        <Field label="Модель" value={sel.model} onChange={(v)=>onChange('model', v)} options={opts?.model} />
        <Field label="Покрытие" value={sel.finish} onChange={(v)=>onChange('finish', v)} options={opts?.finish} />
        <Field label="Цвет" value={sel.color} onChange={(v)=>onChange('color', v)} options={opts?.color} />
        <Field label="Тип" value={sel.type} onChange={(v)=>onChange('type', v)} options={opts?.type} />
        <Field label="Ширина" value={sel.width as any} onChange={(v)=>onChange('width', v as any)} options={(opts?.width as any)} />
        <Field label="Высота" value={sel.height as any} onChange={(v)=>onChange('height', v as any)} options={(opts?.height as any)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Комплект фурнитуры</label>
          <select
            className="border rounded-xl px-3 py-2"
            value={sel.hardware_kit?.id ?? ''}
            onChange={(e)=> onChange('hardware_kit', { id: e.target.value || undefined })}
          >
            <option value="">— без комплекта —</option>
            {(opts?.kits ?? []).map(k => (
              <option key={k.id} value={k.id}>{k.name || k.id} ({fmt(k.price_rrc)})</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Ручка</label>
          <select
            className="border rounded-xl px-3 py-2"
            value={sel.handle?.id ?? ''}
            onChange={(e)=> onChange('handle', { id: e.target.value || undefined })}
          >
            <option value="">— без ручки —</option>
            {(opts?.handles ?? []).map(h => (
              <option key={h.id} value={h.id}>
                {(h.name_web || h.id)} ({fmt((h.price_opt||0)*(h.price_group_multiplier||1))})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Количество</label>
          <input
            type="number" min={1} step={1}
            className="border rounded-xl px-3 py-2"
            value={qty}
            onChange={(e)=> setSel(s => ({ ...s, qty: Math.max(1, Number(e.target.value)||1) }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 border rounded-2xl p-4">
          <h2 className="font-medium mb-2">Расчёт</h2>
          {loading && <div className="text-sm text-gray-500 mb-2">Считаем…</div>}
          {!price && <div className="text-sm text-gray-500">Заполните обязательные поля для расчёта.</div>}
          {price && (
            <div className="space-y-2">
              <ul className="text-sm">
                {price.breakdown.map((b,i)=>(
                  <li key={i} className="flex justify-between">
                    <span>{b.label}</span>
                    <span>{fmt(b.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Итого за 1 шт</span>
                <span>{fmt(price.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>× Кол-во: {qty}</span>
                <span className="text-lg font-semibold">{fmt(totalWithQty)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="border rounded-2xl p-4 flex flex-col gap-3">
          <button
            onClick={()=>exportDoc('kp')}
            className="bg-blue-600 text-white rounded-xl px-4 py-2 hover:bg-blue-700"
          >Скачать КП (HTML)</button>
          <button
            onClick={()=>exportDoc('invoice')}
            className="bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700"
          >Скачать Счёт (HTML)</button>
          <button
            onClick={()=>exportDoc('factory')}
            className="bg-emerald-600 text-white rounded-xl px-4 py-2 hover:bg-emerald-700"
          >Скачать заказ (CSV)</button>
        </div>
      </div>
    </div>
  )
}
