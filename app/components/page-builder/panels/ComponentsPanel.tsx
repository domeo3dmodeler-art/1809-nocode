'use client';

import React, { useState } from 'react';
import { ComponentsPanelProps } from '../types';

interface ComponentCategory {
  id: string;
  name: string;
  icon: string;
  components: ComponentItem[];
}

interface ComponentItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
}

const componentCategories: ComponentCategory[] = [
  {
    id: 'basic',
    name: 'Базовые элементы',
    icon: '📝',
    components: [
      { id: 'text', name: 'Текст', type: 'text', icon: '📝', description: 'Простой текстовый блок' },
      { id: 'heading', name: 'Заголовок', type: 'heading', icon: '📰', description: 'Заголовок H1-H6' },
      { id: 'image', name: 'Изображение', type: 'image', icon: '🖼️', description: 'Изображение или фото' },
      { id: 'button', name: 'Кнопка', type: 'button', icon: '🔘', description: 'Интерактивная кнопка' },
      { id: 'container', name: 'Контейнер', type: 'container', icon: '📦', description: 'Контейнер для группировки элементов' },
      { id: 'spacer', name: 'Отступ', type: 'spacer', icon: '↔️', description: 'Пространство между элементами' },
      { id: 'divider', name: 'Разделитель', type: 'divider', icon: '➖', description: 'Горизонтальная линия' }
    ]
  },
  {
    id: 'product',
    name: 'Товарные компоненты',
    icon: '📦',
    components: [
      { id: 'productConfigurator', name: 'Конфигуратор товаров', type: 'productConfigurator', icon: '⚙️', description: 'Интерактивный конфигуратор для выбора товаров' },
      { id: 'productGrid', name: 'Сетка товаров', type: 'productGrid', icon: '📊', description: 'Сетка для отображения товаров' },
      { id: 'productFilters', name: 'Фильтры товаров', type: 'productFilters', icon: '🔍', description: 'Фильтры для поиска товаров' },
      { id: 'productCarousel', name: 'Карусель товаров', type: 'productCarousel', icon: '🎠', description: 'Карусель для показа товаров' }
    ]
  },
  {
    id: 'calculator',
    name: 'Калькуляторы',
    icon: '💰',
    components: [
      { id: 'priceCalculator', name: 'Калькулятор цены', type: 'priceCalculator', icon: '💵', description: 'Расчет цены товаров' },
      { id: 'deliveryCalculator', name: 'Калькулятор доставки', type: 'deliveryCalculator', icon: '🚚', description: 'Расчет стоимости доставки' },
      { id: 'discountCalculator', name: 'Калькулятор скидок', type: 'discountCalculator', icon: '🏷️', description: 'Расчет скидок и акций' }
    ]
  },
  {
    id: 'interaction',
    name: 'Интерактивные элементы',
    icon: '🔄',
    components: [
      { id: 'cart', name: 'Корзина', type: 'cart', icon: '🛒', description: 'Корзина для товаров' },
      { id: 'wishlist', name: 'Избранное', type: 'wishlist', icon: '❤️', description: 'Список избранных товаров' },
      { id: 'comparison', name: 'Сравнение', type: 'comparison', icon: '⚖️', description: 'Сравнение товаров' },
      { id: 'search', name: 'Поиск', type: 'search', icon: '🔍', description: 'Поиск по товарам' }
    ]
  },
  {
    id: 'forms',
    name: 'Формы',
    icon: '📋',
    components: [
      { id: 'form', name: 'Форма', type: 'form', icon: '📝', description: 'Форма для ввода данных' },
      { id: 'input', name: 'Поле ввода', type: 'input', icon: '📝', description: 'Поле для ввода текста' },
      { id: 'textarea', name: 'Текстовая область', type: 'textarea', icon: '📄', description: 'Многострочное поле ввода' },
      { id: 'select', name: 'Выпадающий список', type: 'select', icon: '📋', description: 'Список для выбора' }
    ]
  }
];

export function ComponentsPanel({ onAddElement, selectedCategory }: ComponentsPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['basic']);
  const [searchQuery, setSearchQuery] = useState('');

  // Фильтрация компонентов по поиску
  const filteredCategories = componentCategories.map(category => ({
    ...category,
    components: category.components.filter(component =>
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.components.length > 0);

  // Переключение категории
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Обработчик добавления элемента
  const handleAddElement = (elementType: string) => {
    // Добавляем элемент в центр canvas
    onAddElement(elementType, { x: 400, y: 300 });
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Компоненты</h3>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск компонентов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.id} className="border-b border-gray-100">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedCategories.includes(category.id) ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Components */}
            {expandedCategories.includes(category.id) && (
              <div className="pb-2">
                {category.components.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => handleAddElement(component.type)}
                    className="w-full px-6 py-2 flex items-center space-x-3 text-left hover:bg-gray-50 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">
                      {component.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {component.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {component.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Компоненты не найдены</h4>
            <p className="text-gray-500 text-sm">
              Попробуйте изменить поисковый запрос
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          Перетащите компонент на canvas для добавления
        </div>
      </div>
    </div>
  );
}
