'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import SimpleConstructor from '@/components/constructor/SimpleConstructor';

export default function SimpleConstructorTestPage() {
  const [showConstructor, setShowConstructor] = useState(false);

  if (showConstructor) {
    return <SimpleConstructor />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            🎨 Ультимативный конструктор страниц
          </h1>
          <p className="text-gray-600 mb-6">
            Профессиональный уровень с полным Drag & Drop и настройкой размеров блоков
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">🎯 Drag & Drop:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Перетаскивание блоков из палитры</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Перемещение блоков на холсте</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Изменение размеров ручками</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Визуальная обратная связь</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">🖼️ Настройки изображений:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Размеры (маленький/средний/большой)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Пропорции (квадрат/горизонтальный)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Обрезка и масштабирование</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Скругление углов</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Пример настройки:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Блок:</strong> "Каталог товаров"</p>
              <p><strong>Назначение:</strong> Отображение межкомнатных дверей</p>
              <p><strong>Ширина:</strong> 75% (3/4 экрана)</p>
              <p><strong>Изображения:</strong> Средний размер, квадратные</p>
              <p><strong>Фильтры:</strong> Цвет, материал, размер</p>
            </div>
          </div>

          <Button 
            onClick={() => setShowConstructor(true)}
            className="w-full"
            size="lg"
          >
            🎨 Запустить ультимативный конструктор
          </Button>

          <div className="mt-4 text-xs text-gray-500">
            <p>Доступные блоки: Каталог товаров • Карточка товара • Конструктор • Корзина • Текст • Изображения • Фильтры</p>
          </div>
        </div>
      </div>
    </div>
  );
}
