'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import AdvancedConstructor from '@/components/constructor/AdvancedConstructor';

export default function AdvancedConstructorTestPage() {
  const [showConstructor, setShowConstructor] = useState(false);

  if (showConstructor) {
    return <AdvancedConstructor />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Продвинутый конструктор конфигуратора
          </h1>
          <p className="text-gray-600 mb-6">
            Создавайте сложные страницы конфигуратора с настройкой связей между категориями
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">🎯 Основные возможности:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Настройка ширины блоков (25%, 50%, 100%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Расположение блоков подряд</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Товары из нескольких категорий</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Связи между категориями</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">🛒 Корзина и цены:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Комбинированное ценообразование</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Отдельные строки для товаров</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Настройка отображения корзины</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500">✅</span>
                  <span>Группировка по категориям</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Пример настройки:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Основная категория:</strong> Межкомнатные двери</p>
              <p><strong>Дополнительная:</strong> Дверные ручки (отдельная строка)</p>
              <p><strong>Обязательная:</strong> Комплект фурнитуры (+ к цене двери)</p>
            </div>
          </div>

          <Button 
            onClick={() => setShowConstructor(true)}
            className="w-full"
            size="lg"
          >
            🚀 Запустить продвинутый конструктор
          </Button>

          <div className="mt-4 text-xs text-gray-500">
            <p>Доступные настройки: Связи категорий • Макет блоков • Отображение корзины • Ценообразование</p>
          </div>
        </div>
      </div>
    </div>
  );
}




