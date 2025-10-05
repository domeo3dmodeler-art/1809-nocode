'use client';

import React, { useState, useEffect } from 'react';

interface DoorCalculatorProps {
  title?: string;
  showDimensions?: boolean;
  showStyle?: boolean;
  showSystem?: boolean;
  showFinish?: boolean;
}

interface CalculationResult {
  basePrice: number;
  styleMultiplier: number;
  systemMultiplier: number;
  finishMultiplier: number;
  areaMultiplier: number;
  totalPrice: number;
}

export function DoorCalculator({ 
  title = "Калькулятор дверей Domeo",
  showDimensions = true,
  showStyle = true,
  showSystem = true,
  showFinish = true
}: DoorCalculatorProps) {
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 2000
  });
  const [style, setStyle] = useState('modern');
  const [doorSystem, setDoorSystem] = useState('swing');
  const [finish, setFinish] = useState('paint');
  const [hardware, setHardware] = useState('standard');
  const [result, setResult] = useState<CalculationResult>({
    basePrice: 15000,
    styleMultiplier: 1.0,
    systemMultiplier: 1.0,
    finishMultiplier: 1.0,
    areaMultiplier: 1.0,
    totalPrice: 15000
  });

  // Стили дверей (как на Framyr.ru)
  const styles = [
    { value: 'modern', label: 'Современный', multiplier: 1.0, basePrice: 15000 },
    { value: 'classic', label: 'Классический', multiplier: 1.3, basePrice: 18000 },
    { value: 'neoclassic', label: 'Неоклассика', multiplier: 1.2, basePrice: 17000 },
    { value: 'hidden', label: 'Скрытый', multiplier: 1.8, basePrice: 31150 },
    { value: 'aluminum', label: 'Алюминий', multiplier: 1.5, basePrice: 22000 }
  ];

  // Системы открывания
  const systems = [
    { value: 'swing', label: 'Поворотная', multiplier: 1.0 },
    { value: 'sliding', label: 'Раздвижная', multiplier: 1.4 },
    { value: 'pocket', label: 'Пенал', multiplier: 1.6 },
    { value: 'folding', label: 'Складная', multiplier: 1.3 }
  ];

  // Покрытия
  const finishes = [
    { value: 'paint', label: 'Эмаль', multiplier: 1.0 },
    { value: 'veneer', label: 'Шпон', multiplier: 1.3 },
    { value: 'nanotex', label: 'Нанотекс', multiplier: 1.1 },
    { value: 'glass', label: 'Стекло', multiplier: 1.4 },
    { value: 'painted_veneer', label: 'Эмаль по шпону', multiplier: 1.5 }
  ];

  // Фурнитура
  const hardwareOptions = [
    { value: 'standard', label: 'Стандартная', multiplier: 1.0 },
    { value: 'premium', label: 'Премиум', multiplier: 1.3 },
    { value: 'luxury', label: 'Люкс', multiplier: 1.8 }
  ];

  const calculatePrice = () => {
    const area = (dimensions.width * dimensions.height) / 1000000; // в м²
    const areaMultiplier = Math.max(0.8, Math.min(1.5, area)); // от 0.8 до 1.5
    
    const selectedStyle = styles.find(s => s.value === style);
    const selectedSystem = systems.find(s => s.value === doorSystem);
    const selectedFinish = finishes.find(f => f.value === finish);
    const selectedHardware = hardwareOptions.find(h => h.value === hardware);
    
    const basePrice = selectedStyle?.basePrice || 15000;
    const styleMultiplier = selectedStyle?.multiplier || 1.0;
    const systemMultiplier = selectedSystem?.multiplier || 1.0;
    const finishMultiplier = selectedFinish?.multiplier || 1.0;
    const hardwareMultiplier = selectedHardware?.multiplier || 1.0;
    
    const totalMultiplier = styleMultiplier * systemMultiplier * finishMultiplier * hardwareMultiplier;
    const totalPrice = Math.round(basePrice * areaMultiplier * totalMultiplier);
    
    setResult({
      basePrice,
      styleMultiplier,
      systemMultiplier,
      finishMultiplier,
      areaMultiplier,
      totalPrice
    });
  };

  useEffect(() => {
    calculatePrice();
  }, [dimensions, style, doorSystem, finish, hardware]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">Рассчитайте стоимость вашей двери</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Параметры */}
        <div className="space-y-6">
          {showDimensions && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                📏 Размеры двери
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ширина (мм)
                  </label>
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="600"
                    max="1200"
                    step="50"
                  />
                  <div className="text-xs text-gray-500 mt-1">600-1200 мм</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Высота (мм)
                  </label>
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1800"
                    max="2200"
                    step="50"
                  />
                  <div className="text-xs text-gray-500 mt-1">1800-2200 мм</div>
                </div>
              </div>
            </div>
          )}

          {showStyle && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🎨 Стиль двери
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {styles.map(s => (
                  <label key={s.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="style"
                      value={s.value}
                      checked={style === s.value}
                      onChange={(e) => setStyle(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{s.label}</div>
                      <div className="text-sm text-gray-600">от {s.basePrice.toLocaleString()} ₽/м²</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showSystem && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🔧 Система открывания
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {systems.map(s => (
                  <label key={s.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="system"
                      value={s.value}
                      checked={doorSystem === s.value}
                      onChange={(e) => setDoorSystem(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{s.label}</div>
                      <div className="text-sm text-gray-600">
                        {s.multiplier === 1.0 ? 'Базовая цена' : `+${Math.round((s.multiplier - 1) * 100)}%`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showFinish && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                🎭 Покрытие
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {finishes.map(f => (
                  <label key={f.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                    <input
                      type="radio"
                      name="finish"
                      value={f.value}
                      checked={finish === f.value}
                      onChange={(e) => setFinish(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{f.label}</div>
                      <div className="text-sm text-gray-600">
                        {f.multiplier === 1.0 ? 'Базовое покрытие' : `+${Math.round((f.multiplier - 1) * 100)}%`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🔩 Фурнитура
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {hardwareOptions.map(h => (
                <label key={h.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    name="hardware"
                    value={h.value}
                    checked={hardware === h.value}
                    onChange={(e) => setHardware(h.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{h.label}</div>
                    <div className="text-sm text-gray-600">
                      {h.multiplier === 1.0 ? 'Стандартная фурнитура' : `+${Math.round((h.multiplier - 1) * 100)}%`}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Результат */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Расчет стоимости</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700">Размер:</span>
              <span className="font-semibold text-gray-900">
                {dimensions.width} × {dimensions.height} мм
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700">Площадь:</span>
              <span className="font-semibold text-gray-900">
                {((dimensions.width * dimensions.height) / 1000000).toFixed(2)} м²
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700">Стиль:</span>
              <span className="font-semibold text-gray-900">
                {styles.find(s => s.value === style)?.label}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700">Система:</span>
              <span className="font-semibold text-gray-900">
                {systems.find(s => s.value === doorSystem)?.label}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700">Покрытие:</span>
              <span className="font-semibold text-gray-900">
                {finishes.find(f => f.value === finish)?.label}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700">Фурнитура:</span>
              <span className="font-semibold text-gray-900">
                {hardwareOptions.find(h => h.value === hardware)?.label}
              </span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Итоговая стоимость</div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.totalPrice.toLocaleString()} ₽
              </div>
              <div className="text-sm text-gray-500">
                Включая материалы, работы и фурнитуру
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <button className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg">
              📞 Заказать консультацию
            </button>
            
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium">
              🛒 Добавить в корзину
            </button>
            
            <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              💾 Сохранить расчет
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

