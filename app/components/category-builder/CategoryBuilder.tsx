'use client';

import React, { useState, useCallback } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { Card, Button } from '../ui';
import { ModuleConfig, ModuleType, DEFAULT_MODULES } from './ModuleTypes';

// Компонент модуля в палитре
const ModulePaletteItem: React.FC<{ 
  module: Partial<ModuleConfig>; 
  onAdd: (type: ModuleType) => void;
}> = ({ module, onAdd }) => {
  return (
    <div
      onClick={() => onAdd(module.type as ModuleType)}
      className="p-3 border border-gray-200 rounded cursor-pointer hover:border-black transition-colors"
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{module.icon}</span>
        <div>
          <h4 className="font-medium text-black">{module.title}</h4>
          <p className="text-sm text-gray-600">{module.description}</p>
        </div>
      </div>
    </div>
  );
};

// Компонент модуля на канвасе
const CanvasModule: React.FC<{
  module: ModuleConfig;
  onUpdate: (id: string, updates: Partial<ModuleConfig>) => void;
  onRemove: (id: string) => void;
}> = ({ module, onUpdate, onRemove }) => {
  return (
    <div className="p-4 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-black transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{module.icon}</span>
          <h3 className="font-medium text-black">{module.title}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onUpdate(module.id, {})}
            className="text-gray-500 hover:text-black"
          >
            ⚙️
          </button>
          <button
            onClick={() => onRemove(module.id)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {module.description}
      </div>
    </div>
  );
};

// Основной компонент конструктора
export default function CategoryBuilder() {
  const [modules, setModules] = useState<ModuleConfig[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const addModule = useCallback((type: ModuleType) => {
    const defaultModule = DEFAULT_MODULES.find(m => m.type === type);
    if (!defaultModule) return;

    const newModule: ModuleConfig = {
      id: `module-${Date.now()}`,
      type,
      title: defaultModule.title!,
      description: defaultModule.description!,
      icon: defaultModule.icon!,
      settings: { ...defaultModule.settings },
      position: { x: 0, y: modules.length * 120 },
      size: { width: 300, height: 100 }
    };

    setModules(prev => [...prev, newModule]);
  }, [modules.length]);

  const updateModule = useCallback((id: string, updates: Partial<ModuleConfig>) => {
    setModules(prev => prev.map(module => 
      module.id === id ? { ...module, ...updates } : module
    ));
  }, []);

  const removeModule = useCallback((id: string) => {
    setModules(prev => prev.filter(module => module.id !== id));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Палитра модулей */}
      <div className="lg:col-span-1">
        <Card variant="base">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-black mb-4">Модули</h3>
            <div className="space-y-2">
              {DEFAULT_MODULES.map((module, index) => (
                <ModulePaletteItem 
                  key={index} 
                  module={module} 
                  onAdd={addModule}
                />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Канвас */}
      <div className="lg:col-span-3">
        <Card variant="base">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Конструктор</h3>
              <div className="flex space-x-2">
                <Button variant="secondary" size="sm">
                  Предпросмотр
                </Button>
                <Button variant="primary" size="sm">
                  Сохранить
                </Button>
              </div>
            </div>
            
            <div className="min-h-96 p-4 border-2 border-dashed border-gray-300 rounded">
              {modules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🎨</div>
                  <p>Нажмите на модули слева для добавления в конструктор</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map(module => (
                    <CanvasModule
                      key={module.id}
                      module={module}
                      onUpdate={updateModule}
                      onRemove={removeModule}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
