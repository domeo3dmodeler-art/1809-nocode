'use client';

import React, { useState, useRef } from 'react';
import { BaseElement, ElementRendererProps, Size } from '../types';
import { SelectionOverlay } from './SelectionOverlay';

interface ExtendedElementRendererProps extends ElementRendererProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onResize: (newSize: Size) => void;
}

export function ElementRenderer({
  element,
  isSelected,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onMouseDown,
  onResize
}: ExtendedElementRendererProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const elementRef = useRef<HTMLDivElement>(null);

  // Обработчик двойного клика для редактирования
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (element.type === 'text' || element.type === 'heading') {
      e.stopPropagation();
      setIsEditing(true);
      setEditValue(element.props.content || '');
    }
  };

  // Обработчик завершения редактирования
  const handleEditComplete = () => {
    if (isEditing) {
      onUpdate({
        props: {
          ...element.props,
          content: editValue
        }
      });
      setIsEditing(false);
    }
  };

  // Обработчик изменения размера
  const handleResize = (direction: string, deltaX: number, deltaY: number) => {
    const newSize = { ...element.size };
    
    switch (direction) {
      case 'nw':
        newSize.width = Math.max(element.constraints.minWidth, element.size.width - deltaX);
        newSize.height = Math.max(element.constraints.minHeight, element.size.height - deltaY);
        break;
      case 'ne':
        newSize.width = Math.max(element.constraints.minWidth, element.size.width + deltaX);
        newSize.height = Math.max(element.constraints.minHeight, element.size.height - deltaY);
        break;
      case 'sw':
        newSize.width = Math.max(element.constraints.minWidth, element.size.width - deltaX);
        newSize.height = Math.max(element.constraints.minHeight, element.size.height + deltaY);
        break;
      case 'se':
        newSize.width = Math.max(element.constraints.minWidth, element.size.width + deltaX);
        newSize.height = Math.max(element.constraints.minHeight, element.size.height + deltaY);
        break;
      case 'n':
        newSize.height = Math.max(element.constraints.minHeight, element.size.height - deltaY);
        break;
      case 's':
        newSize.height = Math.max(element.constraints.minHeight, element.size.height + deltaY);
        break;
      case 'w':
        newSize.width = Math.max(element.constraints.minWidth, element.size.width - deltaX);
        break;
      case 'e':
        newSize.width = Math.max(element.constraints.minWidth, element.size.width + deltaX);
        break;
    }

    onResize(newSize);
  };

  // Рендеринг содержимого элемента
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        if (isEditing) {
          return (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditComplete();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditValue(element.props.content || '');
                }
              }}
              className="w-full h-full bg-transparent border-none outline-none resize-none"
              autoFocus
            />
          );
        }
        return (
          <span
            style={{
              fontSize: element.props.fontSize || 16,
              color: element.props.color || '#1f2937',
              fontWeight: element.props.fontWeight || 'normal'
            }}
          >
            {element.props.content || 'Текст'}
          </span>
        );

      case 'heading':
        if (isEditing) {
          return (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditComplete}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditComplete();
                } else if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditValue(element.props.content || '');
                }
              }}
              className="w-full h-full bg-transparent border-none outline-none resize-none"
              autoFocus
            />
          );
        }
        const HeadingTag = `h${element.props.level || 1}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            style={{
              fontSize: element.props.fontSize || 24,
              color: element.props.color || '#1f2937',
              fontWeight: element.props.fontWeight || 'bold',
              margin: 0,
              padding: 0
            }}
          >
            {element.props.content || 'Заголовок'}
          </HeadingTag>
        );

      case 'image':
        return (
          <img
            src={element.props.src || '/placeholder-image.jpg'}
            alt={element.props.alt || 'Изображение'}
            className="w-full h-full object-cover"
            style={{ borderRadius: element.style.borderRadius || 0 }}
          />
        );

      case 'button':
        return (
          <button
            className={`px-4 py-2 rounded ${
              element.props.variant === 'primary'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            style={{
              fontSize: element.props.size === 'small' ? 14 : element.props.size === 'large' ? 18 : 16
            }}
          >
            {element.props.text || 'Кнопка'}
          </button>
        );

      case 'container':
        return (
          <div className="w-full h-full">
            {element.props.children?.map((child: BaseElement) => (
              <ElementRenderer
                key={child.id}
                element={child}
                isSelected={false}
                zoom={zoom}
                onSelect={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
                onMouseDown={() => {}}
                onResize={() => {}}
              />
            ))}
          </div>
        );

           case 'productConfigurator':
             return (
               <div className="w-full h-full bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
                 <div className="text-center text-gray-500">
                   <div className="text-2xl mb-2">⚙️</div>
                   <div className="text-sm">Конфигуратор товаров</div>
                   <div className="text-xs text-gray-400 mt-1">
                     {element.props.categoryIds?.length > 0
                       ? `${element.props.categoryIds.length} категорий`
                       : 'Настройте категории'
                     }
                   </div>
                   {element.props.categoryIds?.length > 0 && (
                     <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                       <div className="font-medium text-blue-800">Подключенные категории:</div>
                       <div className="text-blue-600 mt-1">
                         {element.props.categoryIds.join(', ')}
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             );

      case 'productGrid':
        return (
          <div className="w-full h-full bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm">Сетка товаров</div>
              <div className="text-xs text-gray-400 mt-1">
                {element.props.limit || 12} товаров
              </div>
            </div>
          </div>
        );

      case 'priceCalculator':
        return (
          <div className="w-full h-full bg-white border border-gray-200 rounded-lg p-4 overflow-auto">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm">Калькулятор цены</div>
              <div className="text-xs text-gray-400 mt-1">
                {element.props.showBreakdown ? 'С детализацией' : 'Простой расчет'}
              </div>
            </div>
          </div>
        );

      case 'cart':
        return (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🛒</div>
              <div className="text-sm">Корзина</div>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm">{element.type}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${isSelected ? 'z-10' : 'z-0'}`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        height: element.size.height,
        backgroundColor: element.style.backgroundColor || 'transparent',
        borderColor: element.style.borderColor || 'transparent',
        borderWidth: element.style.borderWidth || 0,
        borderStyle: 'solid',
        borderRadius: element.style.borderRadius || 0,
        padding: `${element.style.padding?.top || 8}px ${element.style.padding?.right || 8}px ${element.style.padding?.bottom || 8}px ${element.style.padding?.left || 8}px`,
        margin: `${element.style.margin?.top || 0}px ${element.style.margin?.right || 0}px ${element.style.margin?.bottom || 0}px ${element.style.margin?.left || 0}px`,
        opacity: element.style.opacity || 1,
        zIndex: element.style.zIndex || 1,
        cursor: isSelected ? 'move' : 'pointer'
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderContent()}

      {/* Selection Overlay */}
      {isSelected && (
        <SelectionOverlay
          element={element}
          onDelete={onDelete}
          onResize={handleResize}
        />
      )}
    </div>
  );
}
