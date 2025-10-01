'use client';

import React, { useState, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, Button } from '../ui';

// Типы для блоков конструктора
export interface PageBlock {
  id: string;
  type: string;
  title: string;
  config: any;
  position: { x: number; y: number };
  size: { width: number; height: number };
  children?: PageBlock[];
  parentId?: string;
}

// Типы для категорий
export interface CategoryConfig {
  id: string;
  name: string;
  type: 'main' | 'additional';
  parentId?: string;
  isRequired: boolean;
  pricingRule: 'separate' | 'included' | 'formula';
  pricingFormula?: string;
  displayOrder: number;
  maxItems?: number;
}

// Типы для элементов drag & drop
export interface DragItem {
  type: 'block' | 'category';
  id: string;
  blockType?: string;
  categoryType?: 'main' | 'additional';
}

interface PageBuilderProps {
  onSave: (config: PageBuilderConfig) => void;
  onCancel: () => void;
  initialConfig?: PageBuilderConfig;
}

export interface PageBuilderConfig {
  id: string;
  name: string;
  description: string;
  categories: CategoryConfig[];
  blocks: PageBlock[];
  layout: {
    gridEnabled: boolean;
    snapToGrid: boolean;
    gridSize: number;
  };
  pricing: {
    currency: string;
    showTotal: boolean;
    showBreakdown: boolean;
  };
}

// Компонент блока в конструкторе
const BuilderBlock: React.FC<{
  block: PageBlock;
  onUpdate: (block: PageBlock) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}> = ({ block, onUpdate, onDelete, onSelect, isSelected }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'block',
    item: { type: 'block' as const, id: block.id, blockType: block.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'block',
    drop: (item: DragItem) => {
      if (item.id !== block.id) {
        // Логика перемещения блоков
        console.log(`Moving block ${item.id} to ${block.id}`);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`relative border-2 rounded-lg p-4 cursor-move transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      } ${isDragging ? 'opacity-50' : ''} ${isOver ? 'border-green-500' : ''}`}
      style={{
        position: 'absolute',
        left: block.position.x,
        top: block.position.y,
        width: block.size.width,
        height: block.size.height,
      }}
      onClick={() => onSelect(block.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{block.title}</h3>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(block.id);
            }}
            className="text-gray-400 hover:text-blue-500"
          >
            ⚙️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(block.id);
            }}
            className="text-gray-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        {block.type === 'category-selector' && 'Выбор категории'}
        {block.type === 'product-selector' && 'Выбор товара'}
        {block.type === 'price-calculator' && 'Калькулятор цены'}
        {block.type === 'cart' && 'Корзина'}
        {block.type === 'product-gallery' && 'Галерея товаров'}
      </div>
    </div>
  );
};

// Панель блоков
const BlocksPanel: React.FC<{
  onAddBlock: (type: string) => void;
}> = ({ onAddBlock }) => {
  const blockTypes = [
    { type: 'category-selector', title: 'Выбор категории', icon: '📂', description: 'Основная категория товаров' },
    { type: 'product-selector', title: 'Выбор товара', icon: '🛍️', description: 'Выбор конкретного товара' },
    { type: 'additional-category', title: 'Доп. категория', icon: '➕', description: 'Дополнительные товары' },
    { type: 'price-calculator', title: 'Калькулятор', icon: '💰', description: 'Расчет цены в реальном времени' },
    { type: 'cart', title: 'Корзина', icon: '🛒', description: 'Корзина товаров' },
    { type: 'product-gallery', title: 'Галерея', icon: '🖼️', description: 'Отображение товаров' },
    { type: 'text-block', title: 'Текст', icon: '📝', description: 'Текстовый блок' },
    { type: 'image-block', title: 'Изображение', icon: '🖼️', description: 'Блок с изображением' },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Блоки</h3>
      <div className="space-y-2">
        {blockTypes.map((blockType) => (
          <div
            key={blockType.type}
            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white hover:border-gray-300 transition-colors"
            onClick={() => onAddBlock(blockType.type)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{blockType.icon}</span>
              <div>
                <h4 className="font-medium text-gray-800">{blockType.title}</h4>
                <p className="text-xs text-gray-600">{blockType.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Панель свойств
const PropertiesPanel: React.FC<{
  selectedBlock: PageBlock | null;
  onUpdateBlock: (block: PageBlock) => void;
  categories: CategoryConfig[];
  onUpdateCategories: (categories: CategoryConfig[]) => void;
}> = ({ selectedBlock, onUpdateBlock, categories, onUpdateCategories }) => {
  if (!selectedBlock) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Свойства</h3>
        <p className="text-gray-600">Выберите блок для редактирования свойств</p>
      </div>
    );
  }

  const handleCategoryUpdate = (index: number, updatedCategory: CategoryConfig) => {
    const newCategories = [...categories];
    newCategories[index] = updatedCategory;
    onUpdateCategories(newCategories);
  };

  const addCategory = () => {
    const newCategory: CategoryConfig = {
      id: `cat_${Date.now()}`,
      name: 'Новая категория',
      type: 'additional',
      isRequired: false,
      pricingRule: 'separate',
      displayOrder: categories.length,
    };
    onUpdateCategories([...categories, newCategory]);
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold text-gray-800 mb-4">Свойства</h3>
      
      {/* Настройки блока */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Настройки блока</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Заголовок
            </label>
            <input
              type="text"
              value={selectedBlock.title}
              onChange={(e) => onUpdateBlock({
                ...selectedBlock,
                title: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                X
              </label>
              <input
                type="number"
                value={selectedBlock.position.x}
                onChange={(e) => onUpdateBlock({
                  ...selectedBlock,
                  position: { ...selectedBlock.position, x: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Y
              </label>
              <input
                type="number"
                value={selectedBlock.position.y}
                onChange={(e) => onUpdateBlock({
                  ...selectedBlock,
                  position: { ...selectedBlock.position, y: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Ширина
              </label>
              <input
                type="number"
                value={selectedBlock.size.width}
                onChange={(e) => onUpdateBlock({
                  ...selectedBlock,
                  size: { ...selectedBlock.size, width: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Высота
              </label>
              <input
                type="number"
                value={selectedBlock.size.height}
                onChange={(e) => onUpdateBlock({
                  ...selectedBlock,
                  size: { ...selectedBlock.size, height: parseInt(e.target.value) }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Настройки категорий */}
      {selectedBlock.type === 'category-selector' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700">Категории</h4>
            <button
              onClick={addCategory}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + Добавить
            </button>
          </div>
          
          <div className="space-y-3">
            {categories.map((category, index) => (
              <Card key={category.id} variant="base">
                <div className="p-3">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => handleCategoryUpdate(index, {
                        ...category,
                        name: e.target.value
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <select
                        value={category.type}
                        onChange={(e) => handleCategoryUpdate(index, {
                          ...category,
                          type: e.target.value as 'main' | 'additional'
                        })}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="main">Основная</option>
                        <option value="additional">Дополнительная</option>
                      </select>
                      
                      <select
                        value={category.pricingRule}
                        onChange={(e) => handleCategoryUpdate(index, {
                          ...category,
                          pricingRule: e.target.value as 'separate' | 'included' | 'formula'
                        })}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="separate">Отдельно</option>
                        <option value="included">Включено</option>
                        <option value="formula">Формула</option>
                      </select>
                    </div>
                    
                    {category.pricingRule === 'formula' && (
                      <input
                        type="text"
                        placeholder="Например: base_price * 0.1"
                        value={category.pricingFormula || ''}
                        onChange={(e) => handleCategoryUpdate(index, {
                          ...category,
                          pricingFormula: e.target.value
                        })}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Основной компонент конструктора
const PageBuilder: React.FC<PageBuilderProps> = ({
  onSave,
  onCancel,
  initialConfig
}) => {
  const [config, setConfig] = useState<PageBuilderConfig>(
    initialConfig || {
      id: `config_${Date.now()}`,
      name: 'Новый конфигуратор',
      description: '',
      categories: [],
      blocks: [],
      layout: {
        gridEnabled: true,
        snapToGrid: true,
        gridSize: 20,
      },
      pricing: {
        currency: 'RUB',
        showTotal: true,
        showBreakdown: true,
      },
    }
  );

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedBlock = config.blocks.find(block => block.id === selectedBlockId) || null;

  const addBlock = useCallback((type: string) => {
    const newBlock: PageBlock = {
      id: `block_${Date.now()}`,
      type,
      title: `Новый ${type}`,
      config: {},
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
    };

    setConfig(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));

    setSelectedBlockId(newBlock.id);
  }, []);

  const updateBlock = useCallback((updatedBlock: PageBlock) => {
    setConfig(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    }));
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setConfig(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
    }));
    
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const updateCategories = useCallback((categories: CategoryConfig[]) => {
    setConfig(prev => ({
      ...prev,
      categories
    }));
  }, []);

  const handleSave = () => {
    onSave(config);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-white">
        {/* Заголовок */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Конструктор страниц</h1>
              <p className="text-gray-600">Создание конфигуратора товаров</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={onCancel}>
                Отмена
              </Button>
              <Button variant="primary" onClick={handleSave}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>

        {/* Основная область */}
        <div className="flex-1 flex overflow-hidden">
          {/* Панель блоков */}
          <BlocksPanel onAddBlock={addBlock} />

          {/* Область конструирования */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={canvasRef}
              className="w-full h-full relative bg-gray-100"
              style={{
                backgroundImage: config.layout.gridEnabled
                  ? `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`
                  : 'none',
                backgroundSize: `${config.layout.gridSize}px ${config.layout.gridSize}px`,
              }}
              onClick={() => setSelectedBlockId(null)}
            >
              {config.blocks.map((block) => (
                <BuilderBlock
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  onSelect={setSelectedBlockId}
                  isSelected={block.id === selectedBlockId}
                />
              ))}
            </div>
          </div>

          {/* Панель свойств */}
          <PropertiesPanel
            selectedBlock={selectedBlock}
            onUpdateBlock={updateBlock}
            categories={config.categories}
            onUpdateCategories={updateCategories}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default PageBuilder;

