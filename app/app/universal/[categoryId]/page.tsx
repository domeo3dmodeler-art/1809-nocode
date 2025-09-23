'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ===================== Универсальный генератор страниц =====================

interface UniversalPageProps {
  categoryId: string;
  templateId: string;
  customConfig?: any;
}

interface ComponentRendererProps {
  component: any;
  categoryData: any;
  onUpdate: (data: any) => void;
}

// Универсальный рендерер компонентов
function ComponentRenderer({ component, categoryData, onUpdate }: ComponentRendererProps) {
  const [localData, setLocalData] = useState({});

  const handleDataChange = (newData: any) => {
    setLocalData(newData);
    onUpdate(newData);
  };

  switch (component.type) {
    case 'selector':
      return (
        <div className="bg-white border border-black/10 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            {component.config.title || 'Выбор опций'}
          </h3>
          
          {component.config.type === 'style-tiles' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {component.config.options?.map((option: string) => (
                <button
                  key={option}
                  onClick={() => handleDataChange({ style: option })}
                  className="group overflow-hidden border border-black/10 hover:border-black transition-all duration-200"
                >
                  <div className="aspect-[4/3] flex items-center justify-center bg-gray-50">
                    <div className="w-16 h-28 bg-white border border-black/10 relative">
                      <div className="absolute right-1/4 top-1/2 w-4 h-1 bg-black/30" />
                    </div>
                  </div>
                  <div className="p-3 text-left">
                    <div className="font-medium text-black">{option}</div>
                    <div className="text-xs text-gray-500">Выбрать стиль</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {component.config.type === 'model-cards' && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {categoryData.models?.map((model: any) => (
                <button
                  key={model.id}
                  onClick={() => handleDataChange({ model: model.id })}
                  className="group w-full text-left border border-black/10 hover:border-black transition-all duration-200"
                >
                  <div className="p-4 flex flex-col gap-3">
                    <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50">
                      <img
                        src={model.image || '/assets/placeholder.jpg'}
                        alt={model.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-lg font-semibold text-black">{model.name}</div>
                      <div className="text-sm text-gray-500">{model.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {component.config.type === 'material-cards' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {component.config.options?.map((material: string) => (
                <button
                  key={material}
                  onClick={() => handleDataChange({ material })}
                  className="group overflow-hidden border border-black/10 hover:border-black transition-all duration-200"
                >
                  <div className="aspect-square flex items-center justify-center bg-gray-50">
                    <div className="text-4xl">
                      {material === 'Ламинат' && '🏠'}
                      {material === 'Паркет' && '🌳'}
                      {material === 'Линолеум' && '📐'}
                      {material === 'Плитка' && '🔲'}
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="font-medium text-black">{material}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      );

    case 'parameters':
      return (
        <div className="bg-white border border-black/10 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            {component.title || 'Параметры'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {component.config.fields?.map((field: any) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-black mb-1">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    onChange={(e) => handleDataChange({ [field.key]: e.target.value })}
                    className="w-full border border-black/20 px-3 py-2 text-black"
                  >
                    <option value="">—</option>
                    {field.options?.map((option: string) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    onChange={(e) => handleDataChange({ [field.key]: Number(e.target.value) })}
                    className="w-full border border-black/20 px-3 py-2 text-black"
                    placeholder="Введите число"
                  />
                ) : (
                  <input
                    type="text"
                    onChange={(e) => handleDataChange({ [field.key]: e.target.value })}
                    className="w-full border border-black/20 px-3 py-2 text-black"
                    placeholder={`Введите ${field.label.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'preview':
      return (
        <div className="bg-white border border-black/10 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            {component.title || 'Предпросмотр'}
          </h3>
          <div className="aspect-[3/4] w-full overflow-hidden bg-gray-50 border border-black/10">
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🖼️</div>
                <div className="text-gray-600">Предпросмотр товара</div>
              </div>
            </div>
          </div>
          {component.config.showPrice && (
            <div className="mt-4 text-2xl font-bold text-black">
              — ₽
            </div>
          )}
        </div>
      );

    case 'cart':
      return (
        <div className="bg-white border border-black/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">
              {component.title || 'Корзина'}
            </h3>
            <div className="text-sm text-gray-600">
              Итого: <span className="font-semibold text-black">— ₽</span>
            </div>
          </div>
          <div className="text-gray-500 text-center py-8">
            Корзина пуста
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {component.config.exportOptions?.map((option: string) => (
              <button
                key={option}
                className="px-3 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200"
              >
                {option === 'kp' && 'КП'}
                {option === 'invoice' && 'Счет'}
                {option === 'factory' && 'Заказ на фабрику'}
              </button>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-white border border-black/10 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            {component.title || 'Неизвестный компонент'}
          </h3>
          <div className="text-gray-500">
            Компонент типа "{component.type}" не поддерживается
          </div>
        </div>
      );
  }
}

// Главный компонент универсальной страницы
export default function UniversalPage({ categoryId, templateId, customConfig }: UniversalPageProps) {
  const [pageData, setPageData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [template, setTemplate] = useState(null);

  // Загрузка данных категории
  useEffect(() => {
    // Здесь будет загрузка данных категории из API
    const mockData = {
      doors: {
        models: [
          { id: 'pg-base-1', name: 'PG Base 1', description: 'Современная дверь', image: '/assets/doors/pg-base-1.jpg' },
          { id: 'po-base-1-1', name: 'PO Base 1/1', description: 'Классическая дверь', image: '/assets/doors/po-base-1-1.jpg' },
          { id: 'neo-1', name: 'Neo-1', description: 'Неоклассическая дверь', image: '/assets/doors/neo-1.jpg' }
        ]
      },
      flooring: {
        models: [
          { id: 'laminate-1', name: 'Ламинат Premium', description: 'Высококачественный ламинат', image: '/assets/flooring/laminate-1.jpg' },
          { id: 'parquet-1', name: 'Паркет Дуб', description: 'Массив дуба', image: '/assets/flooring/parquet-1.jpg' }
        ]
      }
    };
    
    setCategoryData(mockData[categoryId as keyof typeof mockData] || {});
  }, [categoryId]);

  // Загрузка шаблона
  useEffect(() => {
    // Здесь будет загрузка шаблона из API
    const mockTemplates = {
      'doors-template': {
        id: 'doors-template',
        name: 'Шаблон для дверей',
        layout: { type: 'grid', columns: 3, gap: 8 },
        components: [
          {
            id: 'style-selector',
            type: 'selector',
            position: { row: 1, col: 1 },
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
            position: { row: 2, col: 1 },
            config: {
              title: 'Модели',
              type: 'model-cards'
            },
            title: 'Выбор модели',
            visible: true
          },
          {
            id: 'preview-panel',
            type: 'preview',
            position: { row: 1, col: 2 },
            config: { showPrice: true },
            title: 'Предпросмотр',
            visible: true
          },
          {
            id: 'cart-panel',
            type: 'cart',
            position: { row: 1, col: 3 },
            config: { exportOptions: ['kp', 'invoice', 'factory'] },
            title: 'Корзина',
            visible: true
          }
        ]
      },
      'flooring-template': {
        id: 'flooring-template',
        name: 'Шаблон для напольных покрытий',
        layout: { type: 'grid', columns: 2, gap: 6 },
        components: [
          {
            id: 'material-selector',
            type: 'selector',
            position: { row: 1, col: 1 },
            config: {
              title: 'Материал',
              type: 'material-cards',
              options: ['Ламинат', 'Паркет', 'Линолеум', 'Плитка']
            },
            title: 'Выбор материала',
            visible: true
          },
          {
            id: 'preview-panel',
            type: 'preview',
            position: { row: 1, col: 2 },
            config: { showPrice: true },
            title: 'Предпросмотр',
            visible: true
          }
        ]
      }
    };
    
    setTemplate(mockTemplates[templateId as keyof typeof mockTemplates] || null);
  }, [templateId]);

  const handleDataUpdate = (newData: any) => {
    setPageData(prev => ({ ...prev, ...newData }));
  };

  if (!template) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-xl text-gray-600">Загрузка шаблона...</div>
        </div>
      </div>
    );
  }

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
              <span className="text-lg font-semibold text-black">
                {template.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/nocode-builder" 
                className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200"
              >
                Редактор
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

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div 
          className={`grid gap-${template.layout.gap} ${
            template.layout.columns === 1 ? 'grid-cols-1' :
            template.layout.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
            template.layout.columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {template.components.map((component) => (
            <ComponentRenderer
              key={component.id}
              component={component}
              categoryData={categoryData}
              onUpdate={handleDataUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
