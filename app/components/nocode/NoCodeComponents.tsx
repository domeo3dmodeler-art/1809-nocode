// components/nocode/NoCodeComponents.tsx
// Базовые компоненты для no-code конструктора

import React, { useState } from 'react';
import { Button, Card, Input, Select } from '../ui';
import UnifiedExportButtons from '../UnifiedExportButtons';

// ===================== Базовые типы =====================

export interface NoCodeComponentProps {
  id: string;
  config: any;
  data?: any;
  onUpdate?: (id: string, data: any) => void;
  className?: string;
}

export interface ComponentRegistry {
  [key: string]: React.ComponentType<NoCodeComponentProps>;
}

// ===================== Компонент селектора стилей =====================

export function StyleSelector({ id, config, data, onUpdate, className }: NoCodeComponentProps) {
  const [selectedStyle, setSelectedStyle] = useState(data?.style || '');

  const handleStyleSelect = (style: string) => {
    setSelectedStyle(style);
    onUpdate?.(id, { ...data, style });
  };

  const styles = config.options || ['Скрытая', 'Современная', 'Неоклассика', 'Классика'];

  return (
    <Card variant="interactive" className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-black">{config.title || 'Выбор стиля'}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {styles.map((style: string) => (
          <button
            key={style}
            onClick={() => handleStyleSelect(style)}
            className={`group overflow-hidden border transition-all duration-200 ${
              selectedStyle === style 
                ? 'border-black ring-2 ring-black' 
                : 'border-black/10 hover:border-black'
            }`}
          >
            <div className="aspect-[1/2] flex items-center justify-center bg-gray-50">
              <div className="w-16 h-28 bg-white border border-black/10 relative">
                <div className="absolute right-1/4 top-1/2 w-4 h-1 bg-black/30"/>
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-medium text-sm leading-tight">{style}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ===================== Компонент селектора моделей =====================

export function ModelSelector({ id, config, data, onUpdate, className }: NoCodeComponentProps) {
  const [selectedModel, setSelectedModel] = useState(data?.model || '');

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    onUpdate?.(id, { ...data, model });
  };

  // Mock данные для демонстрации
  const models = config.models || [
    { id: 'pg-base-1', name: 'PG Base 1', description: 'Современная дверь' },
    { id: 'po-base-1-1', name: 'PO Base 1/1', description: 'Классическая дверь' },
    { id: 'neo-1', name: 'Neo-1', description: 'Неоклассическая дверь' }
  ];

  return (
    <Card variant="interactive" className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-black">{config.title || 'Выбор модели'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model: any) => (
          <button
            key={model.id}
            onClick={() => handleModelSelect(model.id)}
            className={`group overflow-hidden border transition-all duration-200 ${
              selectedModel === model.id 
                ? 'border-black ring-2 ring-black' 
                : 'border-black/10 hover:border-black'
            }`}
          >
            <div className="aspect-[1/2] flex items-center justify-center bg-gray-50">
              <div className="w-16 h-28 bg-white border border-black/10 relative">
                <div className="absolute right-1/4 top-1/2 w-4 h-1 bg-black/30"/>
              </div>
            </div>
            <div className="p-3 text-center">
              <div className="font-medium text-sm leading-tight">{model.name}</div>
              <div className="text-xs text-gray-500 mt-1">{model.description}</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

// ===================== Компонент формы параметров =====================

export function ParametersForm({ id, config, data, onUpdate, className }: NoCodeComponentProps) {
  const [formData, setFormData] = useState(data || {});

  const handleFieldChange = (key: string, value: any) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate?.(id, newData);
  };

  const fields = config.fields || [
    { key: 'finish', label: 'Покрытие', type: 'select', options: ['Ламинат', 'ПВХ', 'Шпон'] },
    { key: 'color', label: 'Цвет', type: 'select', options: ['Белый', 'Дуб', 'Орех'] },
    { key: 'width', label: 'Ширина', type: 'number', min: 600, max: 1000 },
    { key: 'height', label: 'Высота', type: 'number', min: 1900, max: 2200 }
  ];

  return (
    <Card variant="base" className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-black">{config.title || 'Параметры'}</h3>
      <div className="space-y-3">
        {fields.map((field: any) => (
          <div key={field.key}>
            {field.type === 'select' ? (
              <Select
                label={field.label}
                value={formData[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                options={field.options?.map((option: string) => ({ value: option, label: option })) || []}
                placeholder={`Выберите ${field.label.toLowerCase()}`}
              />
            ) : (
              <Input
                label={field.label}
                type={field.type === 'number' ? 'number' : 'text'}
                value={formData[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, field.type === 'number' ? parseInt(e.target.value) : e.target.value)}
                min={field.min}
                max={field.max}
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ===================== Компонент предпросмотра =====================

export function PreviewPanel({ id, config, data, onUpdate, className }: NoCodeComponentProps) {
  const productData = data || {};

  return (
    <Card variant="base" className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-black">{config.title || 'Предпросмотр'}</h3>
      <div className="bg-gray-50 border border-black/10 p-6">
        {config.showImage && (
          <div className="aspect-[1/2] bg-white border border-black/10 mb-4 flex items-center justify-center">
            <div className="w-16 h-28 bg-white border border-black/10 relative">
              <div className="absolute right-1/4 top-1/2 w-4 h-1 bg-black/30"/>
            </div>
          </div>
        )}
        
        {config.showSpecs && (
          <div className="space-y-2 text-sm">
            {productData.style && <div><strong>Стиль:</strong> {productData.style}</div>}
            {productData.model && <div><strong>Модель:</strong> {productData.model}</div>}
            {productData.finish && <div><strong>Покрытие:</strong> {productData.finish}</div>}
            {productData.color && <div><strong>Цвет:</strong> {productData.color}</div>}
            {productData.width && <div><strong>Ширина:</strong> {productData.width} мм</div>}
            {productData.height && <div><strong>Высота:</strong> {productData.height} мм</div>}
          </div>
        )}
        
        {config.showPrice && (
          <div className="mt-4 pt-4 border-t border-black/10">
            <div className="text-lg font-semibold text-black">
              Цена: {productData.price ? `${productData.price} ₽` : 'Рассчитывается'}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ===================== Компонент корзины =====================

export function CartPanel({ id, config, data, onUpdate, className }: NoCodeComponentProps) {
  const [cart, setCart] = useState(data?.cart || []);

  const addToCart = () => {
    const newItem = {
      id: Date.now().toString(),
      ...data,
      qty: 1,
      unitPrice: 15000
    };
    const newCart = [...cart, newItem];
    setCart(newCart);
    onUpdate?.(id, { ...data, cart: newCart });
  };

  const removeFromCart = (itemId: string) => {
    const newCart = cart.filter((item: any) => item.id !== itemId);
    setCart(newCart);
    onUpdate?.(id, { ...data, cart: newCart });
  };

  const total = cart.reduce((sum: number, item: any) => sum + (item.unitPrice * item.qty), 0);

  return (
    <Card variant="base" className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-black">{config.title || 'Корзина'}</h3>
      
      <div className="bg-gray-50 border border-black/10 p-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Корзина пуста
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-black/10">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.style} {item.model}</div>
                  <div className="text-xs text-gray-500">
                    {item.width}×{item.height} мм, {item.finish} {item.color}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.unitPrice.toLocaleString()} ₽</span>
                  {config.allowEdit && (
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {config.showTotal && (
              <div className="pt-3 border-t border-black/10">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-black">Итого:</span>
                  <span className="font-semibold text-black">{total.toLocaleString()} ₽</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 space-y-2">
          <Button
            onClick={addToCart}
            disabled={!data?.style || !data?.model}
            className="w-full"
          >
            Добавить в корзину
          </Button>
          
          {cart.length > 0 && config.exportOptions && (
            <UnifiedExportButtons
              getCart={() => cart.map((item: any) => ({
                productId: parseInt(item.id),
                qty: item.qty,
                model: item.model,
                width: item.width,
                height: item.height,
                color: item.color,
                finish: item.finish,
                type: item.type
              }))}
              compact={true}
              className="w-full"
            />
          )}
        </div>
      </div>
    </Card>
  );
}

// ===================== Реестр компонентов =====================

export const componentRegistry: ComponentRegistry = {
  'style-selector': StyleSelector,
  'model-selector': ModelSelector,
  'parameters-form': ParametersForm,
  'preview-panel': PreviewPanel,
  'cart-panel': CartPanel,
};

// ===================== Универсальный рендерер =====================

export function NoCodeComponentRenderer({ 
  type, 
  id, 
  config, 
  data, 
  onUpdate, 
  className 
}: {
  type: string;
  id: string;
  config: any;
  data?: any;
  onUpdate?: (id: string, data: any) => void;
  className?: string;
}) {
  const Component = componentRegistry[type];
  
  if (!Component) {
    return (
      <div className={`p-4 border border-red-200 bg-red-50 text-red-700 ${className}`}>
        Компонент "{type}" не найден
      </div>
    );
  }

  return (
    <Component
      id={id}
      config={config}
      data={data}
      onUpdate={onUpdate}
      className={className}
    />
  );
}
