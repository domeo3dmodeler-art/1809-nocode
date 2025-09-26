'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ProductProperty, PropertyType, CreateProductPropertyDto } from '@/lib/types/catalog';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<ProductProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<ProductProperty | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/catalog/properties');
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProperty = async (data: CreateProductPropertyDto) => {
    try {
      const response = await fetch('/api/catalog/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadProperties();
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating property:', error);
    }
  };

  const handleEditProperty = async (data: CreateProductPropertyDto) => {
    if (!propertyToEdit) return;

    try {
      const response = await fetch(`/api/catalog/properties/${propertyToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadProperties();
        setEditDialogOpen(false);
        setPropertyToEdit(null);
      }
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleDeleteProperty = async (property: ProductProperty) => {
    if (!confirm(`Удалить свойство "${property.name}"?`)) return;

    try {
      const response = await fetch(`/api/catalog/properties/${property.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadProperties();
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const getPropertyTypeLabel = (type: PropertyType): string => {
    const labels = {
      text: 'Текст',
      number: 'Число',
      select: 'Список',
      boolean: 'Да/Нет',
      date: 'Дата',
      file: 'Файл'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (property: ProductProperty) => {
    if (!property.is_active) {
      return <Badge variant="secondary">Неактивно</Badge>;
    }
    
    // Здесь можно добавить логику определения статуса модерации
    // Пока просто показываем активные свойства
    return <Badge variant="default">Активно</Badge>;
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || property.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && property.is_active) ||
      (filterStatus === 'inactive' && !property.is_active);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Свойства товаров</h1>
          <p className="text-gray-600">Модерация и управление свойствами товаров</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить свойство</span>
        </Button>
      </div>

      {/* Фильтры */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск свойств..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Тип свойства" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="text">Текст</SelectItem>
              <SelectItem value="number">Число</SelectItem>
              <SelectItem value="select">Список</SelectItem>
              <SelectItem value="boolean">Да/Нет</SelectItem>
              <SelectItem value="date">Дата</SelectItem>
              <SelectItem value="file">Файл</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="inactive">Неактивные</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              {properties.filter(p => p.is_active).length} активных
            </span>
          </div>
        </div>
      </Card>

      {/* Список свойств */}
      <Card className="p-4">
        <div className="space-y-2">
          {filteredProperties.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'Свойства не найдены' 
                : 'Свойства не добавлены'
              }
            </div>
          ) : (
            filteredProperties.map(property => (
              <div
                key={property.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{property.name}</h3>
                    <Badge variant="outline">{getPropertyTypeLabel(property.type)}</Badge>
                    {getStatusBadge(property)}
                    {property.is_required && (
                      <Badge variant="destructive">Обязательное</Badge>
                    )}
                  </div>
                  {property.description && (
                    <p className="text-sm text-gray-600 mt-1">{property.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>ID: {property.id}</span>
                    <span>Создано: {new Date(property.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPropertyToEdit(property);
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProperty(property)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Диалог создания свойства */}
      <CreatePropertyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateProperty}
      />

      {/* Диалог редактирования свойства */}
      <EditPropertyDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditProperty}
        property={propertyToEdit}
      />
    </div>
  );
}

// Компоненты диалогов
function CreatePropertyDialog({ 
  open, 
  onOpenChange, 
  onSubmit 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProductPropertyDto) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as PropertyType,
    description: '',
    options: [] as string[],
    is_required: false,
    is_active: true
  });
  const [newOption, setNewOption] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      type: 'text',
      description: '',
      options: [],
      is_required: false,
      is_active: true
    });
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Создать свойство</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название свойства"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип</label>
            <Select value={formData.type} onValueChange={(value: PropertyType) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Текст</SelectItem>
                <SelectItem value="number">Число</SelectItem>
                <SelectItem value="select">Список</SelectItem>
                <SelectItem value="boolean">Да/Нет</SelectItem>
                <SelectItem value="date">Дата</SelectItem>
                <SelectItem value="file">Файл</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание свойства (необязательно)"
            />
          </div>

          {formData.type === 'select' && (
            <div>
              <label className="block text-sm font-medium mb-1">Варианты выбора</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Добавить вариант"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  />
                  <Button type="button" onClick={addOption} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{option}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_required"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_required" className="text-sm font-medium">Обязательное поле</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium">Активно</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Создать</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditPropertyDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  property 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProductPropertyDto) => void;
  property: ProductProperty | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'text' as PropertyType,
    description: '',
    options: [] as string[],
    is_required: false,
    is_active: true
  });
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        type: property.type,
        description: property.description || '',
        options: property.options ? JSON.parse(property.options) : [],
        is_required: property.is_required,
        is_active: property.is_active
      });
    }
  }, [property]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData({
        ...formData,
        options: [...formData.options, newOption.trim()]
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать свойство</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название свойства"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип</label>
            <Select value={formData.type} onValueChange={(value: PropertyType) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Текст</SelectItem>
                <SelectItem value="number">Число</SelectItem>
                <SelectItem value="select">Список</SelectItem>
                <SelectItem value="boolean">Да/Нет</SelectItem>
                <SelectItem value="date">Дата</SelectItem>
                <SelectItem value="file">Файл</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Описание свойства (необязательно)"
            />
          </div>

          {formData.type === 'select' && (
            <div>
              <label className="block text-sm font-medium mb-1">Варианты выбора</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Добавить вариант"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                  />
                  <Button type="button" onClick={addOption} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{option}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_required_edit"
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_required_edit" className="text-sm font-medium">Обязательное поле</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active_edit"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_active_edit" className="text-sm font-medium">Активно</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
