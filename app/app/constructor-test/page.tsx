'use client';

import React, { useState } from 'react';
import { Button, Card, Badge } from '@/components/ui';
import Constructor from '@/components/constructor/Constructor';
import { 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Play, 
  Eye,
  Palette,
  Smartphone,
  Tablet,
  Monitor,
  Code,
  FileText
} from 'lucide-react';

export default function ConstructorTestPage() {
  const [showConstructor, setShowConstructor] = useState(false);
  const [testMode, setTestMode] = useState<'full' | 'components' | 'api'>('full');

  const testFeatures = [
    {
      id: 'drag-drop',
      name: 'Drag & Drop',
      description: 'Перетаскивание элементов на холст',
      status: 'ready'
    },
    {
      id: 'properties',
      name: 'Редактирование свойств',
      description: 'Панель свойств справа',
      status: 'ready'
    },
    {
      id: 'responsive',
      name: 'Адаптивность',
      description: 'Переключение между устройствами',
      status: 'ready'
    },
    {
      id: 'ai-suggestions',
      name: 'AI предложения',
      description: 'Умные предложения модулей',
      status: 'ready'
    },
    {
      id: 'animations',
      name: 'Анимации',
      description: 'Система анимаций элементов',
      status: 'ready'
    },
    {
      id: 'save-load',
      name: 'Сохранение/Загрузка',
      description: 'Сохранение конфигураций',
      status: 'ready'
    },
    {
      id: 'undo-redo',
      name: 'Отмена/Повтор',
      description: 'История действий',
      status: 'ready'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready': return <Badge variant="default" className="bg-green-100 text-green-800">Готово</Badge>;
      case 'testing': return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Тестируется</Badge>;
      case 'error': return <Badge variant="destructive">Ошибка</Badge>;
      default: return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  const handleSaveConfig = () => {
    console.log('Сохранение конфигурации...');
    // Здесь будет логика сохранения
  };

  const handleLoadConfig = () => {
    console.log('Загрузка конфигурации...');
    // Здесь будет логика загрузки
  };

  const handleExport = () => {
    console.log('Экспорт конфигурации...');
    // Здесь будет логика экспорта
  };

  if (showConstructor) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Тестовая панель управления */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowConstructor(false)}
                className="flex items-center space-x-2"
              >
                ← Назад к тестам
              </Button>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Тестовый режим конструктора
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveConfig}
                className="flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>Сохранить</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadConfig}
                className="flex items-center space-x-1"
              >
                <Upload className="h-4 w-4" />
                <span>Загрузить</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Экспорт</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Конструктор */}
        <div className="h-[calc(100vh-80px)]">
          <Constructor />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 Тестирование No-Code Конструктора
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Отдельная страница для тестирования всех функций конструктора страниц
          </p>
        </div>

        {/* Режимы тестирования */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setTestMode('full')}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Полный тест</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Запуск полного конструктора со всеми функциями
            </p>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setTestMode('components')}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Code className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Компоненты</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Тестирование отдельных компонентов
            </p>
          </Card>

          <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setTestMode('api')}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">API тесты</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Тестирование API сохранения/загрузки
            </p>
          </Card>
        </div>

        {/* Основная кнопка запуска */}
        <div className="text-center mb-8">
          <Button
            size="lg"
            onClick={() => setShowConstructor(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            <Settings className="h-6 w-6 mr-3" />
            Запустить конструктор
          </Button>
        </div>

        {/* Список функций для тестирования */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Функции для тестирования</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.name}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                {getStatusBadge(feature.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Инструкции по тестированию */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Инструкции по тестированию</h3>
          <div className="space-y-2 text-blue-800">
            <p>1. <strong>Запустите конструктор</strong> - нажмите кнопку "Запустить конструктор"</p>
            <p>2. <strong>Добавьте элементы</strong> - перетащите элементы из левой панели на холст</p>
            <p>3. <strong>Редактируйте свойства</strong> - выберите элемент и измените его свойства в правой панели</p>
            <p>4. <strong>Тестируйте адаптивность</strong> - переключайтесь между desktop/tablet/mobile</p>
            <p>5. <strong>Попробуйте AI предложения</strong> - включите панель AI для умных предложений</p>
            <p>6. <strong>Добавьте анимации</strong> - настройте анимации для элементов</p>
            <p>7. <strong>Сохраните конфигурацию</strong> - используйте кнопки сохранения/загрузки</p>
          </div>
        </div>

        {/* Информация о системе */}
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">ℹ️ Информация о системе</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p><strong>Версия:</strong> 1.0.0</p>
              <p><strong>Статус:</strong> Готово к тестированию</p>
            </div>
            <div>
              <p><strong>Браузер:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.split(' ').slice(-2).join(' ') : 'N/A'}</p>
              <p><strong>Время загрузки:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


