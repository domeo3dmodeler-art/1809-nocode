'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui';
import { Plus, Search, Folder, FolderOpen, Edit, Trash2, Settings } from 'lucide-react';
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

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCategory = (category: CatalogCategory, level: 0) => {
    const hasChildren = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const indent = level * 20;

    return (
      <div key={category.id} className="select-none">
        <div
          className="flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer group"
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => onCategorySelect(category)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(category.id);
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-6 mr-2" />}
          
          <div className="flex-1 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.products_count || 0} товаров
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryCreate(category.id);
                }}
                className="h-6 w-6 p-0"
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
                className="h-6 w-6 p-0"
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
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {category.subcategories?.map(subcategory => 
              renderCategory(subcategory, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
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
      
      <div className="border rounded-lg">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'Категории не найдены' : 'Каталог пуст'}
          </div>
        ) : (
          filteredCategories.map(category => renderCategory(category, 0))
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
