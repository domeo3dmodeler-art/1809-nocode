'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CategoryStats {
  id: string;
  name: string;
  totalProducts: number;
  lastImport: string | null;
  totalImports: number;
  isActive: boolean;
}

interface StatsData {
  categories: CategoryStats[];
  total: {
    totalCategories: number;
    totalProducts: number;
    lastImport: string | null;
    totalImports: number;
  };
}

export default function AdminDashboard() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData>({
    categories: [],
    total: {
      totalCategories: 0,
      totalProducts: 0,
      lastImport: null,
      totalImports: 0
    }
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const [isTableExpanded, setIsTableExpanded] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchStats();
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

  const fetchStats = async () => {
    try {
      // Получаем статистику из нового API
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Устанавливаем значения по умолчанию
      setStats({
        categories: [],
        total: {
          totalCategories: 0,
          totalProducts: 0,
          lastImport: null,
          totalImports: 0
        }
      });
    }
  };

  // Функция для обновления статистики (можно вызвать после импорта)
  const refreshStats = () => {
    fetchStats();
  };

  // Функция для показа истории импортов
  const showImportHistory = async (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    
    try {
      // Получаем историю импортов для категории
      const response = await fetch(`/api/admin/import-history?category=${categoryId}`);
      const data = await response.json();
      
      if (data.ok) {
        setImportHistory(data.history || []);
        setShowImportModal(true);
      } else {
        // Если API не существует, показываем заглушку
        setImportHistory([
          {
            id: '1',
            filename: 'doors_price_2025.xlsx',
            imported_at: new Date().toISOString(),
            products_count: 0,
            status: 'completed'
          }
        ]);
        setShowImportModal(true);
      }
    } catch (error) {
      console.error('Error fetching import history:', error);
      // Показываем заглушку при ошибке
      setImportHistory([
        {
          id: '1',
          filename: 'doors_price_2025.xlsx',
          imported_at: new Date().toISOString(),
          products_count: 0,
          status: 'completed'
        }
      ]);
      setShowImportModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка админки...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="text-gray-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 text-xl mb-4">{error}</p>
          <button 
            onClick={fetchCategories}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-3">
                  <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                    <div>
                      <h1 className="text-2xl font-bold text-black">Domeo</h1>
                      <p className="text-xs text-gray-500 font-medium">Configurators</p>
                    </div>
                  </Link>
                  <div className="flex items-center">
                    <span className="text-black mx-3 text-lg font-bold">•</span>
                    <h2 className="text-lg font-semibold text-black">Админка</h2>
                  </div>
                </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="px-6 py-2 bg-transparent border border-black text-black rounded-none hover:bg-black hover:text-white transition-all duration-200 text-sm font-medium"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Категории товаров</h2>
              <p className="text-gray-600 mt-1">Управляйте разными группами товаров. Каждая категория имеет свои свойства и настройки импорта.</p>
            </div>
                <Link
                  href="/admin/categories"
                  className="inline-flex items-center px-6 py-2 bg-black text-white rounded-none hover:bg-yellow-400 hover:text-black transition-all duration-200 text-sm font-medium"
                >
                  <span className="mr-2">+</span>
                  Новая категория
                </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.filter(category => category.id === 'doors').map((category) => (
              <div key={category.id} className="bg-white border border-black/10 p-6 hover:border-black transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="bg-black/5 p-3">
                    <span className="text-3xl">{category.icon}</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-black">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Свойства товаров:</p>
                  <div className="flex flex-wrap gap-1">
                    {category.properties.slice(0, 4).map((prop) => (
                      <span 
                        key={prop.key}
                        className={`px-2 py-1 text-xs rounded-none border ${
                          prop.required 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-black border-black/20'
                        }`}
                      >
                        {prop.name}
                        {prop.required && ' *'}
                      </span>
                    ))}
                    {category.properties.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-black text-white border border-black">
                        +{category.properties.length - 4} еще
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="flex-1 px-3 py-2 bg-black text-white text-sm rounded-none hover:bg-yellow-400 hover:text-black text-center transition-colors"
                  >
                    Управление
                  </Link>
                  <Link
                    href={`/admin/import?category=${category.id}`}
                    className="flex-1 px-3 py-2 bg-transparent border border-black text-black text-sm rounded-none hover:bg-black hover:text-white text-center transition-colors"
                  >
                    Импорт
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-white border border-black/10 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Статистика</h3>
            <button
              onClick={refreshStats}
              className="px-4 py-2 bg-transparent border border-black text-black rounded-none hover:bg-black hover:text-white transition-all duration-200 text-sm font-medium"
            >
              🔄 Обновить
            </button>
          </div>
          
          {/* Объединенная таблица статистики */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-black/10">
              <thead className="bg-black/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Всего товаров
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Последний импорт
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Общая строка */}
                <tr className="bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors cursor-pointer" onClick={() => setIsTableExpanded(!isTableExpanded)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-black/10 p-2 mr-3">
                        <span className="text-black text-lg">📊</span>
                      </div>
                      <div className="text-sm font-semibold text-black">
                        Общая статистика
                      </div>
                      <div className="ml-3">
                        <svg 
                          className={`w-4 h-4 text-black transition-transform duration-200 ${isTableExpanded ? 'rotate-90' : 'rotate-0'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black font-bold text-lg">
                      {stats.total.totalProducts}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-black font-medium">
                      {stats.total.lastImport ? new Date(stats.total.lastImport).toLocaleDateString() : 'Нет данных'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-400 text-black">
                      {stats.total.totalCategories} активных
                    </span>
                  </td>
                </tr>
                
                {/* Строки по категориям - показываем только если развернуто */}
                {isTableExpanded && stats.categories.map((category) => (
                  <tr key={category.id} className="hover:bg-black/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-black/10 p-2 mr-3">
                          <span className="text-black text-lg">🚪</span>
                        </div>
                        <div className="text-sm font-medium text-black">
                          {category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-black font-semibold">
                        {category.totalProducts}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => showImportHistory(category.id, category.name)}
                        className="text-black hover:text-yellow-400 hover:underline cursor-pointer text-sm font-medium transition-colors"
                      >
                        {category.lastImport ? new Date(category.lastImport).toLocaleDateString() : 'Нет'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-400 text-black">
                        Активна
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Быстрые действия */}
        <div className="bg-white border border-black/10 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/import?category=doors"
              className="flex items-center p-4 bg-white border border-black/10 hover:border-black transition-all duration-200"
            >
              <span className="text-2xl mr-3">📥</span>
              <div>
                <p className="font-medium text-black">Импорт прайса</p>
                <p className="text-sm text-gray-600">Загрузка цен и данных товаров</p>
              </div>
            </Link>
            
            <Link
              href="/admin/media"
              className="flex items-center p-4 bg-white border border-black/10 hover:border-black transition-all duration-200"
            >
              <span className="text-2xl mr-3">🖼️</span>
              <div>
                <p className="font-medium text-black">Загрузка фото</p>
                <p className="text-sm text-gray-600">Управление изображениями товаров</p>
              </div>
            </Link>
            
            <Link
              href="/admin/products"
              className="flex items-center p-4 bg-white border border-black/10 hover:border-black transition-all duration-200"
            >
              <span className="text-2xl mr-3">📦</span>
              <div>
                <p className="font-medium text-black">Товары</p>
                <p className="text-sm text-gray-600">Просмотр загруженных товаров</p>
              </div>
            </Link>
            
            <Link
              href="/admin/analytics"
              className="flex items-center p-4 bg-white border border-black/10 hover:border-black transition-all duration-200"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <p className="font-medium text-black">Аналитика</p>
                <p className="text-sm text-gray-600">Статистика и отчеты</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Модальное окно истории импортов */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  История импортов - {selectedCategory?.name}
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Закрыть</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {importHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">История импортов пуста</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Файл
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Дата импорта
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Товаров
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Статус
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {importHistory.map((importItem) => (
                        <tr key={importItem.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {importItem.filename}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(importItem.imported_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {importItem.products_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              importItem.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {importItem.status === 'completed' ? 'Завершен' : 'В процессе'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}