'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '../../../../components/ui';
import { Plus, Search, Edit, Trash2, ArrowUp, ArrowDown, Settings, Package, Link } from 'lucide-react';

interface ConfiguratorCategory {
  id: string;
  name: string;
  slug: string;
}

interface CatalogCategory {
  id: string;
  name: string;
  level: number;
  path: string;
}

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
  configurator_category: ConfiguratorCategory;
  catalog_category: CatalogCategory;
}

export default function CategoryLinksPage() {
  const [links, setLinks] = useState<CategoryLink[]>([]);
  const [configuratorCategories, setConfiguratorCategories] = useState<ConfiguratorCategory[]>([]);
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfiguratorCategory, setSelectedConfiguratorCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<CategoryLink | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedConfiguratorCategory) {
      loadLinks(selectedConfiguratorCategory);
    }
  }, [selectedConfiguratorCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configuratorRes, catalogRes] = await Promise.all([
        fetch('/api/frontend-categories'),
        fetch('/api/catalog/categories')
      ]);

      const configuratorData = await configuratorRes.json();
      const catalogData = await catalogRes.json();

      setConfiguratorCategories(configuratorData.categories || []);
      setCatalogCategories(catalogData.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLinks = async (configuratorCategoryId: string) => {
    try {
      const response = await fetch(`/api/configurator/category-links?configuratorCategoryId=${configuratorCategoryId}`);
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error('Error loading links:', error);
    }
  };

  const handleCreateLink = async (data: any) => {
    try {
      const response = await fetch('/api/configurator/category-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadLinks(selectedConfiguratorCategory);
        setCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating link:', error);
    }
  };

  const handleEditLink = async (data: any) => {
    if (!linkToEdit) return;

    try {
      const response = await fetch(`/api/configurator/category-links/${linkToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadLinks(selectedConfiguratorCategory);
        setEditDialogOpen(false);
        setLinkToEdit(null);
      }
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const handleDeleteLink = async (link: CategoryLink) => {
    if (!confirm(`Удалить связь "${link.catalog_category.name}"?`)) return;

    try {
      const response = await fetch(`/api/configurator/category-links/${link.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadLinks(selectedConfiguratorCategory);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleMoveUp = async (link: CategoryLink) => {
    const currentIndex = links.findIndex(l => l.id === link.id);
    if (currentIndex <= 0) return;

    const newOrder = links[currentIndex - 1].display_order;
    const oldOrder = link.display_order;

    try {
      await fetch(`/api/configurator/category-links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: newOrder })
      });

      await fetch(`/api/configurator/category-links/${links[currentIndex - 1].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: oldOrder })
      });

      await loadLinks(selectedConfiguratorCategory);
    } catch (error) {
      console.error('Error moving link:', error);
    }
  };

  const handleMoveDown = async (link: CategoryLink) => {
    const currentIndex = links.findIndex(l => l.id === link.id);
    if (currentIndex >= links.length - 1) return;

    const newOrder = links[currentIndex + 1].display_order;
    const oldOrder = link.display_order;

    try {
      await fetch(`/api/configurator/category-links/${link.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: newOrder })
      });

      await fetch(`/api/configurator/category-links/${links[currentIndex + 1].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: oldOrder })
      });

      await loadLinks(selectedConfiguratorCategory);
    } catch (error) {
      console.error('Error moving link:', error);
    }
  };

  const getLinkTypeLabel = (type: string) => {
    return type === 'main' ? 'Основная' : 'Дополнительная';
  };

  const getPricingTypeLabel = (type: string) => {
    const labels = {
      separate: 'Отдельная строка',
      included: 'Включено в цену',
      formula: 'По формуле'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredLinks = links.filter(link =>
    link.catalog_category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и выбор конфигуратора */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Связи категорий конфигуратора</h1>
          <p className="text-gray-600">Настройка основных и дополнительных категорий для конфигураторов</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={!selectedConfiguratorCategory}
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить связь</span>
        </Button>
      </div>

      {/* Выбор конфигуратора */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Категория конфигуратора</label>
            <Select value={selectedConfiguratorCategory} onValueChange={setSelectedConfiguratorCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите конфигуратор" />
              </SelectTrigger>
              <SelectContent>
                {configuratorCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedConfiguratorCategory && (
            <div className="text-sm text-gray-600">
              Найдено связей: {links.length}
            </div>
          )}
        </div>
      </Card>

      {selectedConfiguratorCategory && (
        <>
          {/* Поиск */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию категории..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Список связей */}
          <Card className="p-4">
            <div className="space-y-2">
              {filteredLinks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Link className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">
                    {searchTerm ? 'Связи не найдены' : 'Связи не настроены'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {searchTerm 
                      ? 'Попробуйте изменить поисковый запрос' 
                      : 'Добавьте связи между категориями конфигуратора и каталога'
                    }
                  </p>
                </div>
              ) : (
                filteredLinks.map(link => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {link.link_type === 'main' ? (
                            <Package className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Settings className="h-4 w-4 text-green-600" />
                          )}
                          <h3 className="font-medium">{link.catalog_category.name}</h3>
                        </div>
                        <Badge variant={link.link_type === 'main' ? 'default' : 'secondary'}>
                          {getLinkTypeLabel(link.link_type)}
                        </Badge>
                        <Badge variant="outline">
                          {getPricingTypeLabel(link.pricing_type)}
                        </Badge>
                        {link.is_required && (
                          <Badge variant="destructive">Обязательная</Badge>
                        )}
                        {link.export_as_separate && (
                          <Badge variant="outline">Отдельно в экспорте</Badge>
                        )}
                      </div>
                      {link.formula && (
                        <p className="text-sm text-gray-600 mt-1">Формула: {link.formula}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveUp(link)}
                        disabled={links.indexOf(link) === 0}
                        title="Переместить вверх"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveDown(link)}
                        disabled={links.indexOf(link) === links.length - 1}
                        title="Переместить вниз"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLinkToEdit(link);
                          setEditDialogOpen(true);
                        }}
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(link)}
                        className="text-red-600 hover:text-red-700"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      )}

      {/* Диалог создания связи */}
      <CreateLinkDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateLink}
        configuratorCategoryId={selectedConfiguratorCategory}
        catalogCategories={catalogCategories}
        existingLinks={links}
      />

      {/* Диалог редактирования связи */}
      <EditLinkDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditLink}
        link={linkToEdit}
      />
    </div>
  );
}

// Компонент диалога создания связи
function CreateLinkDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  configuratorCategoryId,
  catalogCategories,
  existingLinks
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  configuratorCategoryId: string;
  catalogCategories: CatalogCategory[];
  existingLinks: CategoryLink[];
}) {
  const [formData, setFormData] = useState({
    catalog_category_id: '',
    link_type: 'additional' as 'main' | 'additional',
    display_order: 0,
    is_required: false,
    pricing_type: 'separate' as 'separate' | 'included' | 'formula',
    formula: '',
    export_as_separate: true
  });

  useEffect(() => {
    if (open) {
      setFormData({
        catalog_category_id: '',
        link_type: 'additional',
        display_order: existingLinks.length,
        is_required: false,
        pricing_type: 'separate',
        formula: '',
        export_as_separate: true
      });
    }
  }, [open, existingLinks.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      configurator_category_id: configuratorCategoryId,
      ...formData
    });
  };

  const availableCategories = catalogCategories.filter(cat => 
    !existingLinks.some(link => link.catalog_category_id === cat.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить связь категории</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Категория каталога</label>
            <Select 
              value={formData.catalog_category_id} 
              onValueChange={(value) => setFormData({ ...formData, catalog_category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип связи</label>
            <Select 
              value={formData.link_type} 
              onValueChange={(value: 'main' | 'additional') => setFormData({ ...formData, link_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Основная</SelectItem>
                <SelectItem value="additional">Дополнительная</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип ценообразования</label>
            <Select 
              value={formData.pricing_type} 
              onValueChange={(value: 'separate' | 'included' | 'formula') => setFormData({ ...formData, pricing_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="separate">Отдельная строка</SelectItem>
                <SelectItem value="included">Включено в цену</SelectItem>
                <SelectItem value="formula">По формуле</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.pricing_type === 'formula' && (
            <div>
              <label className="block text-sm font-medium mb-1">Формула</label>
              <Input
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder="Например: price * 1.1"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center">
              <Checkbox
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              />
              <span className="ml-2 text-sm">Обязательная категория</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={formData.export_as_separate}
                onChange={(e) => setFormData({ ...formData, export_as_separate: e.target.checked })}
              />
              <span className="ml-2 text-sm">Отдельной строкой в экспорте</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!formData.catalog_category_id}>
              Создать
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Компонент диалога редактирования связи
function EditLinkDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  link 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  link: CategoryLink | null;
}) {
  const [formData, setFormData] = useState({
    link_type: 'additional' as 'main' | 'additional',
    is_required: false,
    pricing_type: 'separate' as 'separate' | 'included' | 'formula',
    formula: '',
    export_as_separate: true
  });

  useEffect(() => {
    if (link && open) {
      setFormData({
        link_type: link.link_type,
        is_required: link.is_required,
        pricing_type: link.pricing_type,
        formula: link.formula || '',
        export_as_separate: link.export_as_separate
      });
    }
  }, [link, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать связь "{link.catalog_category.name}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Тип связи</label>
            <Select 
              value={formData.link_type} 
              onValueChange={(value: 'main' | 'additional') => setFormData({ ...formData, link_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Основная</SelectItem>
                <SelectItem value="additional">Дополнительная</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Тип ценообразования</label>
            <Select 
              value={formData.pricing_type} 
              onValueChange={(value: 'separate' | 'included' | 'formula') => setFormData({ ...formData, pricing_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="separate">Отдельная строка</SelectItem>
                <SelectItem value="included">Включено в цену</SelectItem>
                <SelectItem value="formula">По формуле</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.pricing_type === 'formula' && (
            <div>
              <label className="block text-sm font-medium mb-1">Формула</label>
              <Input
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder="Например: price * 1.1"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center">
              <Checkbox
                checked={formData.is_required}
                onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              />
              <span className="ml-2 text-sm">Обязательная категория</span>
            </label>
            <label className="flex items-center">
              <Checkbox
                checked={formData.export_as_separate}
                onChange={(e) => setFormData({ ...formData, export_as_separate: e.target.checked })}
              />
              <span className="ml-2 text-sm">Отдельной строкой в экспорте</span>
            </label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
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
