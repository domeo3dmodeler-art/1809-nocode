'use client';

import React, { useState, useEffect } from 'react';
import { PropertiesPanelProps, BaseElement, Page, Spacing, Style } from '../types';

export function PropertiesPanel({ element, page, onUpdateElement, onUpdatePage }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout' | 'page'>('content');
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Загрузка категорий каталога
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('/api/catalog/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Обработчики для элемента
  const handleElementPropChange = (key: string, value: any) => {
    if (!element) return;
    
    onUpdateElement(element.id, {
      props: {
        ...element.props,
        [key]: value
      }
    });
  };

  const handleElementStyleChange = (key: keyof Style, value: any) => {
    if (!element) return;
    
    onUpdateElement(element.id, {
      style: {
        ...element.style,
        [key]: value
      }
    });
  };

  const handleElementPositionChange = (key: 'x' | 'y', value: number) => {
    if (!element) return;
    
    onUpdateElement(element.id, {
      position: {
        ...element.position,
        [key]: value
      }
    });
  };

  const handleElementSizeChange = (key: 'width' | 'height', value: number) => {
    if (!element) return;
    
    onUpdateElement(element.id, {
      size: {
        ...element.size,
        [key]: value
      }
    });
  };

  const handleSpacingChange = (spacingType: 'padding' | 'margin', key: keyof Spacing, value: number) => {
    if (!element) return;
    
    onUpdateElement(element.id, {
      style: {
        ...element.style,
        [spacingType]: {
          ...element.style[spacingType],
          [key]: value
        }
      }
    });
  };

  // Обработчики для страницы
  const handlePageSettingChange = (key: string, value: any) => {
    if (!page) return;
    
    onUpdatePage({
      settings: {
        ...page.settings,
        [key]: value
      }
    });
  };

  // Рендеринг вкладки содержимого
  const renderContentTab = () => {
    if (!element) return null;

    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Содержимое
              </label>
              <textarea
                value={element.props.content || ''}
                onChange={(e) => handleElementPropChange('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Размер шрифта
              </label>
              <input
                type="number"
                value={element.props.fontSize || 16}
                onChange={(e) => handleElementPropChange('fontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цвет текста
              </label>
              <input
                type="color"
                value={element.props.color || '#1f2937'}
                onChange={(e) => handleElementPropChange('color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Содержимое
              </label>
              <input
                type="text"
                value={element.props.content || ''}
                onChange={(e) => handleElementPropChange('content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Уровень заголовка
              </label>
              <select
                value={element.props.level || 1}
                onChange={(e) => handleElementPropChange('level', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL изображения
              </label>
              <input
                type="url"
                value={element.props.src || ''}
                onChange={(e) => handleElementPropChange('src', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt текст
              </label>
              <input
                type="text"
                value={element.props.alt || ''}
                onChange={(e) => handleElementPropChange('alt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Текст кнопки
              </label>
              <input
                type="text"
                value={element.props.text || ''}
                onChange={(e) => handleElementPropChange('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Вариант
              </label>
              <select
                value={element.props.variant || 'primary'}
                onChange={(e) => handleElementPropChange('variant', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="primary">Основная</option>
                <option value="secondary">Вторичная</option>
                <option value="outline">Контурная</option>
              </select>
            </div>
          </div>
        );

            case 'productConfigurator':
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категории товаров
                    </label>
                    {loadingCategories ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="text-sm text-gray-500">Загрузка категорий...</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={element.props.categoryIds?.includes(category.id) || false}
                              onChange={(e) => {
                                const currentIds = element.props.categoryIds || [];
                                const newIds = e.target.checked
                                  ? [...currentIds, category.id]
                                  : currentIds.filter(id => id !== category.id);
                                handleElementPropChange('categoryIds', newIds);
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                            <span className="text-xs text-gray-400">({category.id})</span>
                          </label>
                        ))}
                        {categories.length === 0 && (
                          <div className="text-sm text-gray-500">Нет доступных категорий</div>
                        )}
                      </div>
                    )}
                  </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.props.showFilters || false}
                  onChange={(e) => handleElementPropChange('showFilters', e.target.checked)}
                  className="mr-2"
                />
                Показывать фильтры
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.props.showGrid || false}
                  onChange={(e) => handleElementPropChange('showGrid', e.target.checked)}
                  className="mr-2"
                />
                Показывать сетку товаров
              </label>
            </div>
          </div>
        );

            case 'productGrid':
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категории товаров
                    </label>
                    {loadingCategories ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="text-sm text-gray-500">Загрузка категорий...</div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={element.props.categoryIds?.includes(category.id) || false}
                              onChange={(e) => {
                                const currentIds = element.props.categoryIds || [];
                                const newIds = e.target.checked
                                  ? [...currentIds, category.id]
                                  : currentIds.filter(id => id !== category.id);
                                handleElementPropChange('categoryIds', newIds);
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                        {categories.length === 0 && (
                          <div className="text-sm text-gray-500">Нет доступных категорий</div>
                        )}
                      </div>
                    )}
                  </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Лимит товаров
                </label>
                <input
                  type="number"
                  value={element.props.limit || 12}
                  onChange={(e) => handleElementPropChange('limit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Колонки
                </label>
                <input
                  type="number"
                  value={element.props.columns || 3}
                  onChange={(e) => handleElementPropChange('columns', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="6"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.props.showPrice || false}
                  onChange={(e) => handleElementPropChange('showPrice', e.target.checked)}
                  className="mr-2"
                />
                Показывать цену
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.props.showDescription || false}
                  onChange={(e) => handleElementPropChange('showDescription', e.target.checked)}
                  className="mr-2"
                />
                Показывать описание
              </label>
            </div>
          </div>
        );

            case 'priceCalculator':
              return (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категории товаров
                    </label>
                    {loadingCategories ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="text-sm text-gray-500">Загрузка категорий...</div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={element.props.categoryIds?.includes(category.id) || false}
                              onChange={(e) => {
                                const currentIds = element.props.categoryIds || [];
                                const newIds = e.target.checked
                                  ? [...currentIds, category.id]
                                  : currentIds.filter(id => id !== category.id);
                                handleElementPropChange('categoryIds', newIds);
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{category.name}</span>
                          </label>
                        ))}
                        {categories.length === 0 && (
                          <div className="text-sm text-gray-500">Нет доступных категорий</div>
                        )}
                      </div>
                    )}
                  </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.props.showBreakdown || false}
                  onChange={(e) => handleElementPropChange('showBreakdown', e.target.checked)}
                  className="mr-2"
                />
                Показывать детализацию цены
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={element.props.showCurrency || false}
                  onChange={(e) => handleElementPropChange('showCurrency', e.target.checked)}
                  className="mr-2"
                />
                Показывать валюту
              </label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">⚙️</div>
            <p>Настройки для этого элемента недоступны</p>
          </div>
        );
    }
  };

  // Рендеринг вкладки стилей
  const renderStyleTab = () => {
    if (!element) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фоновый цвет
          </label>
          <input
            type="color"
            value={element.style.backgroundColor || '#ffffff'}
            onChange={(e) => handleElementStyleChange('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цвет границы
          </label>
          <input
            type="color"
            value={element.style.borderColor || '#000000'}
            onChange={(e) => handleElementStyleChange('borderColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Толщина границы
          </label>
          <input
            type="number"
            value={element.style.borderWidth || 0}
            onChange={(e) => handleElementStyleChange('borderWidth', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Скругление углов
          </label>
          <input
            type="number"
            value={element.style.borderRadius || 0}
            onChange={(e) => handleElementStyleChange('borderRadius', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Прозрачность
          </label>
          <input
            type="range"
            value={element.style.opacity || 1}
            onChange={(e) => handleElementStyleChange('opacity', parseFloat(e.target.value))}
            className="w-full"
            min="0"
            max="1"
            step="0.1"
          />
          <div className="text-xs text-gray-500 text-center">
            {Math.round((element.style.opacity || 1) * 100)}%
          </div>
        </div>
      </div>
    );
  };

  // Рендеринг вкладки макета
  const renderLayoutTab = () => {
    if (!element) return null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              X
            </label>
            <input
              type="number"
              value={element.position.x}
              onChange={(e) => handleElementPositionChange('x', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Y
            </label>
            <input
              type="number"
              value={element.position.y}
              onChange={(e) => handleElementPositionChange('y', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ширина
            </label>
            <input
              type="number"
              value={element.size.width}
              onChange={(e) => handleElementSizeChange('width', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={element.constraints.minWidth}
              max={element.constraints.maxWidth}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Высота
            </label>
            <input
              type="number"
              value={element.size.height}
              onChange={(e) => handleElementSizeChange('height', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min={element.constraints.minHeight}
              max={element.constraints.maxHeight}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Отступы</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Верх</label>
              <input
                type="number"
                value={element.style.padding?.top || 0}
                onChange={(e) => handleSpacingChange('padding', 'top', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Право</label>
              <input
                type="number"
                value={element.style.padding?.right || 0}
                onChange={(e) => handleSpacingChange('padding', 'right', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Низ</label>
              <input
                type="number"
                value={element.style.padding?.bottom || 0}
                onChange={(e) => handleSpacingChange('padding', 'bottom', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Лево</label>
              <input
                type="number"
                value={element.style.padding?.left || 0}
                onChange={(e) => handleSpacingChange('padding', 'left', parseInt(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Рендеринг вкладки страницы
  const renderPageTab = () => {
    if (!page) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название страницы
          </label>
          <input
            type="text"
            value={page.name}
            onChange={(e) => onUpdatePage({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фоновый цвет страницы
          </label>
          <input
            type="color"
            value={page.settings.backgroundColor}
            onChange={(e) => handlePageSettingChange('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ширина
            </label>
            <input
              type="number"
              value={page.settings.width}
              onChange={(e) => handlePageSettingChange('width', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Высота
            </label>
            <input
              type="number"
              value={page.settings.height}
              onChange={(e) => handlePageSettingChange('height', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {element ? 'Свойства элемента' : 'Свойства страницы'}
        </h3>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {element && (
            <>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-2 py-2 text-xs font-medium ${
                  activeTab === 'content'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Контент
              </button>
              <button
                onClick={() => setActiveTab('style')}
                className={`px-2 py-2 text-xs font-medium ${
                  activeTab === 'style'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Стили
              </button>
              <button
                onClick={() => setActiveTab('layout')}
                className={`px-2 py-2 text-xs font-medium ${
                  activeTab === 'layout'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Макет
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('page')}
            className={`px-2 py-2 text-xs font-medium ${
              activeTab === 'page'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Страница
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'layout' && renderLayoutTab()}
        {activeTab === 'page' && renderPageTab()}
      </div>
    </div>
  );
}
