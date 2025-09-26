'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '../../../../../components/ui';
import { Search, CheckCircle, XCircle, AlertTriangle, FileText, Calculator, Download, Upload } from 'lucide-react';
import { ProductProperty, CatalogCategory } from '@/lib/types/catalog';

interface PropertyModerationItem extends ProductProperty {
  category_assignments?: Array<{
    id: string;
    catalog_category: CatalogCategory;
    is_required: boolean;
    is_for_calculator: boolean;
    is_for_export: boolean;
  }>;
}

export default function PropertyModerationPage() {
  const [properties, setProperties] = useState<PropertyModerationItem[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<PropertyModerationItem | null>(null);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, categoriesRes] = await Promise.all([
        fetch('/api/catalog/properties'),
        fetch('/api/catalog/categories')
      ]);

      const propertiesData = await propertiesRes.json();
      const categoriesData = await categoriesRes.json();

      setProperties(propertiesData.properties || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerateProperty = (property: PropertyModerationItem) => {
    setSelectedProperty(property);
    setModerateDialogOpen(true);
  };

  const handleModerationSubmit = async (data: {
    categoryIds: string[];
    isRequired: boolean;
    isForCalculator: boolean;
    isForExport: boolean;
  }) => {
    if (!selectedProperty) return;

    try {
      // Создаем назначения для выбранных категорий
      const promises = data.categoryIds.map(categoryId => 
        fetch('/api/catalog/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            catalog_category_id: categoryId,
            product_property_id: selectedProperty.id,
            is_required: data.isRequired,
            is_for_calculator: data.isForCalculator,
            is_for_export: data.isForExport,
            sort_order: 0
          })
        })
      );

      await Promise.all(promises);
      await loadData();
      setModerateDialogOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error moderating property:', error);
    }
  };

  const getPropertyTypeLabel = (type: string): string => {
    const labels = {
      text: 'Текст',
      number: 'Число',
      select: 'Список',
      boolean: 'Да/Нет',
      date: 'Дата',
      file: 'Файл'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getModerationStatus = (property: PropertyModerationItem) => {
    const assignments = property.category_assignments || [];
    
    if (assignments.length === 0) {
      return {
        status: 'pending',
        label: 'Требует модерации',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertTriangle className="h-4 w-4" />
      };
    }

    if (assignments.some(a => a.is_for_calculator)) {
      return {
        status: 'approved',
        label: 'Одобрено (калькулятор)',
        color: 'bg-blue-100 text-blue-800',
        icon: <Calculator className="h-4 w-4" />
      };
    }

    return {
      status: 'approved',
      label: 'Одобрено',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-4 w-4" />
    };
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'pending') {
      return matchesSearch && (!property.category_assignments || property.category_assignments.length === 0);
    }
    if (filterStatus === 'approved') {
      return matchesSearch && property.category_assignments && property.category_assignments.length > 0;
    }
    
    return matchesSearch;
  });

  const pendingCount = properties.filter(p => !p.category_assignments || p.category_assignments.length === 0).length;
  const approvedCount = properties.filter(p => p.category_assignments && p.category_assignments.length > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка свойств...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Модерация свойств</h1>
          <p className="text-gray-600">Назначение свойств товаров категориям каталога</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-yellow-600">{pendingCount}</span> требуют модерации
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium text-green-600">{approvedCount}</span> одобрено
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск свойств..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Статус модерации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все свойства</SelectItem>
              <SelectItem value="pending">Требуют модерации</SelectItem>
              <SelectItem value="approved">Одобрены</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {filteredProperties.length} из {properties.length} свойств
            </span>
          </div>
        </div>
      </Card>

      {/* Список свойств */}
      <Card className="p-4">
        <div className="space-y-2">
          {filteredProperties.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm || filterStatus !== 'all' 
                ? 'Свойства не найдены' 
                : 'Свойства не добавлены'
              }
            </div>
          ) : (
            filteredProperties.map(property => {
              const moderationStatus = getModerationStatus(property);
              const assignments = property.category_assignments || [];

              return (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{property.name}</h3>
                      <Badge variant="outline">{getPropertyTypeLabel(property.type)}</Badge>
                      <Badge className={moderationStatus.color}>
                        <div className="flex items-center space-x-1">
                          {moderationStatus.icon}
                          <span>{moderationStatus.label}</span>
                        </div>
                      </Badge>
                      {property.is_required && (
                        <Badge variant="destructive">Обязательное</Badge>
                      )}
                    </div>
                    
                    {property.description && (
                      <p className="text-sm text-gray-600 mt-1">{property.description}</p>
                    )}
                    
                    {assignments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Назначено категориям:</p>
                        <div className="flex flex-wrap gap-1">
                          {assignments.map(assignment => (
                            <Badge key={assignment.id} variant="secondary" className="text-xs">
                              {assignment.catalog_category.name}
                              {assignment.is_for_calculator && ' (К)'}
                              {assignment.is_for_export && ' (Э)'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>ID: {property.id}</span>
                      <span>Создано: {new Date(property.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {moderationStatus.status === 'pending' ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleModerateProperty(property)}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Модерировать</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleModerateProperty(property)}
                        className="flex items-center space-x-1"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Изменить</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Диалог модерации */}
      <ModerationDialog
        open={moderateDialogOpen}
        onOpenChange={setModerateDialogOpen}
        onSubmit={handleModerationSubmit}
        property={selectedProperty}
        categories={categories}
      />
    </div>
  );
}

// Компонент диалога модерации
function ModerationDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  property,
  categories
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    categoryIds: string[];
    isRequired: boolean;
    isForCalculator: boolean;
    isForExport: boolean;
  }) => void;
  property: PropertyModerationItem | null;
  categories: CatalogCategory[];
}) {
  const [formData, setFormData] = useState({
    categoryIds: [] as string[],
    isRequired: false,
    isForCalculator: false,
    isForExport: false
  });

  useEffect(() => {
    if (property) {
      // Сбрасываем форму при смене свойства
      setFormData({
        categoryIds: [],
        isRequired: false,
        isForCalculator: false,
        isForExport: false
      });
    }
  }, [property]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId]
    }));
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Модерация свойства: {property.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Информация о свойстве */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Тип:</span>
                <span className="ml-2">{property.type}</span>
              </div>
              <div>
                <span className="font-medium">Обязательное:</span>
                <span className="ml-2">{property.is_required ? 'Да' : 'Нет'}</span>
              </div>
              {property.description && (
                <div className="col-span-2">
                  <span className="font-medium">Описание:</span>
                  <p className="mt-1 text-gray-600">{property.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Выбор категорий */}
          <div>
            <label className="block text-sm font-medium mb-3">Назначить категориям:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <Checkbox
                    checked={formData.categoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <span className="text-sm">{category.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    L{category.level}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Настройки назначения */}
          <div className="space-y-3">
            <h3 className="font-medium">Настройки назначения:</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_required_mod"
                checked={formData.isRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, isRequired: !!checked })}
              />
              <label htmlFor="is_required_mod" className="text-sm font-medium">Обязательное поле для выбранных категорий</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_calculator_mod"
                checked={formData.isForCalculator}
                onCheckedChange={(checked) => setFormData({ ...formData, isForCalculator: !!checked })}
              />
              <label htmlFor="is_for_calculator_mod" className="text-sm font-medium">Использовать в калькуляторе</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_export_mod"
                checked={formData.isForExport}
                onCheckedChange={(checked) => setFormData({ ...formData, isForExport: !!checked })}
              />
              <label htmlFor="is_for_export_mod" className="text-sm font-medium">Включить в экспорт (КП, Счет, Заказ)</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={formData.categoryIds.length === 0}>
              Назначить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
