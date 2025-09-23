'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ===================== Типы для No-Code системы =====================

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: PageLayout;
  components: ComponentConfig[];
}

interface PageLayout {
  type: 'grid' | 'flex' | 'custom';
  columns: number;
  gap: number;
  responsive: boolean;
}

interface ComponentConfig {
  id: string;
  type: 'selector' | 'preview' | 'cart' | 'parameters' | 'custom';
  position: { row: number; col: number; span?: number };
  config: any;
  title?: string;
  visible: boolean;
}

interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  properties: PropertyConfig[];
  subcategories: SubcategoryConfig[];
  templates: PageTemplate[];
}

interface PropertyConfig {
  key: string;
  name: string;
  type: 'select' | 'text' | 'number' | 'boolean' | 'multiselect';
  required: boolean;
  options?: string[];
  validation?: any;
}

interface SubcategoryConfig {
  id: string;
  name: string;
  description: string;
  properties: PropertyConfig[];
}

// ===================== Предустановленные шаблоны =====================

const defaultTemplates: PageTemplate[] = [
  {
    id: 'doors-template',
    name: 'Шаблон для дверей',
    description: 'Полнофункциональный конфигуратор дверей с выбором стиля, модели, покрытия и фурнитуры',
    category: 'doors',
    layout: { type: 'grid', columns: 3, gap: 8, responsive: true },
    components: [
      {
        id: 'style-selector',
        type: 'selector',
        position: { row: 1, col: 1, span: 1 },
        config: {
          title: 'Полотно',
          type: 'style-tiles',
          options: ['Скрытая', 'Современная', 'Неоклассика', 'Классика']
        },
        title: 'Выбор стиля',
        visible: true
      },
      {
        id: 'model-selector',
        type: 'selector',
        position: { row: 2, col: 1, span: 1 },
        config: {
          title: 'Покрытие и цвет — Модели',
          type: 'model-cards',
          dependsOn: 'style'
        },
        title: 'Выбор модели',
        visible: true
      },
      {
        id: 'parameters-form',
        type: 'parameters',
        position: { row: 3, col: 1, span: 1 },
        config: {
          fields: [
            { key: 'finish', label: 'Покрытие', type: 'select' },
            { key: 'color', label: 'Цвет', type: 'select' },
            { key: 'type', label: 'Тип', type: 'select' },
            { key: 'width', label: 'Ширина', type: 'select' },
            { key: 'height', label: 'Высота', type: 'select' },
            { key: 'edge', label: 'Кромка', type: 'select', options: ['да', 'нет'] }
          ]
        },
        title: 'Параметры',
        visible: true
      },
      {
        id: 'preview-panel',
        type: 'preview',
        position: { row: 1, col: 2, span: 1 },
        config: {
          showImage: true,
          showPrice: true,
          showSku: true
        },
        title: 'Предпросмотр',
        visible: true
      },
      {
        id: 'cart-panel',
        type: 'cart',
        position: { row: 1, col: 3, span: 1 },
        config: {
          showTotal: true,
          allowEdit: true,
          exportOptions: ['kp', 'invoice', 'factory']
        },
        title: 'Корзина',
        visible: true
      }
    ]
  },
  {
    id: 'flooring-template',
    name: 'Шаблон для напольных покрытий',
    description: 'Конфигуратор напольных покрытий с выбором материала, цвета и размеров',
    category: 'flooring',
    layout: { type: 'grid', columns: 2, gap: 6, responsive: true },
    components: [
      {
        id: 'material-selector',
        type: 'selector',
        position: { row: 1, col: 1, span: 1 },
        config: {
          title: 'Материал',
          type: 'material-cards',
          options: ['Ламинат', 'Паркет', 'Линолеум', 'Плитка']
        },
        title: 'Выбор материала',
        visible: true
      },
      {
        id: 'collection-selector',
        type: 'selector',
        position: { row: 2, col: 1, span: 1 },
        config: {
          title: 'Коллекция',
          type: 'collection-grid',
          dependsOn: 'material'
        },
        title: 'Выбор коллекции',
        visible: true
      },
      {
        id: 'parameters-form',
        type: 'parameters',
        position: { row: 3, col: 1, span: 1 },
        config: {
          fields: [
            { key: 'color', label: 'Цвет', type: 'select' },
            { key: 'pattern', label: 'Рисунок', type: 'select' },
            { key: 'width', label: 'Ширина', type: 'number' },
            { key: 'length', label: 'Длина', type: 'number' },
            { key: 'thickness', label: 'Толщина', type: 'select' }
          ]
        },
        title: 'Параметры',
        visible: true
      },
      {
        id: 'preview-panel',
        type: 'preview',
        position: { row: 1, col: 2, span: 1 },
        config: {
          showImage: true,
          showPrice: true,
          showSpecs: true
        },
        title: 'Предпросмотр',
        visible: true
      },
      {
        id: 'cart-panel',
        type: 'cart',
        position: { row: 2, col: 2, span: 1 },
        config: {
          showTotal: true,
          allowEdit: true,
          exportOptions: ['kp', 'invoice']
        },
        title: 'Корзина',
        visible: true
      }
    ]
  },
  {
    id: 'kitchens-template',
    name: 'Шаблон для кухонь',
    description: 'Конфигуратор кухонных гарнитуров с выбором стиля, фасадов и фурнитуры',
    category: 'kitchens',
    layout: { type: 'grid', columns: 3, gap: 8, responsive: true },
    components: [
      {
        id: 'style-selector',
        type: 'selector',
        position: { row: 1, col: 1, span: 1 },
        config: {
          title: 'Стиль кухни',
          type: 'style-showcase',
          options: ['Современная', 'Классическая', 'Скандинавская', 'Лофт']
        },
        title: 'Выбор стиля',
        visible: true
      },
      {
        id: 'layout-selector',
        type: 'selector',
        position: { row: 2, col: 1, span: 1 },
        config: {
          title: 'Планировка',
          type: 'layout-planner',
          dependsOn: 'style'
        },
        title: 'Планировка',
        visible: true
      },
      {
        id: 'facade-selector',
        type: 'selector',
        position: { row: 3, col: 1, span: 1 },
        config: {
          title: 'Фасады',
          type: 'facade-gallery',
          dependsOn: 'layout'
        },
        title: 'Выбор фасадов',
        visible: true
      },
      {
        id: 'preview-panel',
        type: 'preview',
        position: { row: 1, col: 2, span: 1 },
        config: {
          showImage: true,
          showPrice: true,
          showDimensions: true
        },
        title: '3D Предпросмотр',
        visible: true
      },
      {
        id: 'cart-panel',
        type: 'cart',
        position: { row: 1, col: 3, span: 1 },
        config: {
          showTotal: true,
          allowEdit: true,
          exportOptions: ['kp', 'invoice', 'factory']
        },
        title: 'Корзина',
        visible: true
      }
    ]
  },
  {
    id: 'tiles-template',
    name: 'Шаблон для плитки',
    description: 'Конфигуратор керамической плитки с выбором коллекции, цвета и размера',
    category: 'tiles',
    layout: { type: 'grid', columns: 2, gap: 6, responsive: true },
    components: [
      {
        id: 'collection-selector',
        type: 'selector',
        position: { row: 1, col: 1, span: 1 },
        config: {
          title: 'Коллекция плитки',
          type: 'collection-mosaic',
          options: ['Классика', 'Модерн', 'Мрамор', 'Дерево']
        },
        title: 'Выбор коллекции',
        visible: true
      },
      {
        id: 'color-selector',
        type: 'selector',
        position: { row: 2, col: 1, span: 1 },
        config: {
          title: 'Цвет и фактура',
          type: 'color-palette',
          dependsOn: 'collection'
        },
        title: 'Выбор цвета',
        visible: true
      },
      {
        id: 'parameters-form',
        type: 'parameters',
        position: { row: 3, col: 1, span: 1 },
        config: {
          fields: [
            { key: 'size', label: 'Размер', type: 'select' },
            { key: 'finish', label: 'Поверхность', type: 'select' },
            { key: 'thickness', label: 'Толщина', type: 'select' },
            { key: 'area', label: 'Площадь (м²)', type: 'number' }
          ]
        },
        title: 'Параметры',
        visible: true
      },
      {
        id: 'preview-panel',
        type: 'preview',
        position: { row: 1, col: 2, span: 1 },
        config: {
          showImage: true,
          showPrice: true,
          showPattern: true
        },
        title: 'Предпросмотр',
        visible: true
      },
      {
        id: 'cart-panel',
        type: 'cart',
        position: { row: 2, col: 2, span: 1 },
        config: {
          showTotal: true,
          allowEdit: true,
          exportOptions: ['kp', 'invoice']
        },
        title: 'Корзина',
        visible: true
      }
    ]
  }
];

// ===================== Категории с конфигурацией =====================

const categoryConfigs: CategoryConfig[] = [
  {
    id: 'doors',
    name: 'Двери',
    description: 'Межкомнатные и входные двери',
    icon: '🚪',
    properties: [
      { key: 'style', name: 'Стиль', type: 'select', required: true, options: ['Скрытая', 'Современная', 'Неоклассика', 'Классика'] },
      { key: 'model', name: 'Модель', type: 'select', required: true },
      { key: 'finish', name: 'Покрытие', type: 'select', required: true },
      { key: 'color', name: 'Цвет', type: 'select', required: true },
      { key: 'type', name: 'Тип', type: 'select', required: true },
      { key: 'width', name: 'Ширина', type: 'number', required: true },
      { key: 'height', name: 'Высота', type: 'number', required: true },
      { key: 'edge', name: 'Кромка', type: 'select', required: false, options: ['да', 'нет'] }
    ],
    subcategories: [
      {
        id: 'door-handles',
        name: 'Ручки',
        description: 'Ручки для межкомнатных дверей',
        properties: [
          { key: 'name', name: 'Название', type: 'text', required: true },
          { key: 'supplier_name', name: 'Поставщик', type: 'text', required: true },
          { key: 'price_opt', name: 'Цена оптовая', type: 'number', required: true }
        ]
      },
      {
        id: 'door-kits',
        name: 'Комплекты фурнитуры',
        description: 'Комплекты фурнитуры для дверей',
        properties: [
          { key: 'name', name: 'Название', type: 'text', required: true },
          { key: 'group', name: 'Группа', type: 'number', required: false },
          { key: 'price_rrc', name: 'Цена РРЦ', type: 'number', required: true }
        ]
      }
    ],
    templates: [defaultTemplates[0]]
  },
  {
    id: 'flooring',
    name: 'Напольные покрытия',
    description: 'Ламинат, паркет, линолеум',
    icon: '🏠',
    properties: [
      { key: 'material', name: 'Материал', type: 'select', required: true, options: ['Ламинат', 'Паркет', 'Линолеум', 'Плитка'] },
      { key: 'collection', name: 'Коллекция', type: 'select', required: true },
      { key: 'color', name: 'Цвет', type: 'select', required: true },
      { key: 'pattern', name: 'Рисунок', type: 'select', required: false },
      { key: 'width', name: 'Ширина', type: 'number', required: true },
      { key: 'length', name: 'Длина', type: 'number', required: true },
      { key: 'thickness', name: 'Толщина', type: 'select', required: true }
    ],
    subcategories: [],
    templates: [defaultTemplates[1]]
  },
  {
    id: 'kitchens',
    name: 'Кухни',
    description: 'Кухонные гарнитуры на заказ',
    icon: '🍳',
    properties: [
      { key: 'style', name: 'Стиль', type: 'select', required: true, options: ['Современная', 'Классическая', 'Скандинавская', 'Лофт'] },
      { key: 'layout', name: 'Планировка', type: 'select', required: true },
      { key: 'facade', name: 'Фасад', type: 'select', required: true },
      { key: 'color', name: 'Цвет', type: 'select', required: true },
      { key: 'width', name: 'Ширина', type: 'number', required: true },
      { key: 'height', name: 'Высота', type: 'number', required: true }
    ],
    subcategories: [],
    templates: [defaultTemplates[2]]
  },
  {
    id: 'tiles',
    name: 'Плитка',
    description: 'Керамическая плитка и мозаика',
    icon: '🔲',
    properties: [
      { key: 'collection', name: 'Коллекция', type: 'select', required: true, options: ['Классика', 'Модерн', 'Мрамор', 'Дерево'] },
      { key: 'color', name: 'Цвет', type: 'select', required: true },
      { key: 'size', name: 'Размер', type: 'select', required: true },
      { key: 'finish', name: 'Поверхность', type: 'select', required: true },
      { key: 'thickness', name: 'Толщина', type: 'select', required: true },
      { key: 'area', name: 'Площадь', type: 'number', required: true }
    ],
    subcategories: [],
    templates: [defaultTemplates[3]]
  }
];

// ===================== Главный компонент No-Code редактора =====================

export default function NoCodePageBuilder() {
  const [selectedCategory, setSelectedCategory] = useState<string>('doors');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('doors-template');
  const [isEditing, setIsEditing] = useState(false);
  const [customLayout, setCustomLayout] = useState<PageLayout | null>(null);
  const [customComponents, setCustomComponents] = useState<ComponentConfig[]>([]);

  const currentCategory = categoryConfigs.find(c => c.id === selectedCategory);
  const currentTemplate = defaultTemplates.find(t => t.id === selectedTemplate);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = categoryConfigs.find(c => c.id === categoryId);
    if (category && category.templates.length > 0) {
      setSelectedTemplate(category.templates[0].id);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = defaultTemplates.find(t => t.id === templateId);
    if (template) {
      setCustomLayout(template.layout);
      setCustomComponents(template.components);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Входим в режим редактирования
      const template = defaultTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setCustomLayout(template.layout);
        setCustomComponents(template.components);
      }
    }
  };

  const saveTemplate = () => {
    // Здесь будет логика сохранения кастомного шаблона
    console.log('Сохранение шаблона:', {
      category: selectedCategory,
      layout: customLayout,
      components: customComponents
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-2xl font-bold text-black">
                Domeo
              </Link>
              <span className="text-black mx-3 text-lg font-bold">•</span>
              <span className="text-lg font-semibold text-black">No-Code Page Builder</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200"
              >
                На главную
              </Link>
              <Link 
                href="/admin" 
                className="px-4 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black transition-all duration-200"
              >
                Админка
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Панель управления */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-black/10 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-black">Настройки страницы</h2>
              
              {/* Выбор категории */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Категория товаров
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border border-black/20 px-3 py-2 text-black"
                >
                  {categoryConfigs.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Выбор шаблона */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Шаблон страницы
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full border border-black/20 px-3 py-2 text-black"
                >
                  {defaultTemplates
                    .filter(t => t.category === selectedCategory)
                    .map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  {currentTemplate?.description}
                </p>
              </div>

              {/* Режим редактирования */}
              <div className="space-y-3">
                <button
                  onClick={toggleEditMode}
                  className={`w-full px-4 py-2 border transition-all duration-200 ${
                    isEditing 
                      ? 'bg-yellow-400 text-black border-yellow-400' 
                      : 'bg-transparent border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {isEditing ? 'Выйти из редактирования' : 'Редактировать шаблон'}
                </button>
                
                {isEditing && (
                  <button
                    onClick={saveTemplate}
                    className="w-full px-4 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black transition-all duration-200"
                  >
                    Сохранить шаблон
                  </button>
                )}
              </div>

              {/* Предпросмотр настроек */}
              <div className="bg-black/5 p-4">
                <h3 className="text-sm font-semibold text-black mb-2">Текущие настройки:</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Категория: {currentCategory?.name}</div>
                  <div>Шаблон: {currentTemplate?.name}</div>
                  <div>Колонки: {customLayout?.columns || currentTemplate?.layout.columns}</div>
                  <div>Компонентов: {customComponents.length || currentTemplate?.components.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Предпросмотр страницы */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-black/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black">
                  Предпросмотр: {currentCategory?.name}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Шаблон:</span>
                  <span className="text-sm font-medium text-black">{currentTemplate?.name}</span>
                </div>
              </div>

              {/* Сетка компонентов */}
              <div 
                className={`grid gap-${customLayout?.gap || currentTemplate?.layout.gap || 6} ${
                  customLayout?.columns === 1 ? 'grid-cols-1' :
                  customLayout?.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  customLayout?.columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}
              >
                {(customComponents.length > 0 ? customComponents : currentTemplate?.components || []).map((component, index) => (
                  <div
                    key={component.id}
                    className={`bg-gray-50 border border-black/10 p-4 ${
                      isEditing ? 'hover:border-yellow-400 cursor-pointer' : ''
                    }`}
                    onClick={() => isEditing && console.log('Редактирование компонента:', component.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-black">
                        {component.title || component.type}
                      </h3>
                      {isEditing && (
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${component.visible ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                          <span className="text-xs text-gray-500">
                            {component.visible ? 'Видимый' : 'Скрытый'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      Тип: {component.type}
                    </div>
                    
                    {component.type === 'selector' && (
                      <div className="mt-2 text-xs text-gray-500">
                        {component.config.title || 'Селектор опций'}
                      </div>
                    )}
                    
                    {component.type === 'preview' && (
                      <div className="mt-2 text-xs text-gray-500">
                        Предпросмотр товара
                      </div>
                    )}
                    
                    {component.type === 'cart' && (
                      <div className="mt-2 text-xs text-gray-500">
                        Корзина товаров
                      </div>
                    )}
                    
                    {component.type === 'parameters' && (
                      <div className="mt-2 text-xs text-gray-500">
                        Форма параметров
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Кнопки действий */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {isEditing ? 'Режим редактирования активен' : 'Нажмите "Редактировать шаблон" для изменения'}
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200">
                    Предпросмотр
                  </button>
                  <button className="px-4 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black transition-all duration-200">
                    Применить к категории
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
