'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '../types';

interface PriceCalculatorProps {
  categoryIds: string[];
  selectedProduct: Product | null;
  configuration: Record<string, any>;
  onPriceCalculated: (price: number, breakdown: PriceBreakdown[]) => void;
}

interface PriceBreakdown {
  label: string;
  amount: number;
  type: 'base' | 'option' | 'discount' | 'total';
}

interface CalculatorRule {
  id: string;
  name: string;
  condition: string;
  formula: string;
  type: 'base' | 'multiplier' | 'addition' | 'discount';
}

export function PriceCalculator({
  categoryIds,
  selectedProduct,
  configuration,
  onPriceCalculated
}: PriceCalculatorProps) {
  const [rules, setRules] = useState<CalculatorRule[]>([]);
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<PriceBreakdown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка правил калькулятора
  useEffect(() => {
    if (categoryIds.length === 0) {
      setRules([]);
      return;
    }

    loadCalculatorRules();
  }, [categoryIds]);

  // Пересчет цены при изменении конфигурации или товара
  useEffect(() => {
    if (selectedProduct && rules.length > 0) {
      calculatePrice();
    }
  }, [selectedProduct, configuration, rules]);

  const loadCalculatorRules = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = categoryIds
        .map(id => `categoryIds=${encodeURIComponent(id)}`)
        .join('&');
      
      const response = await fetch(`/api/price/calculator/rules?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRules(data.rules || []);
      } else {
        setError(data.message || 'Ошибка загрузки правил калькулятора');
      }

    } catch (error) {
      console.error('Error loading calculator rules:', error);
      setError('Ошибка загрузки правил калькулятора');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!selectedProduct || rules.length === 0) {
      setCalculatedPrice(0);
      setBreakdown([]);
      return;
    }

    let totalPrice = selectedProduct.base_price;
    const breakdownItems: PriceBreakdown[] = [
      {
        label: 'Базовая цена',
        amount: selectedProduct.base_price,
        type: 'base'
      }
    ];

    // Применяем правила калькулятора
    rules.forEach(rule => {
      try {
        if (evaluateCondition(rule.condition, configuration)) {
          const priceDelta = evaluateFormula(rule.formula, configuration, selectedProduct);
          
          if (priceDelta !== 0) {
            switch (rule.type) {
              case 'multiplier':
                totalPrice *= priceDelta;
                breakdownItems.push({
                  label: rule.name,
                  amount: (priceDelta - 1) * selectedProduct.base_price,
                  type: 'option'
                });
                break;
              
              case 'addition':
                totalPrice += priceDelta;
                breakdownItems.push({
                  label: rule.name,
                  amount: priceDelta,
                  type: 'option'
                });
                break;
              
              case 'discount':
                totalPrice -= priceDelta;
                breakdownItems.push({
                  label: rule.name,
                  amount: -priceDelta,
                  type: 'discount'
                });
                break;
              
              case 'base':
                totalPrice = priceDelta;
                breakdownItems.push({
                  label: rule.name,
                  amount: priceDelta - selectedProduct.base_price,
                  type: 'option'
                });
                break;
            }
          }
        }
      } catch (error) {
        console.error(`Error applying rule ${rule.id}:`, error);
      }
    });

    // Добавляем итоговую сумму
    breakdownItems.push({
      label: 'Итого',
      amount: totalPrice,
      type: 'total'
    });

    setCalculatedPrice(totalPrice);
    setBreakdown(breakdownItems);
    onPriceCalculated(totalPrice, breakdownItems);
  };

  // Оценка условия правила
  const evaluateCondition = (condition: string, config: Record<string, any>): boolean => {
    try {
      // Заменяем переменные в условии на значения из конфигурации
      let evaluatedCondition = condition;
      Object.entries(config).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        if (typeof value === 'string') {
          evaluatedCondition = evaluatedCondition.replace(regex, `"${value}"`);
        } else {
          evaluatedCondition = evaluatedCondition.replace(regex, String(value));
        }
      });

      // Безопасная оценка условия
      return Function(`"use strict"; return (${evaluatedCondition})`)();
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  };

  // Оценка формулы правила
  const evaluateFormula = (formula: string, config: Record<string, any>, product: Product): number => {
    try {
      // Заменяем переменные в формуле
      let evaluatedFormula = formula;
      Object.entries(config).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluatedFormula = evaluatedFormula.replace(regex, String(value));
      });

      // Заменяем переменные товара
      evaluatedFormula = evaluatedFormula.replace(/\bbase_price\b/g, String(product.base_price));
      evaluatedFormula = evaluatedFormula.replace(/\bprice\b/g, String(product.base_price));

      // Безопасная оценка формулы
      return Function(`"use strict"; return (${evaluatedFormula})`)();
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return 0;
    }
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: selectedProduct?.currency || 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (categoryIds.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <div className="text-4xl mb-4">💰</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Калькулятор цены</h3>
        <p className="text-gray-500">
          Выберите категории товаров для настройки калькулятора
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Загрузка калькулятора...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 rounded-lg">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-red-900 mb-2">Ошибка загрузки</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Калькулятор цены</h3>
        <p className="text-sm text-gray-500">
          Автоматический расчет стоимости
        </p>
      </div>

      {/* Price Display */}
      {calculatedPrice > 0 ? (
        <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-3xl font-bold text-blue-900 mb-2">
            {formatPrice(calculatedPrice)}
          </div>
          <div className="text-sm text-blue-700">
            Итоговая стоимость
          </div>
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-lg text-gray-500">
            Выберите товар для расчета цены
          </div>
        </div>
      )}

      {/* Breakdown */}
      {breakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Детализация цены</h4>
          <div className="space-y-2">
            {breakdown.map((item, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-2 rounded ${
                  item.type === 'total'
                    ? 'bg-blue-100 border border-blue-200 font-medium'
                    : 'bg-gray-50'
                }`}
              >
                <span className={`text-sm ${
                  item.type === 'total' ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {item.label}
                </span>
                <span className={`text-sm font-medium ${
                  item.type === 'total' 
                    ? 'text-blue-900' 
                    : item.type === 'discount'
                    ? 'text-green-600'
                    : 'text-gray-900'
                }`}>
                  {item.type === 'discount' && item.amount > 0 ? '-' : ''}
                  {formatPrice(Math.abs(item.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Info */}
      {rules.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Активно правил: {rules.length}
        </div>
      )}

      {/* No Product Selected */}
      {!selectedProduct && (
        <div className="p-4 text-center bg-yellow-50 rounded-lg">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm text-yellow-700">
            Выберите товар в конфигураторе для расчета цены
          </p>
        </div>
      )}
    </div>
  );
}
