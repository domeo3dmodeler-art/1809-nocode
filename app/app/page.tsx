'use client';

import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <div className="text-lg font-semibold">Domeo • No-Code Calculators</div>
          <nav className="flex gap-3 text-sm">
            <Link href="/" className="px-3 py-1.5 rounded-xl border bg-black text-white">
              Категории
            </Link>
            <Link href="/doors" className="px-3 py-1.5 rounded-xl border">
              Двери
            </Link>
            {/* можно добавить другие: /windows, /bath, ... */}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        <section>
          <h1 className="text-2xl font-bold mb-2">Выберите категорию</h1>
          <p className="text-sm text-gray-600">
            Платформа Domeo: импорт → каталог → калькулятор → экспорт КП/Счёт/Заказ.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link
            href="/doors"
            className="group rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <div className="aspect-[3/2] bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
              <div className="w-16 h-28 bg-white rounded-sm shadow-inner border border-black/10 relative">
                <div className="absolute right-1/4 top-1/2 w-4 h-1 bg-black/30" />
              </div>
            </div>
            <div className="p-4">
              <div className="text-lg font-semibold">Двери</div>
              <div className="text-sm text-gray-600">Каталог, калькулятор и экспорт</div>
            </div>
          </Link>

          {/* ЗАГЛУШКИ для будущих категорий */}
          <div className="rounded-2xl border p-4 opacity-60">
            <div className="text-lg font-semibold">Окна</div>
            <div className="text-sm text-gray-600">скоро…</div>
          </div>
          <div className="rounded-2xl border p-4 opacity-60">
            <div className="text-lg font-semibold">Сантехника</div>
            <div className="text-sm text-gray-600">скоро…</div>
          </div>
        </section>
      </main>
    </div>
  );
}
