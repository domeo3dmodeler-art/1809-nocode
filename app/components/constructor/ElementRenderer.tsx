'use client';

import React, { useState, useRef } from 'react';
import { ConstructorElement } from './types';
import { useConstructor } from './ConstructorContext';
import { Button } from '../ui';
import { Move, RotateCcw, RotateCw, GripVertical } from 'lucide-react';

interface ElementRendererProps {
  element: ConstructorElement;
  isSelected?: boolean;
}

const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isSelected = false }) => {
  const { selectElement, updateElement, moveElement } = useConstructor();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== elementRef.current) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    });
    selectElement(element.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    moveElement(element.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Рендер компонента в зависимости от типа
  const renderComponent = () => {
    switch (element.component) {
      case 'TextBlock':
        return (
          <div 
            style={{ 
              fontSize: element.props.fontSize, 
              color: element.props.color,
              ...element.styles 
            }}
          >
            {element.props.content || 'Напишите ваш текст здесь'}
          </div>
        );
        
      case 'ImageBlock':
        return (
          <img 
            src={element.props.src || '/placeholder.jpg'} 
            alt={element.props.alt || 'Изображение'} 
            style={{ 
              width: element.props.width || '100%', 
              height: element.props.height || 'auto',
              ...element.styles 
            }}
            className="object-cover"
          />
        );
        
      case 'ProductGridBlock':
        return (
          <div 
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            style={element.styles}
          >
            <div className="text-sm font-medium text-blue-800 mb-2">
              Сетка товаров ({element.props.columns || 3} колонки)
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${element.props.columns || 3}, 1fr)` }}>
              {Array.from({ length: element.props.columns || 3 }).map((_, i) => (
                <div key={i} className="bg-white p-2 rounded border text-xs text-gray-600">
                  Товар {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'ProductFilterBlock':
        return (
          <div 
            className="p-4 bg-green-50 border border-green-200 rounded-lg"
            style={element.styles}
          >
            <div className="text-sm font-medium text-green-800 mb-2">Фильтры товаров</div>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border text-xs">Фильтр по цене</div>
              <div className="bg-white p-2 rounded border text-xs">Фильтр по бренду</div>
              <div className="bg-white p-2 rounded border text-xs">Фильтр по размеру</div>
            </div>
          </div>
        );
        
      case 'ProductCartBlock':
        return (
          <div 
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
            style={element.styles}
          >
            <div className="text-sm font-medium text-purple-800 mb-2">Корзина</div>
            <div className="bg-white p-2 rounded border text-xs text-gray-600">
              Товары в корзине: 0
            </div>
          </div>
        );
        
      case 'ProductComparisonBlock':
        return (
          <div 
            className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
            style={element.styles}
          >
            <div className="text-sm font-medium text-orange-800 mb-2">
              Сравнение товаров (макс. {element.props.maxItems || 3})
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${element.props.maxItems || 3}, 1fr)` }}>
              {Array.from({ length: element.props.maxItems || 3 }).map((_, i) => (
                <div key={i} className="bg-white p-2 rounded border text-xs text-gray-600">
                  Товар {i + 1}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'PriceCalculatorBlock':
        return (
          <div 
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            style={element.styles}
          >
            <div className="text-sm font-medium text-yellow-800 mb-2">Калькулятор цен</div>
            <div className="space-y-2">
              <div className="bg-white p-2 rounded border text-xs">Базовая цена: 1000 ₽</div>
              <div className="bg-white p-2 rounded border text-xs">Дополнительные опции: +200 ₽</div>
              <div className="bg-white p-2 rounded border text-xs">Скидка: -100 ₽</div>
              <div className="text-sm font-medium text-yellow-800">Итого: 1100 ₽</div>
            </div>
          </div>
        );
        
      case 'ButtonBlock':
        return (
          <button 
            className={`px-4 py-2 rounded font-medium transition-colors ${
              element.props.variant === 'primary' 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            style={element.styles}
          >
            {element.props.text || 'Кнопка'}
          </button>
        );
        
      case 'FormBlock':
        return (
          <div 
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
            style={element.styles}
          >
            <div className="text-sm font-medium text-gray-800 mb-2">Форма</div>
            <div className="space-y-2">
              <input className="w-full p-2 border rounded text-xs" placeholder="Поле ввода" />
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-xs">Отправить</button>
            </div>
          </div>
        );
        
      case 'SpacerBlock':
        return (
          <div 
            style={{ height: element.props.height || '20px' }}
            className="bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500"
          >
            Spacer
          </div>
        );
        
      case 'DividerBlock':
        return (
          <hr 
            className={`border-t ${
              element.props.style === 'dashed' 
                ? 'border-dashed' 
                : element.props.style === 'dotted' 
                ? 'border-dotted' 
                : 'border-solid'
            }`}
            style={{ 
              borderColor: element.props.color || '#e5e7eb',
              ...element.styles 
            }}
          />
        );
        
      case 'RowBlock':
        return (
          <div 
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            style={{ 
              display: 'grid',
              gridTemplateColumns: `repeat(${element.props.columns || 2}, 1fr)`,
              gap: element.props.gap || '20px',
              ...element.styles 
            }}
          >
            {element.children?.map(child => (
              <ElementRenderer key={child.id} element={child} />
            ))}
          </div>
        );
        
      case 'ColumnBlock':
        return (
          <div 
            className="p-4 bg-green-50 border border-green-200 rounded-lg"
            style={{ 
              width: element.props.width || '50%',
              ...element.styles 
            }}
          >
            {element.children?.map(child => (
              <ElementRenderer key={child.id} element={child} />
            ))}
          </div>
        );
        
      case 'ContainerBlock':
        return (
          <div 
            style={{ 
              backgroundColor: element.props.backgroundColor || '#f8f9fa', 
              padding: element.props.padding || '20px',
              border: isSelected ? '2px dashed #3b82f6' : '1px dashed #d1d5db',
              borderRadius: '8px',
              minHeight: '100px',
              ...element.styles 
            }}
          >
            {element.children && element.children.length > 0 ? (
              element.children.map(child => (
                <ElementRenderer key={child.id} element={child} />
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                Перетащите элементы сюда
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div 
            className="p-4 bg-gray-100 border border-gray-300 rounded-lg"
            style={element.styles}
          >
            <div className="text-sm text-gray-600">
              Неизвестный блок: {element.component}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        cursor: isSelected ? 'move' : 'pointer',
        zIndex: isSelected ? 10 : 1,
      }}
      className={`group ${isDragging ? 'z-50' : ''}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Основной контент */}
      <div className="relative">
        {renderComponent()}
        
        {/* Индикаторы выделения */}
        {isSelected && (
          <>
            {/* Рамка выделения */}
            <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none rounded" />
            
            {/* Угловые маркеры для изменения размера */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full pointer-events-none" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full pointer-events-none" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full pointer-events-none" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full pointer-events-none" />
            
            {/* Панель инструментов */}
            <div className="absolute -top-10 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Переместить"
              >
                <Move className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Повернуть влево"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                title="Повернуть вправо"
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Информация об элементе */}
            <div className="absolute -bottom-8 left-0 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {element.component} ({element.size.width} × {element.size.height})
            </div>
          </>
        )}
        
        {/* Индикатор для невыбранных элементов */}
        {!isSelected && (
          <div className="absolute inset-0 border border-transparent group-hover:border-blue-300 pointer-events-none rounded transition-colors" />
        )}
      </div>
    </div>
  );
};

export default ElementRenderer;
