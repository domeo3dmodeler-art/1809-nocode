'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Property {
  key: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'url';
  required: boolean;
  unit?: string;
  options?: string[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  properties: Property[];
  import_mapping: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      setError('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchCategories}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">No-Code Админка</h1>
              <p className="mt-1 text-sm text-gray-500">Универсальная система управления товарами</p>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← На главную
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Категории товаров</h2>
            <p className="text-gray-600 mb-6">
              Управляйте разными группами товаров. Каждая категория имеет свои свойства и настройки импорта.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">{category.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Свойства товаров:</p>
                  <div className="flex flex-wrap gap-1">
                    {category.properties.slice(0, 4).map((prop) => (
                      <span 
                        key={prop.key}
                        className={`px-2 py-1 text-xs rounded ${
                          prop.required 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {prop.name}
                        {prop.required && ' *'}
                      </span>
                    ))}
                    {category.properties.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        +{category.properties.length - 4} еще
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 text-center"
                  >
                    Управление
                  </Link>
                  <Link
                    href={`/admin/import/${category.id}`}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 text-center"
                  >
                    Импорт
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Создать новую категорию</h3>
            <p className="text-gray-600 mb-4">
              Добавьте новую группу товаров с уникальными свойствами и настройками импорта.
            </p>
            <Link
              href="/admin/categories/new"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <span className="mr-2">+</span>
              Создать категорию
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}