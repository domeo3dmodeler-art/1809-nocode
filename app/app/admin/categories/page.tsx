'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type FieldMapping = {
  key: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'url';
  required: boolean;
  unit?: string;
  options?: string[];
};

type Category = { 
  id: string; 
  name: string; 
  description: string; 
  icon: string; 
  is_main: boolean;
  parent_id?: string;
  properties: FieldMapping[];
  import_mapping: Record<string, string>;
  subcategories?: Category[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '📦',
    is_main: true,
    parent_id: null as string | null,
    properties: [] as FieldMapping[]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      // Фильтруем только активные категории (только "Двери")
      const activeCategories = (data.categories || []).filter((cat: Category) => cat.id === 'doors');
      setCategories(activeCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name || newCategory.properties.length === 0) {
      alert('Название и хотя бы одно свойство обязательны');
      return;
    }

    if (!newCategory.is_main && !newCategory.parent_id) {
      alert('Для подкатегории необходимо выбрать родительскую категорию');
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Категория создана успешно!');
        setShowCreateForm(false);
        setNewCategory({ 
          name: '', 
          description: '', 
          icon: '📦', 
          is_main: true,
          parent_id: null,
          properties: [] 
        });
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(`Ошибка создания категории: ${error.error}`);
      }
    } catch (error) {
      alert('Ошибка при создании категории');
    }
  };

  const addProperty = () => {
    setNewCategory(prev => ({
      ...prev,
      properties: [...prev.properties, {
        key: '',
        name: '',
        type: 'text',
        required: false
      }]
    }));
  };

  const updateProperty = (index: number, field: keyof FieldMapping, value: any) => {
    setNewCategory(prev => ({
      ...prev,
      properties: prev.properties.map((prop, i) => 
        i === index ? { ...prop, [field]: value } : prop
      )
    }));
  };

  const removeProperty = (index: number) => {
    setNewCategory(prev => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Domeo</h1>
                <p className="text-xs text-gray-600">Configurators</p>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mx-2 text-lg">•</span>
                <h2 className="text-lg font-semibold text-gray-800">Управление категориями</h2>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/admin"
                className="px-4 py-2 bg-transparent border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium"
              >
                Назад в админку
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Заголовок и кнопка создания */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Категории товаров</h1>
              <p className="text-gray-600">Управляйте группами товаров и их свойствами</p>
            </div>
            <button
              onClick={() => {
                console.log('Кнопка нажата, showCreateForm:', showCreateForm);
                setShowCreateForm(true);
              }}
              className={`px-6 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg cursor-pointer ${
                showCreateForm 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              {showCreateForm ? '✓ Форма открыта' : '+ Создать категорию'}
            </button>
          </div>

          {/* Список категорий */}
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-xl shadow-md border border-gray-200">
                {/* Основная категория */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-100 p-3 rounded-lg mr-4">
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/import?category=${category.id}`}
                        className="px-3 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 text-center transition-colors"
                      >
                        Импорт
                      </Link>
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 text-center transition-colors"
                      >
                        Редактировать
                      </Link>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Свойства товаров:</p>
                    <div className="flex flex-wrap gap-1">
                      {category.properties.slice(0, 4).map((prop) => (
                        <span 
                          key={prop.key}
                          className={`px-2 py-1 text-xs rounded-full ${
                            prop.required 
                              ? 'bg-gray-200 text-gray-800 border border-gray-300' 
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {prop.name}
                          {prop.required && ' *'}
                        </span>
                      ))}
                      {category.properties.length > 4 && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full border border-gray-300">
                          +{category.properties.length - 4} еще
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Подкатегории */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Подкатегории</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.subcategories.map(subcategory => (
                        <div key={subcategory.id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center mb-3">
                            <div className="bg-gray-100 p-2 rounded-lg mr-3">
                              <span className="text-xl">{subcategory.icon}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{subcategory.name}</h5>
                              <p className="text-xs text-gray-500">{subcategory.description}</p>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-1">Свойства:</p>
                            <div className="flex flex-wrap gap-1">
                              {subcategory.properties.slice(0, 3).map((prop) => (
                                <span 
                                  key={prop.key}
                                  className={`px-1 py-0.5 text-xs rounded ${
                                    prop.required 
                                      ? 'bg-gray-200 text-gray-800' 
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {prop.name}
                                  {prop.required && ' *'}
                                </span>
                              ))}
                              {subcategory.properties.length > 3 && (
                                <span className="px-1 py-0.5 text-xs bg-gray-200 text-gray-800 rounded">
                                  +{subcategory.properties.length - 3}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/import?category=${subcategory.id}`}
                              className="flex-1 px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-900 text-center transition-colors"
                            >
                              Импорт
                            </Link>
                            <button className="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 text-center transition-colors">
                              Редактировать
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Форма создания категории */}
          {showCreateForm && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Создать новую категорию</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Например: Окна"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="Краткое описание"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="🪟"
                  />
                </div>
    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип категории</label>
                  <select
                    value={newCategory.is_main ? 'main' : 'sub'}
                    onChange={(e) => {
                      const isMain = e.target.value === 'main';
                      setNewCategory(prev => ({ 
                        ...prev, 
                        is_main: isMain,
                        parent_id: isMain ? null : prev.parent_id
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="main">Основная категория</option>
                    <option value="sub">Подкатегория</option>
                  </select>
                </div>
              </div>

              {/* Выбор родительской категории для подкатегории */}
              {!newCategory.is_main && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Родительская категория</label>
                  <select
                    value={newCategory.parent_id || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, parent_id: e.target.value || null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">Выберите родительскую категорию</option>
                    {categories.filter(cat => cat.is_main).map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">Свойства товаров</h4>
                  <button
                    onClick={addProperty}
                    className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    + Добавить свойство
                  </button>
                </div>
                
                <div className="space-y-2">
                  {newCategory.properties.map((prop, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg">
                      <input
                        type="text"
                        placeholder="Ключ поля"
                        value={prop.key}
                        onChange={(e) => updateProperty(index, 'key', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Название"
                        value={prop.name}
                        onChange={(e) => updateProperty(index, 'name', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <select
                        value={prop.type}
                        onChange={(e) => updateProperty(index, 'type', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="text">Текст</option>
                        <option value="number">Число</option>
                        <option value="select">Список</option>
                        <option value="url">URL</option>
                      </select>
                      <label className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={prop.required}
                          onChange={(e) => updateProperty(index, 'required', e.target.checked)}
                          className="mr-1"
                        />
                        Обязательное
                      </label>
                      <button
                        onClick={() => removeProperty(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                >
                  Создать категорию
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}