'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Checkbox, Badge, Accordion, AccordionItem } from '../ui';
import { 
  X, 
  Save, 
  Undo2, 
  Redo2, 
  Settings, 
  Move, 
  Folder, 
  Image,
  Search,
  Package,
  Maximize2,
  Minimize2
} from 'lucide-react';
import CategoryTreeSelector from './CategoryTreeSelector';

interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  productCount: number;
  imageUrl: string;
}

interface BlockSettings {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  catalogCategoryId?: string;
  catalogCategoryInfo?: CategoryInfo;
  additionalCatalogCategories?: string[];
  imageSettings?: {
    iconSize: number;
    photoSize: number;
    showPhotoCount: boolean;
  };
  aspectRatio?: {
    enabled: boolean;
    ratio: number;
  };
}

interface DetailedBlockEditorProps {
  block: BlockSettings;
  categories: any[];
  onSave: (block: BlockSettings) => void;
  onClose: () => void;
}

const DetailedBlockEditor: React.FC<DetailedBlockEditorProps> = ({
  block,
  categories,
  onSave,
  onClose
}) => {
  const [editedBlock, setEditedBlock] = useState<BlockSettings>(block);
  const [history, setHistory] = useState<BlockSettings[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);

  // Сохраняем пропорции при открытии
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(
    block.height / block.width
  );

  useEffect(() => {
    setEditedBlock(block);
    setOriginalAspectRatio(block.height / block.width);
  }, [block]);

  // Обновляем отфильтрованные категории при изменении поиска
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  // Автоматическое обновление названия блока при выборе категории
  useEffect(() => {
    if (editedBlock?.catalogCategoryInfo && editedBlock.type === 'main-category') {
      const newName = editedBlock.catalogCategoryInfo.name;
      if (editedBlock.name !== newName) {
        handleBlockUpdate({
          ...editedBlock,
          name: newName
        });
      }
    }
  }, [editedBlock?.catalogCategoryInfo]);

  // Сохранение в историю
  const saveToHistory = (blockState: BlockSettings) => {
    const newHistory = [...history.slice(0, historyIndex + 1), blockState];
    if (newHistory.length > 5) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(Math.min(newHistory.length - 1, 4));
  };

  // Обновление блока с сохранением в историю
  const handleBlockUpdate = (updatedBlock: BlockSettings) => {
    saveToHistory(editedBlock);
    setEditedBlock(updatedBlock);
  };

  // Отмена действия
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setEditedBlock(prevState);
      setHistoryIndex(prev => prev - 1);
    }
  };

  // Повтор действия
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setEditedBlock(nextState);
      setHistoryIndex(prev => prev + 1);
    }
  };

  // Обновление размеров с сохранением пропорций
  const handleSizeChange = (field: 'width' | 'height', value: number) => {
    const updatedBlock = { ...editedBlock };
    
    if (field === 'width') {
      updatedBlock.width = Math.max(1, Math.floor(value));
      if (editedBlock.aspectRatio?.enabled) {
        updatedBlock.height = Math.floor(updatedBlock.width * editedBlock.aspectRatio.ratio);
      }
    } else {
      updatedBlock.height = Math.max(1, Math.floor(value));
      if (editedBlock.aspectRatio?.enabled) {
        updatedBlock.width = Math.floor(updatedBlock.height / editedBlock.aspectRatio.ratio);
      }
    }

    handleBlockUpdate(updatedBlock);
  };

  // Переключение сохранения пропорций
  const handleAspectRatioToggle = (enabled: boolean) => {
    const updatedBlock = { ...editedBlock };
    if (enabled) {
      const ratio = editedBlock.height / editedBlock.width;
      updatedBlock.aspectRatio = { enabled: true, ratio };
    } else {
      updatedBlock.aspectRatio = { enabled: false, ratio: originalAspectRatio };
    }

    handleBlockUpdate(updatedBlock);
  };

  // Обновление настроек изображений
  const handleImageSettingsChange = (field: string, value: any) => {
    const updatedBlock = { ...editedBlock };
    updatedBlock.imageSettings = {
      ...updatedBlock.imageSettings,
      iconSize: 32,
      photoSize: 200,
      showPhotoCount: true,
      [field]: value
    };

    handleBlockUpdate(updatedBlock);
  };

  // Сохранение изменений
  const handleSave = () => {
    onSave(editedBlock);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Подробное редактирование блока
              </h2>
            </div>
            <Badge variant="outline" className="text-sm">
              {editedBlock.name}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Отменить"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Повторить"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Левая панель - настройки */}
            <div className="w-96 border-r border-gray-200 overflow-y-auto">
              <div className="p-6">
                <Accordion>
                  <AccordionItem 
                    value="main" 
                    title="Основные" 
                    icon={<Settings className="w-4 h-4" />}
                    defaultOpen={true}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Название блока
                        </label>
                        <Input
                          value={editedBlock.name}
                          onChange={(e) => handleBlockUpdate({ ...editedBlock, name: e.target.value })}
                          placeholder="Введите название блока"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Позиция (X, Y)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={editedBlock.x}
                            onChange={(e) => handleBlockUpdate({ 
                              ...editedBlock, 
                              x: Math.floor(Number(e.target.value) || 0) 
                            })}
                            placeholder="X"
                            className="text-center"
                          />
                          <Input
                            type="number"
                            value={editedBlock.y}
                            onChange={(e) => handleBlockUpdate({ 
                              ...editedBlock, 
                              y: Math.floor(Number(e.target.value) || 0) 
                            })}
                            placeholder="Y"
                            className="text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Z-индекс
                        </label>
                        <Input
                          type="number"
                          value={editedBlock.zIndex}
                          onChange={(e) => handleBlockUpdate({ 
                            ...editedBlock, 
                            zIndex: Math.floor(Number(e.target.value) || 1) 
                          })}
                          placeholder="1"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </AccordionItem>

                  <AccordionItem 
                    value="size" 
                    title="Размеры" 
                    icon={<Move className="w-4 h-4" />}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Размеры (px)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Ширина</label>
                            <Input
                              type="number"
                              value={editedBlock.width}
                              onChange={(e) => handleSizeChange('width', Number(e.target.value) || 1)}
                              placeholder="Ширина"
                              className="text-center"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Высота</label>
                            <Input
                              type="number"
                              value={editedBlock.height}
                              onChange={(e) => handleSizeChange('height', Number(e.target.value) || 1)}
                              placeholder="Высота"
                              className="text-center"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={editedBlock.aspectRatio?.enabled || false}
                          onCheckedChange={handleAspectRatioToggle}
                        />
                        <label className="text-sm text-gray-700">
                          Сохранить пропорции
                        </label>
                      </div>

                      {editedBlock.aspectRatio?.enabled && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-700">
                            Соотношение: {editedBlock.aspectRatio.ratio.toFixed(2)}:1
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionItem>

                  <AccordionItem 
                    value="categories" 
                    title="Категории" 
                    icon={<Folder className="w-4 h-4" />}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Поиск категории
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Поиск по названию..."
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Основная категория
                        </label>
                        <CategoryTreeSelector
                          value={editedBlock.catalogCategoryId || ''}
                          onChange={(categoryId, categoryInfo) => {
                            handleBlockUpdate({
                              ...editedBlock,
                              catalogCategoryId: categoryId,
                              catalogCategoryInfo: categoryInfo
                            });
                          }}
                          categories={filteredCategories}
                        />
                      </div>

                      {editedBlock.catalogCategoryInfo && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-900">
                              {editedBlock.catalogCategoryInfo.name}
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            Товаров: {editedBlock.catalogCategoryInfo.productCount}
                          </p>
                        </div>
                      )}

                      {!editedBlock.catalogCategoryId && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-700">
                            ⚠️ Выберите категорию для отображения товаров
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionItem>

                  <AccordionItem 
                    value="images" 
                    title="Изображения" 
                    icon={<Image className="w-4 h-4" />}
                  >
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Размер иконок товаров (px)
                        </label>
                        <Input
                          type="number"
                          value={editedBlock.imageSettings?.iconSize || 32}
                          onChange={(e) => handleImageSettingsChange('iconSize', Number(e.target.value) || 32)}
                          placeholder="32"
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Размер фото товаров (px)
                        </label>
                        <Input
                          type="number"
                          value={editedBlock.imageSettings?.photoSize || 200}
                          onChange={(e) => handleImageSettingsChange('photoSize', Number(e.target.value) || 200)}
                          placeholder="200"
                          className="w-full"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={editedBlock.imageSettings?.showPhotoCount || false}
                          onCheckedChange={(checked) => handleImageSettingsChange('showPhotoCount', checked)}
                        />
                        <label className="text-sm text-gray-700">
                          Показывать количество фото
                        </label>
                      </div>

                      {editedBlock.catalogCategoryInfo && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-sm text-blue-700">
                            📷 Изображения берутся из привязанных фото товаров категории
                          </p>
                        </div>
                      )}
                    </div>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Правая панель - предпросмотр */}
            <div className="flex-1 bg-gray-50 p-6">
              <div className="bg-white rounded-lg shadow-lg p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <Package className="w-16 h-16 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {editedBlock.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {editedBlock.width} × {editedBlock.height} px
                  </p>
                  {editedBlock.catalogCategoryInfo && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-700">
                        {editedBlock.catalogCategoryInfo.name} ({editedBlock.catalogCategoryInfo.productCount} товаров)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedBlockEditor;
