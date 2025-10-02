'use client';

import React, { useState, useEffect } from 'react';
import UniversalCalculatorBuilder from '@/components/calculator/UniversalCalculatorBuilder';
import CalculatorRuntime from '@/components/calculator/CalculatorRuntime';
import { Calculator, Zap, Rocket, Star, ArrowRight, Play, Code, Eye } from 'lucide-react';

// Примеры готовых калькуляторов
const EXAMPLE_CALCULATORS = [
  {
    id: 'mortgage',
    name: 'Калькулятор ипотеки',
    description: 'Расчет ежемесячного платежа по ипотечному кредиту',
    category: 'Финансы',
    icon: '🏠',
    config: {
      id: 'mortgage_calc',
      name: 'Калькулятор ипотеки',
      description: 'Рассчитайте ежемесячный платеж по ипотечному кредиту',
      elements: [
        {
          id: 'loan_amount',
          type: 'input',
          name: 'Сумма кредита',
          label: 'Сумма кредита (₽)',
          position: { x: 20, y: 20 },
          size: { width: 300, height: 40 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, fontSize: 14, padding: 8 },
          config: { inputType: 'number', placeholder: '3000000', required: true, min: 100000 }
        },
        {
          id: 'interest_rate',
          type: 'slider',
          name: 'Процентная ставка',
          label: 'Процентная ставка (%)',
          position: { x: 20, y: 80 },
          size: { width: 300, height: 60 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, fontSize: 14, padding: 8 },
          config: { min: 1, max: 30, step: 0.1 }
        },
        {
          id: 'loan_term',
          type: 'select',
          name: 'Срок кредита',
          label: 'Срок кредита',
          position: { x: 20, y: 160 },
          size: { width: 300, height: 40 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, fontSize: 14, padding: 8 },
          config: {
            options: [
              { value: 5, label: '5 лет' },
              { value: 10, label: '10 лет' },
              { value: 15, label: '15 лет' },
              { value: 20, label: '20 лет' },
              { value: 25, label: '25 лет' },
              { value: 30, label: '30 лет' }
            ]
          }
        },
        {
          id: 'monthly_payment',
          type: 'output',
          name: 'Ежемесячный платеж',
          label: 'Ежемесячный платеж (₽)',
          position: { x: 20, y: 220 },
          size: { width: 300, height: 60 },
          styles: { backgroundColor: '#f0f9ff', textColor: '#1e40af', borderRadius: 4, fontSize: 16, padding: 12 },
          config: { formula: 'pmt(interest_rate/100/12, loan_term*12, loan_amount)' }
        }
      ],
      variables: [
        { id: 'loan_amount', name: 'Сумма кредита', type: 'number', defaultValue: 3000000 },
        { id: 'interest_rate', name: 'Процентная ставка', type: 'number', defaultValue: 8.5 },
        { id: 'loan_term', name: 'Срок кредита', type: 'number', defaultValue: 20 }
      ],
      formulas: [
        {
          id: 'monthly_payment',
          name: 'Ежемесячный платеж',
          expression: 'pmt(interest_rate/100/12, loan_term*12, loan_amount)'
        }
      ]
    }
  },
  {
    id: 'doors_price',
    name: 'Калькулятор стоимости дверей',
    description: 'Расчет стоимости межкомнатных дверей с учетом всех опций',
    category: 'Товары',
    icon: '🚪',
    config: {
      id: 'doors_calc',
      name: 'Калькулятор стоимости дверей',
      description: 'Рассчитайте стоимость межкомнатных дверей',
      elements: [
        {
          id: 'door_type',
          type: 'select',
          name: 'Тип двери',
          label: 'Тип двери',
          position: { x: 20, y: 20 },
          size: { width: 300, height: 40 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, fontSize: 14, padding: 8 },
          config: {
            options: [
              { value: 15000, label: 'Стандартная дверь - 15,000₽' },
              { value: 25000, label: 'Премиум дверь - 25,000₽' },
              { value: 35000, label: 'Люкс дверь - 35,000₽' }
            ]
          }
        },
        {
          id: 'quantity',
          type: 'input',
          name: 'Количество',
          label: 'Количество дверей',
          position: { x: 20, y: 80 },
          size: { width: 300, height: 40 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, fontSize: 14, padding: 8 },
          config: { inputType: 'number', placeholder: '1', min: 1, defaultValue: 1 }
        },
        {
          id: 'installation',
          type: 'checkbox',
          name: 'Установка',
          label: 'Установка (+3,000₽ за дверь)',
          position: { x: 20, y: 140 },
          size: { width: 300, height: 30 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', fontSize: 14 },
          config: {}
        },
        {
          id: 'delivery',
          type: 'checkbox',
          name: 'Доставка',
          label: 'Доставка (+1,500₽)',
          position: { x: 20, y: 180 },
          size: { width: 300, height: 30 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', fontSize: 14 },
          config: {}
        },
        {
          id: 'total_price',
          type: 'output',
          name: 'Общая стоимость',
          label: 'Общая стоимость (₽)',
          position: { x: 20, y: 230 },
          size: { width: 300, height: 60 },
          styles: { backgroundColor: '#f0fdf4', textColor: '#166534', borderRadius: 4, fontSize: 18, padding: 12 },
          config: { formula: 'door_type * quantity + if(installation, 3000 * quantity, 0) + if(delivery, 1500, 0)' }
        }
      ],
      variables: [
        { id: 'door_type', name: 'Тип двери', type: 'number', defaultValue: 15000 },
        { id: 'quantity', name: 'Количество', type: 'number', defaultValue: 1 },
        { id: 'installation', name: 'Установка', type: 'boolean', defaultValue: false },
        { id: 'delivery', name: 'Доставка', type: 'boolean', defaultValue: false }
      ],
      formulas: [
        {
          id: 'total_price',
          name: 'Общая стоимость',
          expression: 'door_type * quantity + if(installation, 3000 * quantity, 0) + if(delivery, 1500, 0)'
        }
      ]
    }
  },
  {
    id: 'bmi',
    name: 'Калькулятор ИМТ',
    description: 'Расчет индекса массы тела и рекомендации',
    category: 'Здоровье',
    icon: '⚖️',
    config: {
      id: 'bmi_calc',
      name: 'Калькулятор ИМТ',
      description: 'Рассчитайте ваш индекс массы тела',
      elements: [
        {
          id: 'weight',
          type: 'input',
          name: 'Вес',
          label: 'Вес (кг)',
          position: { x: 20, y: 20 },
          size: { width: 300, height: 40 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, fontSize: 14, padding: 8 },
          config: { inputType: 'number', placeholder: '70', min: 20, max: 300 }
        },
        {
          id: 'height',
          type: 'input',
          name: 'Рост',
          label: 'Рост (см)',
          position: { x: 20, y: 80 },
          size: { width: 300, height: 40 },
          styles: { backgroundColor: '#ffffff', textColor: '#000000', borderRadius: 4, fontSize: 14, padding: 8 },
          config: { inputType: 'number', placeholder: '175', min: 100, max: 250 }
        },
        {
          id: 'bmi_result',
          type: 'output',
          name: 'ИМТ',
          label: 'Индекс массы тела',
          position: { x: 20, y: 140 },
          size: { width: 300, height: 60 },
          styles: { backgroundColor: '#fef3c7', textColor: '#92400e', borderRadius: 4, fontSize: 16, padding: 12 },
          config: { formula: 'round(weight / power(height/100, 2), 1)' }
        }
      ],
      variables: [
        { id: 'weight', name: 'Вес', type: 'number', defaultValue: 70 },
        { id: 'height', name: 'Рост', type: 'number', defaultValue: 175 }
      ],
      formulas: [
        {
          id: 'bmi_result',
          name: 'ИМТ',
          expression: 'round(weight / power(height/100, 2), 1)'
        }
      ]
    }
  }
];

export default function CalculatorBuilderPage() {
  const [mode, setMode] = useState<'examples' | 'builder' | 'runtime'>('examples');
  const [selectedExample, setSelectedExample] = useState<any>(null);
  const [builderConfig, setBuilderConfig] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 🎨 Заголовок */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Универсальный конструктор калькуляторов
                </h1>
                <p className="text-gray-600 mt-1">
                  Создайте любой калькулятор без программирования
                </p>
              </div>
            </div>

            {/* Навигация */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode('examples')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'examples' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Star className="w-4 h-4 inline mr-2" />
                Примеры
              </button>
              <button
                onClick={() => setMode('builder')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'builder' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-4 h-4 inline mr-2" />
                Конструктор
              </button>
              {selectedExample && (
                <button
                  onClick={() => setMode('runtime')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'runtime' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Play className="w-4 h-4 inline mr-2" />
                  Тест
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 📱 Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'examples' && (
          <div>
            {/* Описание */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Создавайте калькуляторы для любых задач
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                От простых расчетов до сложных инженерных формул. 
                Визуальный конструктор, мощный движок формул, интеграция с каталогом товаров.
              </p>
            </div>

            {/* Преимущества */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Без программирования</h3>
                <p className="text-gray-600">Создавайте сложные калькуляторы с помощью визуального интерфейса</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Мощные формулы</h3>
                <p className="text-gray-600">60+ математических функций, условная логика, валидация данных</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Интеграция</h3>
                <p className="text-gray-600">Подключение к каталогу товаров, внешним API и базам данных</p>
              </div>
            </div>

            {/* Примеры калькуляторов */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Готовые примеры калькуляторов
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EXAMPLE_CALCULATORS.map((example) => (
                  <div 
                    key={example.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedExample(example);
                      setMode('runtime');
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-3">{example.icon}</div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {example.name}
                        </h4>
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {example.category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {example.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExample(example);
                          setMode('runtime');
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Попробовать
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setBuilderConfig(example.config);
                          setMode('builder');
                        }}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Изучить
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Призыв к действию */}
              <div className="text-center mt-12">
                <button
                  onClick={() => setMode('builder')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Создать свой калькулятор
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'builder' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <UniversalCalculatorBuilder />
          </div>
        )}

        {mode === 'runtime' && selectedExample && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">{selectedExample.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedExample.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedExample.description}
                  </p>
                </div>
              </div>
              
              <CalculatorRuntime 
                config={selectedExample.config}
                onResult={(results) => console.log('Результаты:', results)}
              />
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setMode('examples')}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    ← Назад к примерам
                  </button>
                  
                  <button
                    onClick={() => {
                      setBuilderConfig(selectedExample.config);
                      setMode('builder');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Редактировать в конструкторе
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
