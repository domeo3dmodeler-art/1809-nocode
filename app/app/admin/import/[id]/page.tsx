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
}

interface ImportResult {
  message: string;
  category: Category;
  filename: string;
  size: number;
  type: string;
  mapping: Record<string, string>;
  imported: number;
  errors: string[];
  products: any[];
  photo_mapping: Record<string, string>;
  file_content_preview: string;
  processing_status: string;
  note: string;
  category_properties: Property[];
  required_fields: string[];
}

export default function UniversalImport() {
  const params = useParams();
  const categoryId = params.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category.id);

      const response = await fetch('/api/admin/import/universal', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Ошибка импорта');
      }
    } catch (err) {
      setError('Ошибка загрузки файла');
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Импорт прайса</h1>
                <p className="mt-1 text-sm text-gray-500">{category.name} • {category.description}</p>
              </div>
            </div>
            <Link 
              href={`/admin/categories/${category.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Назад к категории
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Форма загрузки */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Загрузить файл</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите файл прайса
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.csv,.xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Поддерживаемые форматы: Excel (.xlsx, .xls), CSV (.csv)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!file || loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Обработка...' : 'Загрузить прайс'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Информация о категории */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Требования к файлу</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Обязательные поля:</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.properties
                      .filter(prop => prop.required)
                      .map(prop => (
                        <span key={prop.key} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                          {prop.name}
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Дополнительные поля:</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.properties
                      .filter(prop => !prop.required)
                      .map(prop => (
                        <span key={prop.key} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                          {prop.name}
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Маппинг полей:</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {Object.entries(category.import_mapping).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{value}</span>
                        <span className="text-gray-400">→ {key}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Результат импорта */}
          {result && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Результат импорта</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Файл</p>
                  <p className="font-semibold text-blue-900">{result.filename}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Размер</p>
                  <p className="font-semibold text-green-900">{(result.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600">Статус</p>
                  <p className="font-semibold text-purple-900">{result.processing_status}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 text-sm">{result.note}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Предпросмотр файла:</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                  {result.file_content_preview}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
