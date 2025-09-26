'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '../../../../../components/ui';
import { Plus, Search, Edit, Trash2, Calculator, FileText, Settings, CheckCircle, XCircle } from 'lucide-react';
import { CatalogCategory, ProductProperty, CategoryPropertyAssignment, CreatePropertyAssignmentDto } from '@/lib/types/catalog';

export default function PropertyAssignmentsPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [properties, setProperties] = useState<ProductProperty[]>([]);
  const [assignments, setAssignments] = useState<CategoryPropertyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<CategoryPropertyAssignment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, propertiesRes] = await Promise.all([
        fetch('/api/catalog/categories'),
        fetch('/api/catalog/properties')
      ]);

      const categoriesData = await categoriesRes.json();
      const propertiesData = await propertiesRes.json();

      setCategories(categoriesData.categories || []);
      setProperties(propertiesData.properties || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/catalog/categories/${categoryId}`);
      const data = await response.json();
      setAssignments(data.property_assignments || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadAssignments(categoryId);
  };

  const handleCreateAssignment = async (data: CreatePropertyAssignmentDto) => {
    try {
      const response = await fetch('/api/catalog/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadAssignments(data.catalog_category_id);
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleEditAssignment = async (id: string, data: Partial<CreatePropertyAssignmentDto>) => {
    try {
      const response = await fetch(`/api/catalog/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadAssignments(selectedCategory);
        setEditDialogOpen(false);
        setAssignmentToEdit(null);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Удалить назначение свойства?')) return;

    try {
      const response = await fetch(`/api/catalog/assignments/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadAssignments(selectedCategory);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
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

  const getUsageBadges = (assignment: CategoryPropertyAssignment) => {
    const badges = [];
    
    if (assignment.is_required) {
      badges.push(<Badge key="required" variant="destructive">Обязательное</Badge>);
    }
    
    if (assignment.is_for_calculator) {
      badges.push(<Badge key="calculator" variant="default" className="bg-blue-100 text-blue-800">Калькулятор</Badge>);
    }
    
    if (assignment.is_for_export) {
      badges.push(<Badge key="export" variant="default" className="bg-green-100 text-green-800">Экспорт</Badge>);
    }

    return badges;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const property = properties.find(p => p.id === assignment.product_property_id);
    return property?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={!selectedCategory}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Назначить свойство</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Список категорий */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Категории каталога</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {categories.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Категории не найдены
                </div>
              ) : (
                categories.map(category => (
                  <div
                    key={category.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <p className="text-xs text-gray-500">Уровень {category.level}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.products_count || 0}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Назначенные свойства */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            {selectedCategory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Назначенные свойства товаров
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Поиск свойств..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>

                {filteredAssignments.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    {searchTerm ? 'Свойства не найдены' : 'Свойства не назначены'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAssignments.map(assignment => {
                      const property = properties.find(p => p.id === assignment.product_property_id);
                      if (!property) return null;

                      return (
                        <div
                          key={assignment.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium">{property.name}</h3>
                              <Badge variant="outline">{getPropertyTypeLabel(property.type)}</Badge>
                              {getUsageBadges(assignment)}
                            </div>
                            {property.description && (
                              <p className="text-sm text-gray-600 mt-1">{property.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Порядок: {assignment.sort_order}</span>
                              <span>Создано: {new Date(assignment.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAssignmentToEdit(assignment);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Выберите категорию для просмотра назначенных свойств
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Диалог создания назначения */}
      <CreateAssignmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateAssignment}
        categoryId={selectedCategory}
        properties={properties}
        existingAssignments={assignments}
      />

      {/* Диалог редактирования назначения */}
      <EditAssignmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditAssignment}
        assignment={assignmentToEdit}
      />
    </div>
  );
}

// Компоненты диалогов
function CreateAssignmentDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categoryId,
  properties,
  existingAssignments
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePropertyAssignmentDto) => void;
  categoryId: string;
  properties: ProductProperty[];
  existingAssignments: CategoryPropertyAssignment[];
}) {
  const [formData, setFormData] = useState({
    product_property_id: '',
    is_required: false,
    is_for_calculator: false,
    is_for_export: false,
    sort_order: 0
  });

  const availableProperties = properties.filter(property => 
    !existingAssignments.some(assignment => assignment.product_property_id === property.id)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      catalog_category_id: categoryId,
      ...formData
    });
    setFormData({
      product_property_id: '',
      is_required: false,
      is_for_calculator: false,
      is_for_export: false,
      sort_order: 0
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Назначить свойство категории</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Свойство</label>
            <Select value={formData.product_property_id} onValueChange={(value) => setFormData({ ...formData, product_property_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите свойство" />
              </SelectTrigger>
              <SelectContent>
                {availableProperties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} ({property.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Порядок сортировки</label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: !!checked })}
              />
              <label htmlFor="is_required" className="text-sm font-medium">Обязательное поле</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_calculator"
                checked={formData.is_for_calculator}
                onCheckedChange={(checked) => setFormData({ ...formData, is_for_calculator: !!checked })}
              />
              <label htmlFor="is_for_calculator" className="text-sm font-medium">Использовать в калькуляторе</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_export"
                checked={formData.is_for_export}
                onCheckedChange={(checked) => setFormData({ ...formData, is_for_export: !!checked })}
              />
              <label htmlFor="is_for_export" className="text-sm font-medium">Включить в экспорт</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!formData.product_property_id}>
              Назначить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditAssignmentDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  assignment 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: Partial<CreatePropertyAssignmentDto>) => void;
  assignment: CategoryPropertyAssignment | null;
}) {
  const [formData, setFormData] = useState({
    is_required: false,
    is_for_calculator: false,
    is_for_export: false,
    sort_order: 0
  });

  useEffect(() => {
    if (assignment) {
      setFormData({
        is_required: assignment.is_required,
        is_for_calculator: assignment.is_for_calculator,
        is_for_export: assignment.is_for_export,
        sort_order: assignment.sort_order
      });
    }
  }, [assignment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (assignment) {
      onSubmit(assignment.id, formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать назначение свойства</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Порядок сортировки</label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_required_edit"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: !!checked })}
              />
              <label htmlFor="is_required_edit" className="text-sm font-medium">Обязательное поле</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_calculator_edit"
                checked={formData.is_for_calculator}
                onCheckedChange={(checked) => setFormData({ ...formData, is_for_calculator: !!checked })}
              />
              <label htmlFor="is_for_calculator_edit" className="text-sm font-medium">Использовать в калькуляторе</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_for_export_edit"
                checked={formData.is_for_export}
                onCheckedChange={(checked) => setFormData({ ...formData, is_for_export: !!checked })}
              />
              <label htmlFor="is_for_export_edit" className="text-sm font-medium">Включить в экспорт</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
