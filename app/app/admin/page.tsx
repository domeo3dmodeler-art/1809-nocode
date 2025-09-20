'use client';

import { useEffect, useState } from 'react'

type Category = { id: string; slug: string; title: string }

enum View { Login, Dashboard }

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState('admin@domeo.local')
  const [password, setPassword] = useState('admin123')
  const [view, setView] = useState<View>(View.Login)
  const [cats, setCats] = useState<Category[]>([])
  const [form, setForm] = useState({ slug: 'doors', title: 'Двери' })

  useEffect(() => {
    const t = localStorage.getItem('jwt')
    if (t) { setToken(t); setView(View.Dashboard); fetchCats(t) }
  }, [])

  async function fetchCats(t: string) {
    const res = await fetch('/api/categories', { headers: { Authorization: `Bearer ${t}` } })
    if (res.ok) setCats(await res.json())
  }

  async function doLogin() {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (res.ok) {
      const { token } = await res.json(); localStorage.setItem('jwt', token); setToken(token); setView(View.Dashboard); fetchCats(token)
    }
  }

  async function createCat() {
    const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) })
    if (res.ok) { setForm({ slug: '', title: '' }); fetchCats(token!) }
  }

  if (view === View.Login) return (
    <main className="mx-auto max-w-sm p-8">
      <h1 className="text-2xl font-semibold">Вход в админку</h1>
      <div className="mt-4 space-y-3">
        <input className="w-full rounded-xl border p-2" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
        <input className="w-full rounded-xl border p-2" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Пароль" type="password"/>
        <button onClick={doLogin} className="w-full rounded-2xl bg-black px-4 py-2 text-white">Войти</button>
      </div>
    </main>
  )

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Админка</h1>
      <section className="mt-6 rounded-2xl border bg-white p-4">
        <h2 className="text-lg font-medium">Категории</h2>
        <div className="mt-3 flex gap-2">
          <input className="rounded-xl border p-2" placeholder="slug" value={form.slug} onChange={e=>setForm(f=>({ ...f, slug: e.target.value }))}/>
          <input className="rounded-xl border p-2" placeholder="Название" value={form.title} onChange={e=>setForm(f=>({ ...f, title: e.target.value }))}/>
          <button onClick={createCat} className="rounded-2xl bg-black px-4 py-2 text-white">Добавить</button>
        </div>
        <ul className="mt-4 space-y-2">
          {cats.map(c => <li key={c.id} className="rounded-xl border p-2">{c.slug} — {c.title}</li>)}
        </ul>
      </section>
    </main>
  )
}
