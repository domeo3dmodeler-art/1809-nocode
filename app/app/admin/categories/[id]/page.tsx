'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

export default function CategoryManagement() {
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      const foundCategory = data.categories.find((cat: Category) => cat.id === categoryId);
      
      if (foundCategory) {
        setCategory(foundCategory);
      } else {
        setError('Категория не найдена');
      }
    } catch (err) {
      setError('Ошибка загрузки категории');
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

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Категория не найдена'}</p>
          <Link 
            href="/admin"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Назад к админке
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">{category.icon}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                <p className="mt-1 text-sm text-gray-500">{category.description}</p>
              </div>
            </div>
            <Link 
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Назад к админке
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Свойства товаров */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Свойства товаров</h2>
              <div className="space-y-3">
                {category.properties.map((property) => (
                  <div key={property.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded mr-3 ${
                        property.required 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.type}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{property.name}</p>
                        <p className="text-sm text-gray-500">
                          {property.key}
                          {property.unit && ` (${property.unit})`}
                          {property.required && ' • Обязательное поле'}
                        </p>
                      </div>
                    </div>
                    {property.options && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Варианты:</p>
                        <p className="text-xs text-gray-700">{property.options.slice(0, 2).join(', ')}</p>
                        {property.options.length > 2 && (
                          <p className="text-xs text-gray-500">+{property.options.length - 2} еще</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Настройки импорта */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Настройки импорта</h2>
              <div className="space-y-3">
                {Object.entries(category.import_mapping).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{value}</p>
                      <p className="text-sm text-gray-500">Поле: {key}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Маппинг
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Действия */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href={`/admin/import/${category.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">📥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Импорт прайса</h3>
                <p className="text-sm text-gray-600">Загрузите Excel/CSV файл с товарами</p>
              </div>
            </Link>

            <Link
              href={`/admin/media/${category.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">📷</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Загрузка фото</h3>
                <p className="text-sm text-gray-600">Добавьте фотографии товаров</p>
              </div>
            </Link>

            <Link
              href={`/admin/products/${category.id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Товары</h3>
                <p className="text-sm text-gray-600">Просмотр и редактирование товаров</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
