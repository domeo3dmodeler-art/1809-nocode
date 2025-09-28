'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Select, Alert, LoadingSpinner } from '@/components/ui';
import { Plus, Trash2, Settings, Package, Link as LinkIcon, Calculator } from 'lucide-react';
import PricingFormulaEditor from '../../../../components/configurator/PricingFormulaEditor';

interface CategoryLink {
  id: string;
  configurator_category_id: string;
  catalog_category_id: string;
  link_type: 'main' | 'additional';
  display_order: number;
  is_required: boolean;
  pricing_type: 'separate' | 'included' | 'formula';
  formula?: string;
  export_as_separate: boolean;
  catalog_category: {
    id: string;
    name: string;
    level: number;
  };
}

interface ConfiguratorCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface CatalogCategory {
  id: string;
  name: string;
  level: number;
  path: string;
}

export default function CategoryLinksPage() {
  const [configuratorCategories, setConfiguratorCategories] = useState<ConfiguratorCategory[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [selectedConfiguratorCategory, setSelectedConfiguratorCategory] = useState<string>('');
  const [categoryLinks, setCategoryLinks] = useState<CategoryLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPricingEditor, setShowPricingEditor] = useState(false);
  const [editingLink, setEditingLink] = useState<CategoryLink | null>(null);

  const [newLink, setNewLink] = useState({
    catalog_category_id: '',
    link_type: 'additional' as 'main' | 'additional',
    display_order: 0,
    is_required: false,
    pricing_type: 'separate' as 'separate' | 'included' | 'formula',
    formula: '',
    export_as_separate: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedConfiguratorCategory) {
      fetchCategoryLinks();
    }
  }, [selectedConfiguratorCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configResponse, catalogResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/catalog/categories')
      ]);

      const configData = await configResponse.json();
      const catalogData = await catalogResponse.json();

      setConfiguratorCategories(configData.categories || []);
      setCatalogCategories(catalogData.categories || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Ошибка загрузки данных' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryLinks = async () => {
    if (!selectedConfiguratorCategory) return;

    try {
      const response = await fetch(`/api/configurator/category-links?configuratorCategoryId=${selectedConfiguratorCategory}`);
      const data = await response.json();
      
      if (data.success) {
        setCategoryLinks(data.links || []);
      } else {
        setAlert({ type: 'error', message: 'Ошибка загрузки связей' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Ошибка загрузки связей' });
    }
  };

  const handleCreateLink = async () => {
    if (!selectedConfiguratorCategory || !newLink.catalog_category_id) {
      setAlert({ type: 'error', message: 'Выберите категории' });
      return;
    }

    try {
      const response = await fetch('/api/configurator/category-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configurator_category_id: selectedConfiguratorCategory,
          ...newLink
        })
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: 'success', message: 'Связь создана успешно' });
        setShowCreateModal(false);
        setNewLink({
          catalog_category_id: '',
          link_type: 'additional',
          display_order: 0,
          is_required: false,
          pricing_type: 'separate',
          formula: '',
          export_as_separate: true
        });
        fetchCategoryLinks();
      } else {
        setAlert({ type: 'error', message: data.error || 'Ошибка создания связи' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Ошибка создания связи' });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Удалить связь категорий?')) return;

    try {
      const response = await fetch(`/api/configurator/category-links/${linkId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: 'success', message: 'Связь удалена успешно' });
        fetchCategoryLinks();
      } else {
        setAlert({ type: 'error', message: data.error || 'Ошибка удаления связи' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Ошибка удаления связи' });
    }
  };

  const handleEditPricing = (link: CategoryLink) => {
    setEditingLink(link);
    setShowPricingEditor(true);
  };

  const handleSavePricing = async (rule: any) => {
    if (!editingLink) return;

    try {
      const response = await fetch(`/api/configurator/category-links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricing_type: rule.type,
          formula: rule.type === 'formula' ? rule.formula : null,
          pricing_rule: JSON.stringify(rule)
        })
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ type: 'success', message: 'Правило ценообразования сохранено' });
        setShowPricingEditor(false);
        setEditingLink(null);
        fetchCategoryLinks();
      } else {
        setAlert({ type: 'error', message: data.error || 'Ошибка сохранения правила' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Ошибка сохранения правила' });
    }
  };

  const getLinkTypeLabel = (type: string) => {
    return type === 'main' ? 'Основная' : 'Дополнительная';
  };

  const getLinkTypeColor = (type: string) => {
    return type === 'main' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getPricingTypeLabel = (type: string) => {
    switch (type) {
      case 'separate': return 'Отдельная строка';
      case 'included': return 'Включено в цену';
      case 'formula': return 'По формуле';
      default: return type;
    }
  };

  const selectedConfigurator = configuratorCategories.find(cat => cat.id === selectedConfiguratorCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" color="black" text="Загрузка данных..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Связи категорий</h1>
            <p className="text-gray-600 mt-2">Управление связями между категориями конфигуратора и каталога</p>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            className="mb-6"
          />
        )}

        {/* Выбор категории конфигуратора */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Выберите категорию конфигуратора</h2>
          <Select
            value={selectedConfiguratorCategory}
            onValueChange={setSelectedConfiguratorCategory}
            placeholder="Выберите категорию"
          >
            {configuratorCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Card>

        {selectedConfiguratorCategory && (
          <>
            {/* Информация о выбранной категории */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedConfigurator?.name}
                  </h2>
                  <p className="text-gray-600">{selectedConfigurator?.description}</p>
                </div>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Добавить связь</span>
                </Button>
              </div>
            </Card>

            {/* Список связей */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Связи категорий</h3>
              
              {categoryLinks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">Связи не найдены</p>
                  <p className="text-sm">Добавьте связи между категориями конфигуратора и каталога</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryLinks
                    .sort((a, b) => a.display_order - b.display_order)
                    .map(link => (
                    <div key={link.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">{link.catalog_category.name}</span>
                          </div>
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLinkTypeColor(link.link_type)}`}>
                            {getLinkTypeLabel(link.link_type)}
                          </span>
                          
                          <span className="text-sm text-gray-600">
                            {getPricingTypeLabel(link.pricing_type)}
                          </span>
                          
                          {link.is_required && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              Обязательная
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            Порядок: {link.display_order}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPricing(link)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Настроить ценообразование"
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Удалить связь"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {link.formula && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Формула:</strong> {link.formula}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* Modal создания связи */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Добавить связь</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория каталога
                  </label>
                  <Select
                    value={newLink.catalog_category_id}
                    onValueChange={(value) => setNewLink({ ...newLink, catalog_category_id: value })}
                  >
                    {catalogCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} (Уровень {category.level})
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип связи
                  </label>
                  <Select
                    value={newLink.link_type}
                    onValueChange={(value: 'main' | 'additional') => setNewLink({ ...newLink, link_type: value })}
                  >
                    <option value="main">Основная</option>
                    <option value="additional">Дополнительная</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип ценообразования
                  </label>
                  <Select
                    value={newLink.pricing_type}
                    onValueChange={(value: 'separate' | 'included' | 'formula') => setNewLink({ ...newLink, pricing_type: value })}
                  >
                    <option value="separate">Отдельная строка</option>
                    <option value="included">Включено в цену</option>
                    <option value="formula">По формуле</option>
                  </Select>
                </div>

                {newLink.pricing_type === 'formula' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Формула
                    </label>
                    <Input
                      value={newLink.formula}
                      onChange={(e) => setNewLink({ ...newLink, formula: e.target.value })}
                      placeholder="basePrice * 1.1"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Порядок отображения
                    </label>
                    <Input
                      type="number"
                      value={newLink.display_order}
                      onChange={(e) => setNewLink({ ...newLink, display_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="is_required"
                      checked={newLink.is_required}
                      onChange={(e) => setNewLink({ ...newLink, is_required: e.target.checked })}
                      className="rounded"
                    />
                    <label htmlFor="is_required" className="text-sm font-medium text-gray-700">
                      Обязательная
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="export_as_separate"
                    checked={newLink.export_as_separate}
                    onChange={(e) => setNewLink({ ...newLink, export_as_separate: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="export_as_separate" className="text-sm font-medium text-gray-700">
                    Экспортировать отдельной строкой
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleCreateLink}
                  disabled={!newLink.catalog_category_id}
                >
                  Создать
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Редактор формул ценообразования */}
        {showPricingEditor && editingLink && (
          <PricingFormulaEditor
            categoryLinkId={editingLink.id}
            linkType={editingLink.link_type}
            onSave={handleSavePricing}
            onCancel={() => {
              setShowPricingEditor(false);
              setEditingLink(null);
            }}
          />
        )}
      </div>
    </div>
  );
}