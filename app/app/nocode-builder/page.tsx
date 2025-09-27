'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NoCodeComponentRenderer, componentRegistry } from '../../components/nocode/NoCodeComponents';

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
  type: 'style-selector' | 'model-selector' | 'parameters-form' | 'preview-panel' | 'cart-panel' | 'custom';
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
        type: 'style-selector',
        position: { row: 1, col: 1, span: 1 },
        config: {
          title: 'Полотно',
          options: ['Скрытая', 'Современная', 'Неоклассика', 'Классика']
        },
        title: 'Выбор стиля',
        visible: true
      },
      {
        id: 'model-selector',
        type: 'model-selector',
        position: { row: 2, col: 1, span: 1 },
        config: {
          title: 'Модели',
          models: [
            { id: 'pg-base-1', name: 'PG Base 1', description: 'Современная дверь' },
            { id: 'po-base-1-1', name: 'PO Base 1/1', description: 'Классическая дверь' },
            { id: 'neo-1', name: 'Neo-1', description: 'Неоклассическая дверь' }
          ]
        },
        title: 'Выбор модели',
        visible: true
      },
      {
        id: 'parameters-form',
        type: 'parameters-form',
        position: { row: 3, col: 1, span: 1 },
        config: {
          fields: [
            { key: 'finish', label: 'Покрытие', type: 'select', options: ['Ламинат', 'ПВХ', 'Шпон'] },
            { key: 'color', label: 'Цвет', type: 'select', options: ['Белый', 'Дуб', 'Орех'] },
            { key: 'width', label: 'Ширина', type: 'number', min: 600, max: 1000 },
            { key: 'height', label: 'Высота', type: 'number', min: 1900, max: 2200 }
          ]
        },
        title: 'Параметры',
        visible: true
      },
      {
        id: 'preview-panel',
        type: 'preview-panel',
        position: { row: 1, col: 2, span: 2 },
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
        type: 'cart-panel',
        position: { row: 3, col: 2, span: 2 },
        config: {
          showTotal: true,
          allowEdit: true,
          exportOptions: ['kp', 'invoice', 'factory-csv', 'factory-xlsx']
        },
        title: 'Корзина',
        visible: true
      }
    ]
  },
  {
    id: 'flooring-template',
    name: 'Шаблон для напольных покрытий',
    description: 'Конфигуратор для ламината, паркета, линолеума',
    category: 'flooring',
    layout: { type: 'grid', columns: 2, gap: 6, responsive: true },
    components: [
      {
        id: 'material-selector',
        type: 'style-selector',
        position: { row: 1, col: 1, span: 1 },
        config: {
          title: 'Материал',
          options: ['Ламинат', 'Паркет', 'Линолеум', 'Плитка']
        },
        title: 'Выбор материала',
        visible: true
      },
      {
        id: 'collection-selector',
        type: 'model-selector',
        position: { row: 2, col: 1, span: 1 },
        config: {
          title: 'Коллекция',
          models: [
            { id: 'laminate-premium', name: 'Ламинат Premium', description: 'Высококачественный ламинат' },
            { id: 'parquet-oak', name: 'Паркет Дуб', description: 'Массив дуба' }
          ]
        },
        title: 'Выбор коллекции',
        visible: true
      },
      {
        id: 'parameters-form',
        type: 'parameters-form',
        position: { row: 3, col: 1, span: 1 },
        config: {
          fields: [
            { key: 'color', label: 'Цвет', type: 'select', options: ['Дуб', 'Орех', 'Ясень'] },
            { key: 'pattern', label: 'Рисунок', type: 'select', options: ['Однополосный', 'Трехполосный'] },
            { key: 'width', label: 'Ширина', type: 'number', min: 100, max: 300 },
            { key: 'length', label: 'Длина', type: 'number', min: 1000, max: 2000 },
            { key: 'thickness', label: 'Толщина', type: 'select', options: ['8 мм', '10 мм', '12 мм'] }
          ]
        },
        title: 'Параметры',
        visible: true
      },
      {
        id: 'preview-panel',
        type: 'preview-panel',
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
        type: 'cart-panel',
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
    id: 'smart-template',
    name: 'Шаблон для умных устройств',
    description: 'Каталог товаров из domeosmart.ru',
    category: 'smart',
    layout: { type: 'grid', columns: 2, gap: 6, responsive: true },
    components: [
      {
        id: 'category-selector',
        type: 'style-selector',
        position: { row: 1, col: 1, span: 1 },
        config: {
          title: 'Категория',
          options: ['Умное освещение', 'Умные выключатели', 'Датчики', 'Умные розетки']
        },
        title: 'Выбор категории',
        visible: true
      },
      {
        id: 'product-selector',
        type: 'model-selector',
        position: { row: 2, col: 1, span: 1 },
        config: {
          title: 'Товары',
          models: [
            { id: 'smart-bulb-1', name: 'Умная лампа RGB', description: 'Управление через приложение' },
            { id: 'smart-switch-1', name: 'Умный выключатель', description: 'Wi-Fi управление' }
          ]
        },
        title: 'Выбор товара',
        visible: true
      },
      {
        id: 'preview-panel',
        type: 'preview-panel',
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
        type: 'cart-panel',
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
      { key: 'width', name: 'Ширина', type: 'number', required: true },
      { key: 'height', name: 'Высота', type: 'number', required: true }
    ],
    subcategories: [],
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
      { key: 'pattern', name: 'Рисунок', type: 'select', required: true },
      { key: 'width', name: 'Ширина', type: 'number', required: true },
      { key: 'length', name: 'Длина', type: 'number', required: true },
      { key: 'thickness', name: 'Толщина', type: 'select', required: true }
    ],
    subcategories: [],
    templates: [defaultTemplates[1]]
  },
  {
    id: 'smart',
    name: 'Смарт',
    description: 'Товары из каталога domeosmart.ru',
    icon: '🏠',
    properties: [
      { key: 'category', name: 'Категория', type: 'select', required: true, options: ['Умное освещение', 'Умные выключатели', 'Датчики', 'Умные розетки'] },
      { key: 'product', name: 'Товар', type: 'select', required: true },
      { key: 'quantity', name: 'Количество', type: 'number', required: true }
    ],
    subcategories: [],
    templates: [defaultTemplates[2]]
  }
];

// ===================== Главный компонент No-Code редактора =====================

export default function NoCodePageBuilder() {
  const [selectedCategory, setSelectedCategory] = useState<string>('doors');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('doors-template');
  const [isEditing, setIsEditing] = useState(false);
  const [customLayout, setCustomLayout] = useState<PageLayout | null>(null);
  const [customComponents, setCustomComponents] = useState<ComponentConfig[]>([]);
  const [componentData, setComponentData] = useState<Record<string, any>>({});

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

  const handleComponentUpdate = (id: string, data: any) => {
    setComponentData(prev => ({ ...prev, [id]: data }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      const template = defaultTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        setCustomLayout(template.layout);
        setCustomComponents(template.components);
      }
    }
  };

  const saveTemplate = () => {
    console.log('Сохранение шаблона:', {
      category: selectedCategory,
      layout: customLayout,
      components: customComponents,
      data: componentData
    });
    setIsEditing(false);
  };

  const layout = customLayout || currentTemplate?.layout || { type: 'grid', columns: 3, gap: 8, responsive: true };
  const components = customComponents.length > 0 ? customComponents : currentTemplate?.components || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-2xl font-bold text-black">
                Domeo
              </Link>
              <span className="text-black text-lg font-bold">•</span>
              <span className="text-lg font-semibold text-black">No-Code Конструктор</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleEditMode}
                className={`px-4 py-2 border transition-all duration-200 text-sm font-medium ${
                  isEditing 
                    ? 'bg-yellow-400 text-black border-yellow-400' 
                    : 'bg-black text-white border-black hover:bg-yellow-400 hover:text-black'
                }`}
              >
                {isEditing ? 'Предпросмотр' : 'Редактировать'}
              </button>
              {isEditing && (
                <button
                  onClick={saveTemplate}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium"
                >
                  Сохранить
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {categoryConfigs.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Шаблон</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {currentCategory?.templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Template Info */}
        {currentTemplate && (
          <div className="mb-8 p-4 bg-gray-50 border border-black/10">
            <h2 className="text-lg font-semibold text-black mb-2">{currentTemplate.name}</h2>
            <p className="text-gray-600 text-sm">{currentTemplate.description}</p>
          </div>
        )}

        {/* Page Preview */}
        <div className="bg-white border border-black/10">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">Предпросмотр страницы</h2>
          </div>
          
          <div 
            className="p-6"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
              gap: `${layout.gap * 0.25}rem`
            }}
          >
            {components
              .filter(component => component.visible)
              .map((component) => (
                <div
                  key={component.id}
                  className={`bg-gray-50 border border-black/10 p-4 ${
                    isEditing ? 'hover:border-yellow-400 cursor-pointer' : ''
                  }`}
                  onClick={() => isEditing && console.log('Редактирование компонента:', component.id)}
                  style={{
                    gridColumn: `span ${component.position.span || 1}`,
                    gridRow: component.position.row
                  }}
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
                  
                  <NoCodeComponentRenderer
                    type={component.type}
                    id={component.id}
                    config={component.config}
                    data={componentData[component.id]}
                    onUpdate={handleComponentUpdate}
                  />
                </div>
              ))}
          </div>
        </div>

        {/* Component Library */}
        {isEditing && (
          <div className="mt-8 bg-white border border-black/10">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black">Библиотека компонентов</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.keys(componentRegistry).map(type => (
                  <div
                    key={type}
                    className="p-4 border border-gray-200 hover:border-yellow-400 cursor-pointer transition-all duration-200"
                    onClick={() => console.log('Добавление компонента:', type)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📦</div>
                      <div className="text-sm font-medium text-black">{type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}