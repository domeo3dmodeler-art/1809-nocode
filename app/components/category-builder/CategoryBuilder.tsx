'use client';

import React, { useState } from 'react';
import { Card, Button } from '../ui';

interface CategoryBuilderProps {
  categoryData: any;
  onComplete: () => void;
}

export default function CategoryBuilder({ 
  categoryData, 
  onComplete 
}: CategoryBuilderProps) {
  const [components, setComponents] = useState([]);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/categories/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: categoryData?.id,
          template: { name: 'Basic Template', components: [] }
        }),
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Конструктор категории</h2>
        <Button onClick={handleSave} variant="primary">
          Сохранить
        </Button>
      </div>
      
      <div className="bg-gray-100 p-8 rounded-lg">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-xl font-medium mb-2">Профессиональный конструктор</h3>
          <p className="text-sm">Здесь будет профессиональный drag & drop конструктор</p>
          <p className="text-sm mt-2">С компонентами: сетка товаров, фильтры, поиск, корзина</p>
        </div>
      </div>
    </Card>
  );
}