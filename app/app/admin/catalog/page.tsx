'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui';
import { Plus, Search, Folder, FolderOpen, Edit, Trash2, Settings, ChevronRight, ChevronDown, Package, Package2 } from 'lucide-react';
import { CatalogCategory, CreateCatalogCategoryDto } from '@/lib/types/catalog';

interface CatalogTreeProps {
  categories: CatalogCategory[];
  onCategorySelect: (category: CatalogCategory) => void;
  onCategoryCreate: (parentId?: string) => void;
  onCategoryEdit: (category: CatalogCategory) => void;
  onCategoryDelete: (category: CatalogCategory) => void;
}

function CatalogTree({ 
  categories, 
  onCategorySelect, 
  onCategoryCreate, 
  onCategoryEdit, 
  onCategoryDelete 
}: CatalogTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CatalogCategory[]>([]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCategorySelect = (category: CatalogCategory) => {
    setSelectedCategory(category);
    onCategorySelect(category);
    
    // Обновляем хлебные крошки
    const buildBreadcrumbs = (cat: CatalogCategory, allCategories: CatalogCategory[]): CatalogCategory[] => {
      const crumbs: CatalogCategory[] = [cat];
      // Здесь можно добавить логику для построения полного пути
      return crumbs;
    };
    
    setBreadcrumbs(buildBreadcrumbs(category, categories));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCategory = (category: CatalogCategory, level: number = 0) => {
    const hasChildren = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const indent = level * 24; // Увеличиваем отступ для лучшей визуализации

    return (
      <div key={category.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 cursor-pointer group transition-colors duration-150 ${
            level === 0 
              ? 'hover:bg-blue-50 border-l-2 border-transparent hover:border-blue-200' 
              : 'hover:bg-gray-50'
          }`}
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => handleCategorySelect(category)}
        >
          {/* Индикатор раскрытия/сворачивания */}
          <div className="flex items-center w-6 mr-2">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(category.id);
                }}
                className="p-1 hover:bg-gray-200 rounded transition-colors duration-150"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
              </div>
            )}
          </div>

          {/* Иконка категории */}
          <div className="mr-3">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <Package2 className="h-4 w-4 text-gray-400" />
            )}
          </div>
          
          {/* Основной контент */}
          <div className="flex-1 flex items-center justify-between min-w-0">
            <div className="flex items-center space-x-3 min-w-0">
              <span className={`font-medium truncate ${
                level === 0 ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {category.name}
              </span>
              
              {/* Счетчик товаров */}
              <Badge 
                variant="secondary" 
                className={`text-xs shrink-0 ${
                  (category.products_count || 0) > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {category.products_count || 0}
              </Badge>
            </div>
            
            {/* Действия (показываются при наведении) */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryCreate(category.id);
                }}
                className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
                title="Добавить подкатегорию"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryEdit(category);
                }}
                className="h-7 w-7 p-0 hover:bg-gray-100"
                title="Редактировать"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryDelete(category);
                }}
                className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                title="Удалить"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Подкатегории с анимацией */}
        {hasChildren && isExpanded && (
          <div className="overflow-hidden">
            <div className="transition-all duration-200 ease-in-out">
              {category.subcategories?.map(subcategory => 
                renderCategory(subcategory, level + 1)
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Поиск и действия */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск категорий..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => onCategoryCreate()}
          size="sm"
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить</span>
        </Button>
      </div>

      {/* Хлебные крошки */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
          <span>Путь:</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
              <button
                onClick={() => handleCategorySelect(crumb)}
                className="hover:text-blue-600 transition-colors duration-150"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Информация о выбранной категории */}
      {selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">{selectedCategory.name}</h3>
              <p className="text-sm text-blue-700">
                Уровень {selectedCategory.level} • {selectedCategory.products_count || 0} товаров
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCategoryEdit(selectedCategory)}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <Edit className="h-3 w-3 mr-1" />
                Редактировать
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {searchTerm ? 'Категории не найдены' : 'Каталог пуст'}
            </p>
            <p className="text-sm text-gray-400">
              {searchTerm 
                ? 'Попробуйте изменить поисковый запрос' 
                : 'Добавьте категории или импортируйте каталог'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCategories.map(category => renderCategory(category, 0))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CatalogCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CatalogCategory | null>(null);
  const [newCategoryParent, setNewCategoryParent] = useState<string | undefined>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/catalog/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: CatalogCategory) => {
    setSelectedCategory(category);
  };

  const handleCategoryCreate = (parentId?: string) => {
    setNewCategoryParent(parentId);
    setCreateDialogOpen(true);
  };

  const handleCategoryEdit = (category: CatalogCategory) => {
    setCategoryToEdit(category);
    setEditDialogOpen(true);
  };

  const handleCategoryDelete = (category: CatalogCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleCreateCategory = async (data: CreateCatalogCategoryDto) => {
    try {
      const response = await fetch('/api/catalog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          parent_id: newCategoryParent
        })
      });

      if (response.ok) {
        await loadCategories();
        setCreateDialogOpen(false);
        setNewCategoryParent(undefined);
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleEditCategory = async (data: CreateCatalogCategoryDto) => {
    if (!categoryToEdit) return;

    try {
      const response = await fetch(`/api/catalog/categories/${categoryToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadCategories();
        setEditDialogOpen(false);
        setCategoryToEdit(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`/api/catalog/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadCategories();
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка каталога...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Дерево каталога</h2>
            <CatalogTree
              categories={categories}
              onCategorySelect={handleCategorySelect}
              onCategoryCreate={handleCategoryCreate}
              onCategoryEdit={handleCategoryEdit}
              onCategoryDelete={handleCategoryDelete}
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-4">
            {selectedCategory ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{selectedCategory.name}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Настройки</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">ID:</span>
                    <span className="ml-2 text-gray-600">{selectedCategory.id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Уровень:</span>
                    <span className="ml-2 text-gray-600">{selectedCategory.level}</span>
                  </div>
                  <div>
                    <span className="font-medium">Путь:</span>
                    <span className="ml-2 text-gray-600">{selectedCategory.path}</span>
                  </div>
                  <div>
                    <span className="font-medium">Товаров:</span>
                    <span className="ml-2 text-gray-600">{selectedCategory.products_count || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Выберите категорию для просмотра деталей
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Диалог создания категории */}
      <CreateCategoryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateCategory}
        parentId={newCategoryParent}
      />

      {/* Диалог редактирования категории */}
      <EditCategoryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditCategory}
        category={categoryToEdit}
      />

      {/* Диалог удаления категории */}
      <DeleteCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteCategory}
        category={categoryToDelete}
      />
    </div>
  );
}

// Компоненты диалогов
function CreateCategoryDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  parentId 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCatalogCategoryDto) => void;
  parentId?: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    sort_order: 0,
    is_active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', sort_order: 0, is_active: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать категорию</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название категории"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Порядок сортировки</label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm font-medium">Активна</label>
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

function EditCategoryDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  category 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCatalogCategoryDto) => void;
  category: CatalogCategory | null;
}) {
  const [formData, setFormData] = useState({
    name: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        sort_order: category.sort_order,
        is_active: category.is_active
      });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать категорию</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название категории"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Порядок сортировки</label>
            <Input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active_edit"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active_edit" className="text-sm font-medium">Активна</label>
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

function DeleteCategoryDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  category 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  category: CatalogCategory | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить категорию</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">
            Вы уверены, что хотите удалить категорию "{category?.name}"?
          </p>
          <p className="text-sm text-red-600">
            Это действие нельзя отменить. Все подкатегории и товары также будут удалены.
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
              Удалить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
