'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Select, Checkbox } from '../ui';

interface CategoryInfoFormProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

interface CategoryData {
  name: string;
  description: string;
  slug: string;
  icon: string;
  is_main: boolean;
  parent_id: string | null;
}

export default function CategoryInfoForm({ onComplete, onCancel }: CategoryInfoFormProps) {
  const [categoryData, setCategoryData] = useState<CategoryData>({
    name: '',
    description: '',
    slug: '',
    icon: '📦',
    is_main: true,
    parent_id: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setCategoryData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && { slug: generateSlug(value) })
    }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Валидация
      if (!categoryData.name.trim()) {
        alert('Введите название категории');
        return;
      }
      
      if (!categoryData.slug.trim()) {
        alert('Введите slug категории');
        return;
      }

      // Подготовка данных
      const finalData = {
        ...categoryData
      };

      // Имитация сохранения
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete(finalData);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Ошибка при создании категории.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <Card variant="base">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">Название категории *</label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={categoryData.name}
                  onChange={handleInputChange}
                  placeholder="Например: Двери межкомнатные"
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-black mb-1">Slug (URL-идентификатор) *</label>
                <Input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={categoryData.slug}
                  onChange={handleInputChange}
                  placeholder="dveri-mezhkomnatnye"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-black mb-1">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  value={categoryData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="Краткое описание категории товаров"
                ></textarea>
              </div>
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-black mb-1">Иконка (Emoji или URL)</label>
                <Input
                  id="icon"
                  name="icon"
                  type="text"
                  value={categoryData.icon}
                  onChange={handleInputChange}
                  placeholder="🚪"
                />
              </div>
              <div>
                <label htmlFor="is_main" className="block text-sm font-medium text-black mb-1">Тип категории</label>
                <Select
                  id="is_main"
                  name="is_main"
                  value={categoryData.is_main ? 'main' : 'sub'}
                  onChange={(e) => setCategoryData(prev => ({
                    ...prev,
                    is_main: e.target.value === 'main',
                    parent_id: e.target.value === 'main' ? null : prev.parent_id
                  }))}
                  options={[
                    { value: 'main', label: 'Основная категория' },
                    { value: 'sub', label: 'Подкатегория' }
                  ]}
                />
              </div>
              {!categoryData.is_main && (
                <div>
                  <label htmlFor="parent_id" className="block text-sm font-medium text-black mb-1">Родительская категория</label>
                  <Select
                    id="parent_id"
                    name="parent_id"
                    value={categoryData.parent_id || ''}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Выберите родительскую категорию' },
                      { value: 'doors-main', label: 'Двери (Основная)' },
                      { value: 'smart-main', label: 'Смарт (Основная)' }
                    ]}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>



        {/* Кнопки действий */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
          >
            {isLoading ? 'Создание...' : 'Продолжить в конструктор'}
          </Button>
        </div>
      </form>
    </div>
  );
}
