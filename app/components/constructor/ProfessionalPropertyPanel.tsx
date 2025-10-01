'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Checkbox, Badge, Accordion, AccordionItem } from '../ui';
import { 
  Undo2, 
  Redo2, 
  Settings, 
  Move, 
  Folder, 
  Image,
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  Maximize2
} from 'lucide-react';
import CategoryTreeSelector from './CategoryTreeSelector';
import DetailedBlockEditor from './DetailedBlockEditor';

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

interface ProfessionalPropertyPanelProps {
  selectedBlock: BlockSettings | null;
  onBlockUpdate: (block: BlockSettings) => void;
  categories: any[];
  onCategoryChange?: (categoryId: string, categoryInfo: CategoryInfo) => void;
}

interface HistoryState {
  action: string;
  timestamp: number;
  blockState: BlockSettings;
}

const ProfessionalPropertyPanel: React.FC<ProfessionalPropertyPanelProps> = ({
  selectedBlock,
  onBlockUpdate,
  categories,
  onCategoryChange
}) => {
  const [showDetailedEditor, setShowDetailedEditor] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(categories);

  // Обновляем отфильтрованные категории при изменении поиска
  useEffect(() => {
    console.log('Categories received:', categories);
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
    if (selectedBlock?.catalogCategoryInfo && selectedBlock.type === 'main-category') {
      const newName = selectedBlock.catalogCategoryInfo.name;
      if (selectedBlock.name !== newName) {
        handleBlockUpdate({
          ...selectedBlock,
          name: newName
        });
      }
    }
  }, [selectedBlock?.catalogCategoryInfo]);

  // Сохранение в историю
  const saveToHistory = useCallback((action: string, blockState: BlockSettings) => {
    const newHistoryState: HistoryState = {
      action,
      timestamp: Date.now(),
      blockState: { ...blockState }
    };

    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newHistoryState];
      // Ограничиваем историю до 5 действий
      if (newHistory.length > 5) {
        return newHistory.slice(-5);
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 4));
  }, [historyIndex]);

  // Обновление блока с сохранением в историю
  const handleBlockUpdate = useCallback((updatedBlock: BlockSettings) => {
    if (selectedBlock) {
      saveToHistory('update', selectedBlock);
    }
    onBlockUpdate(updatedBlock);
  }, [selectedBlock, onBlockUpdate, saveToHistory]);

  // Отмена действия
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && selectedBlock) {
      const prevState = history[historyIndex - 1];
      onBlockUpdate(prevState.blockState);
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex, history, selectedBlock, onBlockUpdate]);

  // Повтор действия
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1 && selectedBlock) {
      const nextState = history[historyIndex + 1];
      onBlockUpdate(nextState.blockState);
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history, selectedBlock, onBlockUpdate]);

  // Обновление размеров с сохранением пропорций
  const handleSizeChange = useCallback((field: 'width' | 'height', value: number) => {
    if (!selectedBlock) return;

    const updatedBlock = { ...selectedBlock };
    
    if (field === 'width') {
      updatedBlock.width = Math.max(1, Math.floor(value));
      if (updatedBlock.aspectRatio?.enabled) {
        updatedBlock.height = Math.floor(updatedBlock.width * updatedBlock.aspectRatio.ratio);
      }
    } else {
      updatedBlock.height = Math.max(1, Math.floor(value));
      if (updatedBlock.aspectRatio?.enabled) {
        updatedBlock.width = Math.floor(updatedBlock.height / updatedBlock.aspectRatio.ratio);
      }
    }

    handleBlockUpdate(updatedBlock);
  }, [selectedBlock, handleBlockUpdate]);

  // Переключение сохранения пропорций
  const handleAspectRatioToggle = useCallback((enabled: boolean) => {
    if (!selectedBlock) return;

    const updatedBlock = { ...selectedBlock };
    if (enabled) {
      const ratio = updatedBlock.height / updatedBlock.width;
      updatedBlock.aspectRatio = { enabled: true, ratio };
    } else {
      updatedBlock.aspectRatio = { enabled: false, ratio: 1 };
    }

    handleBlockUpdate(updatedBlock);
  }, [selectedBlock, handleBlockUpdate]);

  // Обновление настроек изображений
  const handleImageSettingsChange = useCallback((field: string, value: any) => {
    if (!selectedBlock) return;

    const updatedBlock = { ...selectedBlock };
    updatedBlock.imageSettings = {
      ...updatedBlock.imageSettings,
      iconSize: 32,
      photoSize: 200,
      showPhotoCount: true,
      [field]: value
    };

    handleBlockUpdate(updatedBlock);
  }, [selectedBlock, handleBlockUpdate]);

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Выберите блок для настройки</p>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
        {/* Заголовок панели */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Настройки блока
            </h3>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailedEditor(true)}
                title="Подробное редактирование"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
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
            </div>
          </div>

          {/* Информация о блоке */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-900">{selectedBlock.name}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {selectedBlock.type}
            </Badge>
          </div>
        </div>

        {/* Аккордеон с настройками */}
        <div className="flex-1 overflow-y-auto p-4">
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
                    value={selectedBlock.name}
                    onChange={(e) => handleBlockUpdate({ ...selectedBlock, name: e.target.value })}
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
                      value={selectedBlock.x}
                      onChange={(e) => handleBlockUpdate({ 
                        ...selectedBlock, 
                        x: Math.floor(Number(e.target.value) || 0) 
                      })}
                      placeholder="X"
                      className="text-center"
                    />
                    <Input
                      type="number"
                      value={selectedBlock.y}
                      onChange={(e) => handleBlockUpdate({ 
                        ...selectedBlock, 
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
                    value={selectedBlock.zIndex}
                    onChange={(e) => handleBlockUpdate({ 
                      ...selectedBlock, 
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
                        value={selectedBlock.width}
                        onChange={(e) => handleSizeChange('width', Number(e.target.value) || 1)}
                        placeholder="Ширина"
                        className="text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Высота</label>
                      <Input
                        type="number"
                        value={selectedBlock.height}
                        onChange={(e) => handleSizeChange('height', Number(e.target.value) || 1)}
                        placeholder="Высота"
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedBlock.aspectRatio?.enabled || false}
                    onCheckedChange={handleAspectRatioToggle}
                  />
                  <label className="text-sm text-gray-700">
                    Сохранить пропорции
                  </label>
                </div>

                {selectedBlock.aspectRatio?.enabled && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      Соотношение: {selectedBlock.aspectRatio.ratio.toFixed(2)}:1
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
                    value={selectedBlock.catalogCategoryId || ''}
                    onChange={(categoryId, categoryInfo) => {
                      handleBlockUpdate({
                        ...selectedBlock,
                        catalogCategoryId: categoryId,
                        catalogCategoryInfo: categoryInfo
                      });
                      if (onCategoryChange) {
                        onCategoryChange(categoryId, categoryInfo);
                      }
                    }}
                    categories={filteredCategories}
                  />
                </div>

                {selectedBlock.catalogCategoryInfo && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">
                        {selectedBlock.catalogCategoryInfo.name}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Товаров: {selectedBlock.catalogCategoryInfo.productCount}
                    </p>
                  </div>
                )}

                {!selectedBlock.catalogCategoryId && (
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
                    value={selectedBlock.imageSettings?.iconSize || 32}
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
                    value={selectedBlock.imageSettings?.photoSize || 200}
                    onChange={(e) => handleImageSettingsChange('photoSize', Number(e.target.value) || 200)}
                    placeholder="200"
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedBlock.imageSettings?.showPhotoCount || false}
                    onCheckedChange={(checked) => handleImageSettingsChange('showPhotoCount', checked)}
                  />
                  <label className="text-sm text-gray-700">
                    Показывать количество фото
                  </label>
                </div>

                {selectedBlock.catalogCategoryInfo && (
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

      {/* Детальный редактор */}
      {showDetailedEditor && (
        <DetailedBlockEditor
          block={selectedBlock}
          categories={categories}
          onSave={(updatedBlock) => {
            handleBlockUpdate(updatedBlock);
            setShowDetailedEditor(false);
          }}
          onClose={() => setShowDetailedEditor(false)}
        />
      )}
    </>
  );
};

export default ProfessionalPropertyPanel;
