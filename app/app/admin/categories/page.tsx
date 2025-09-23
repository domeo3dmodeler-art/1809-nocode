
'use client'
import { useEffect, useState } from 'react'

export default function CategoriesPage(){
  const [items, setItems] = useState<any[]>([])
  const [code, setCode] = useState('newcategory')
  const [name, setName] = useState('Новая категория')

  const load = async ()=> setItems(await fetch('/api/admin/categories').then(r=>r.json()))
  useEffect(()=>{ load() },[])

  const create = async ()=>{
    const res = await fetch('/api/admin/categories',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code, name })})
    if(res.ok) load()
  }

  return (
    <div>
      <h1>Категории</h1>
      <input value={code} onChange={e=>setCode(e.target.value)} />
      <input value={name} onChange={e=>setName(e.target.value)} />
      <button onClick={create}>Создать</button>
      <ul>{items.map(c=> <li key={c.id}>{c.name}</li>)}</ul>
    </div>
  )
}
