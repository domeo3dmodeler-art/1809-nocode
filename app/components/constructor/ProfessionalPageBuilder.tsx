'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CategoryTreeSelector from './CategoryTreeSelector';
import ProfessionalBlock from './ProfessionalBlock';
import ProfessionalPropertyPanel from './ProfessionalPropertyPanel';
import { Button, Input, Select, Card, Checkbox, Badge } from '../ui';
import { 
  Layout, 
  Settings, 
  ShoppingCart, 
  Package, 
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  Image,
  Filter,
  Type,
  Palette,
  Move,
  Copy,
  ZoomIn,
  Grid,
  Grip,
  Maximize2,
  Minimize2,
  Crop,
  CornerUpLeft,
  CornerUpRight,
  ChevronDown,
  ChevronRight,
  Search,
  Sliders,
  Calculator,
  FileText,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

// ===== ТИПЫ И ИНТЕРФЕЙСЫ =====

interface DragItem {
  id: string;
  type: string;
  source: 'palette' | 'canvas';
}

interface BlockType {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'layout' | 'content' | 'interaction' | 'data';
  description: string;
  defaultSettings: Partial<BlockSettings>;
}

interface BlockSettings {
  id: string;
  name: string;
  type: string;
  
  // Позиция и размеры
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Основные настройки
  categoryId?: string;
  subcategoryIds?: string[];
  additionalCategoryIds?: string[];
  
  // Связь с категориями товаров из каталога
  catalogCategoryId?: string;
  catalogCategoryInfo?: {
    id: string;
    name: string;
    description?: string;
    productCount: number;
    imageUrl?: string;
  };
  additionalCatalogCategories?: {
    id: string;
    name: string;
    description?: string;
    productCount: number;
    imageUrl?: string;
  }[];
  
  // Настройки отображения
  layout: 'grid' | 'list' | 'masonry' | 'carousel';
  columns: number;
  itemsPerPage: number;
  imageSize: 'small' | 'medium' | 'large' | 'xlarge';
  imageAspectRatio: 'square' | 'landscape' | 'portrait' | 'auto';
  showImages: boolean;
  showPrices: boolean;
  showDescriptions: boolean;
  showFilters: boolean;
  showSearch: boolean;
  
  // Настройки фильтрации
  filters: {
    property: string;
    values: string[];
    required: boolean;
  }[];
  
  // Настройки сортировки
  sortBy: 'name' | 'price' | 'popularity' | 'date';
  sortOrder: 'asc' | 'desc';
  
  // Настройки ценообразования
  pricingRules: {
    categoryId: string;
    basePrice: number;
    formula: string;
    discounts: {
      minQuantity: number;
      discountPercent: number;
    }[];
    markups: {
      categoryId: string;
      markupPercent: number;
    }[];
  }[];
  
  // Настройки корзины
  cartSettings: {
    allowQuantityChange: boolean;
    allowItemRemoval: boolean;
    showCalculations: boolean;
    showTaxes: boolean;
    showDiscounts: boolean;
    combineAdditionalCategories: boolean;
    maxItems: number;
  };
  
  // Настройки экспорта
  exportSettings: {
    quoteEnabled: boolean;
    invoiceEnabled: boolean;
    orderEnabled: boolean;
    showPrices: boolean;
    showTotals: boolean;
    includeImages: boolean;
    customFields: string[];
  };
  
  // Стили
  styles: {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderRadius: string;
    padding: string;
    margin: string;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
  };
  
  // Состояние
  isVisible: boolean;
  isLocked: boolean;
  zIndex: number;
}

interface CategoryConfig {
  id: string;
  name: string;
  type: 'main' | 'sub' | 'additional';
  parentId?: string;
  catalogCategoryId: string;
  products: any[];
  properties: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
    values?: string[];
    required: boolean;
    filterable: boolean;
    sortable: boolean;
  }[];
  pricingRules: {
    basePrice: number;
    formula: string;
    discounts: any[];
    markups: any[];
  };
}

// Продвинутая система ценообразования для максимального конструктора
interface AdvancedPricingRule {
  id: string;
  name: string;
  type: 'fixed' | 'percentage' | 'formula' | 'conditional' | 'volume' | 'tier' | 'dynamic' | 'api';
  value: number | string;
  conditions?: {
    field: string;
    operator: 'equals' | 'greater' | 'less' | 'contains' | 'between' | 'in' | 'not_in' | 'regex';
    value: string | number | [number, number];
    logic?: 'AND' | 'OR';
  }[];
  applyTo: 'base' | 'total' | 'item' | 'category' | 'global' | 'cart';
  priority: number;
  category?: string;
  minQuantity?: number;
  maxQuantity?: number;
  validFrom?: Date;
  validTo?: Date;
  isActive: boolean;
  apiEndpoint?: string;
  cacheTime?: number;
}

interface PricingFormula {
  id: string;
  name: string;
  formula: string;
  variables: {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'array';
    source: 'field' | 'constant' | 'calculation' | 'api' | 'user';
    defaultValue?: any;
  }[];
  description: string;
  examples: string[];
  validation: {
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'buy_x_get_y' | 'volume' | 'loyalty' | 'seasonal' | 'bulk';
  value: number;
  conditions: {
    minAmount?: number;
    minQuantity?: number;
    categories?: string[];
    customerGroups?: string[];
    dateRange?: { from: Date; to: Date };
    timeRange?: { from: string; to: string };
    dayOfWeek?: number[];
  };
  maxDiscount?: number;
  isStackable: boolean;
  priority: number;
  autoApply: boolean;
  couponCode?: string;
}

interface ConstructorConfig {
  id: string;
  name: string;
  description: string;
  categories: CategoryConfig[];
  blocks: BlockSettings[];
  globalSettings: {
    theme: 'light' | 'dark' | 'custom';
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      success: string;
      warning: string;
      error: string;
    };
    fonts: {
      primary: string;
      secondary: string;
      heading: string;
    };
    spacing: {
      small: string;
      medium: string;
      large: string;
      xlarge: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
    };
    shadows: {
      small: string;
      medium: string;
      large: string;
    };
  };
  advancedPricing: {
    rules: AdvancedPricingRule[];
    formulas: PricingFormula[];
    discounts: DiscountRule[];
    enableDynamicPricing: boolean;
    enableVolumeDiscounts: boolean;
    enableLoyaltyProgram: boolean;
    enableSeasonalPricing: boolean;
    enableBulkPricing: boolean;
    basePriceCalculation: 'manual' | 'formula' | 'api' | 'hybrid';
    priceUpdateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    priceCacheTime: number;
    enablePriceHistory: boolean;
    enablePriceAlerts: boolean;
  };
  analytics: {
    enableTracking: boolean;
    trackUserBehavior: boolean;
    trackPricingDecisions: boolean;
    trackConversionRates: boolean;
    customEvents: string[];
  };
  integrations: {
    crm: boolean;
    erp: boolean;
    inventory: boolean;
    payment: boolean;
    shipping: boolean;
    marketing: boolean;
  };
  previewMode: boolean;
  lastModified: Date;
  version: string;
}

// ===== КОНСТАНТЫ =====

const BLOCK_TYPES: BlockType[] = [
  {
    id: 'main-category',
    name: 'Основная категория',
    icon: <Package className="w-5 h-5" />,
    category: 'content',
    description: 'Отображение товаров основной категории',
    defaultSettings: {
      type: 'main-category',
      layout: 'grid',
      columns: 3,
      itemsPerPage: 12,
      imageSize: 'medium',
      imageAspectRatio: 'square',
      showImages: true,
      showPrices: true,
      showDescriptions: true,
      showFilters: true,
      showSearch: true
    }
  },
  {
    id: 'advanced-pricing',
    name: 'Продвинутое ценообразование',
    icon: <Calculator className="w-5 h-5" />,
    category: 'data',
    description: 'Блок с максимальными возможностями ценообразования',
    defaultSettings: {
      type: 'advanced-pricing',
      layout: 'grid',
      columns: 2,
      itemsPerPage: 20,
      imageSize: 'large',
      imageAspectRatio: 'landscape',
      showImages: true,
      showPrices: true,
      showDescriptions: true,
      showFilters: true,
      showSearch: true
    }
  },
  {
    id: 'dynamic-calculator',
    name: 'Динамический калькулятор',
    icon: <Calculator className="w-5 h-5" />,
    category: 'interaction',
    description: 'Интерактивный калькулятор с формулами и условиями',
    defaultSettings: {
      type: 'dynamic-calculator',
      layout: 'grid',
      columns: 1,
      itemsPerPage: 1,
      imageSize: 'large',
      imageAspectRatio: 'auto',
      showImages: false,
      showPrices: true,
      showDescriptions: true,
      showFilters: false,
      showSearch: false
    }
  },
  {
    id: 'analytics-dashboard',
    name: 'Аналитическая панель',
    icon: <Settings className="w-5 h-5" />,
    category: 'data',
    description: 'Панель с аналитикой и метриками',
    defaultSettings: {
      type: 'analytics-dashboard',
      layout: 'grid',
      columns: 4,
      itemsPerPage: 16,
      imageSize: 'medium',
      imageAspectRatio: 'square',
      showImages: false,
      showPrices: true,
      showDescriptions: true,
      showFilters: true,
      showSearch: true
    }
  },
  {
    id: 'subcategory',
    name: 'Подкатегория',
    icon: <Grid className="w-5 h-5" />,
    category: 'content',
    description: 'Отображение подкатегорий',
    defaultSettings: {
      type: 'subcategory',
      layout: 'list',
      columns: 2,
      itemsPerPage: 8,
      imageSize: 'small',
      imageAspectRatio: 'landscape',
      showImages: true,
      showPrices: false,
      showDescriptions: true,
      showFilters: false,
      showSearch: false
    }
  },
  {
    id: 'additional-category',
    name: 'Дополнительная категория',
    icon: <Plus className="w-5 h-5" />,
    category: 'content',
    description: 'Товары для дополнения основной категории',
    defaultSettings: {
      type: 'additional-category',
      layout: 'grid',
      columns: 4,
      itemsPerPage: 16,
      imageSize: 'small',
      imageAspectRatio: 'square',
      showImages: true,
      showPrices: true,
      showDescriptions: false,
      showFilters: true,
      showSearch: false
    }
  },
  {
    id: 'product-selector',
    name: 'Селектор товаров',
    icon: <Search className="w-5 h-5" />,
    category: 'interaction',
    description: 'Выбор товаров с фильтрами',
    defaultSettings: {
      type: 'product-selector',
      layout: 'grid',
      columns: 2,
      itemsPerPage: 6,
      imageSize: 'medium',
      imageAspectRatio: 'square',
      showImages: true,
      showPrices: true,
      showDescriptions: true,
      showFilters: true,
      showSearch: true
    }
  },
  {
    id: 'cart',
    name: 'Корзина',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'interaction',
    description: 'Корзина покупок с расчетами',
    defaultSettings: {
      type: 'cart',
      cartSettings: {
        allowQuantityChange: true,
        allowItemRemoval: true,
        showCalculations: true,
        showTaxes: false,
        showDiscounts: true,
        combineAdditionalCategories: false,
        maxItems: 100
      }
    }
  },
  {
    id: 'document-generator',
    name: 'Генератор документов',
    icon: <FileText className="w-5 h-5" />,
    category: 'data',
    description: 'Создание коммерческих предложений',
    defaultSettings: {
      type: 'document-generator',
      exportSettings: {
        quoteEnabled: true,
        invoiceEnabled: true,
        orderEnabled: true,
        showPrices: true,
        showTotals: true,
        includeImages: true,
        customFields: []
      }
    }
  },
  {
    id: 'text',
    name: 'Текстовый блок',
    icon: <Type className="w-5 h-5" />,
    category: 'content',
    description: 'Произвольный текст',
    defaultSettings: {
      type: 'text',
      styles: {
        backgroundColor: 'transparent',
        textColor: '#000000',
        borderColor: 'transparent',
        borderRadius: '0px',
        padding: '16px',
        margin: '0px',
        fontSize: '16px',
        fontFamily: 'Arial',
        fontWeight: 'normal'
      }
    }
  },
  {
    id: 'image',
    name: 'Изображение',
    icon: <Image className="w-5 h-5" />,
    category: 'content',
    description: 'Статичное изображение',
    defaultSettings: {
      type: 'image',
      imageSize: 'large',
      imageAspectRatio: 'auto'
    }
  }
];

// ===== КОМПОНЕНТЫ =====

// Компонент палитры блоков
const BlockPalette = ({ onDragStart }: { onDragStart: (blockType: BlockType) => void }) => {
  const categories = {
    content: 'Контент',
    interaction: 'Взаимодействие',
    data: 'Данные',
    layout: 'Макет'
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Блоки</h3>
        <p className="text-sm text-gray-600">Перетащите блок на холст</p>
      </div>
      
      {Object.entries(categories).map(([categoryKey, categoryName]) => (
        <div key={categoryKey} className="border-b border-gray-100">
          <div className="p-3 bg-gray-50 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-700">{categoryName}</h4>
          </div>
          <div className="p-2 space-y-1">
            {BLOCK_TYPES.filter(block => block.category === categoryKey).map((blockType) => (
              <BlockPaletteItem
                key={blockType.id}
                blockType={blockType}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Элемент палитры блоков
const BlockPaletteItem = ({ blockType, onDragStart }: { 
  blockType: BlockType; 
  onDragStart: (blockType: BlockType) => void;
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: () => {
      onDragStart(blockType);
      return { id: blockType.id, type: 'new', source: 'palette' };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`
        flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-move
        hover:border-blue-300 hover:shadow-sm transition-all duration-200
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex-shrink-0 mr-3 text-gray-600">
        {blockType.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {blockType.name}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {blockType.description}
        </div>
      </div>
    </div>
  );
};

// Компонент холста
const Canvas = ({ 
  blocks, 
  selectedBlock, 
  onBlockSelect, 
  onBlockUpdate, 
  onBlockDelete,
  onBlockAdd
}: {
  blocks: BlockSettings[];
  selectedBlock: BlockSettings | null;
  onBlockSelect: (block: BlockSettings) => void;
  onBlockUpdate: (block: BlockSettings) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockAdd: (block: BlockSettings) => void;
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item: DragItem, monitor) => {
      if (item.source === 'palette') {
        // Добавляем новый блок
        const blockType = BLOCK_TYPES.find(bt => bt.id === item.id);
        if (blockType) {
          const offset = monitor.getClientOffset();
          if (offset) {
            // Вычисляем позицию относительно холста
            const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
            if (canvasRect) {
              const x = offset.x - canvasRect.left - 320; // Учитываем ширину палитры
              const y = offset.y - canvasRect.top - 100; // Учитываем высоту заголовка
              
              // Выравниваем по сетке
              const gridSize = 20;
              const snappedX = Math.round(x / gridSize) * gridSize;
              const snappedY = Math.round(y / gridSize) * gridSize;
              
              const newBlock: BlockSettings = {
                id: `block_${Date.now()}`,
                name: blockType.name,
                type: blockType.id,
                x: Math.max(0, snappedX),
                y: Math.max(0, snappedY),
              width: 300,
              height: 200,
              layout: 'grid',
              columns: 3,
              itemsPerPage: 12,
              imageSize: 'medium',
              imageAspectRatio: 'square',
              showImages: true,
              showPrices: true,
              showDescriptions: true,
              showFilters: true,
              showSearch: true,
              filters: [],
              sortBy: 'name',
              sortOrder: 'asc',
              pricingRules: [],
              cartSettings: {
                allowQuantityChange: true,
                allowItemRemoval: true,
                showCalculations: true,
                showTaxes: false,
                showDiscounts: true,
                combineAdditionalCategories: false,
                maxItems: 100
              },
              exportSettings: {
                quoteEnabled: true,
                invoiceEnabled: true,
                orderEnabled: true,
                showPrices: true,
                showTotals: true,
                includeImages: true,
                customFields: []
              },
              styles: {
                backgroundColor: '#ffffff',
                textColor: '#000000',
                borderColor: '#e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                margin: '0px',
                fontSize: '16px',
                fontFamily: 'Arial',
                fontWeight: 'normal'
              },
              isVisible: true,
              isLocked: false,
              zIndex: 1,
              ...blockType.defaultSettings
            };
            
            onBlockAdd(newBlock);
          }
        }
      }
      } else if (item.source === 'canvas') {
        // Перемещаем существующий блок
        const offset = monitor.getClientOffset();
        if (offset) {
          const canvasRect = document.querySelector('.canvas-container')?.getBoundingClientRect();
          if (canvasRect) {
            const x = offset.x - canvasRect.left - 320; // Учитываем ширину палитры
            const y = offset.y - canvasRect.top - 100; // Учитываем высоту заголовка
            
            // Выравниваем по сетке
            const gridSize = 20;
            const snappedX = Math.round(x / gridSize) * gridSize;
            const snappedY = Math.round(y / gridSize) * gridSize;
            
            // Находим блок и обновляем его позицию
            const blockToMove = blocks.find(b => b.id === item.id);
            if (blockToMove) {
              onBlockUpdate({
                ...blockToMove,
                x: Math.max(0, snappedX),
                y: Math.max(0, snappedY)
              });
            }
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div 
      ref={drop}
      className={`
        flex-1 bg-gray-50 relative overflow-auto canvas-container
        ${isOver ? 'bg-blue-50' : ''}
      `}
      style={{ minHeight: '600px' }}
    >
      <div className="p-4">
        {/* Контур реальной веб-страницы - стандартный desktop размер */}
        <div className="relative w-full max-w-[1200px] mx-auto min-h-[800px] bg-white shadow-lg border border-gray-200">
          {/* Сетка для выравнивания */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Заголовок страницы */}
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-300 rounded w-20"></div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Основной контент */}
          <div className="p-4 relative" style={{ minHeight: '600px' }}>
            {blocks.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Layout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Перетащите блоки сюда</p>
                  <p className="text-sm">Начните создавать свою страницу</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                     {blocks.map((block) => (
                       <ProfessionalBlock
                         key={block.id}
                         block={block}
                         isSelected={selectedBlock?.id === block.id}
                         onSelect={() => onBlockSelect(block)}
                         onUpdate={onBlockUpdate}
                         onDelete={() => onBlockDelete(block.id)}
                       />
                     ))}
              </div>
            )}
          </div>

          {/* Футер страницы */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 mt-auto">
            <div className="text-center">
              <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Блок на холсте

// Старый PropertyPanel удален - заменен на ProfessionalPropertyPanel

// Главный компонент
export default function ProfessionalPageBuilder() {
  const [config, setConfig] = useState<ConstructorConfig>({
    id: 'default',
    name: 'Максимальный конструктор',
    description: 'Профессиональный конструктор с максимальными возможностями',
    categories: [],
    blocks: [],
    globalSettings: {
      theme: 'light',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        text: '#000000',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      fonts: {
        primary: 'Inter',
        secondary: 'Georgia',
        heading: 'Inter'
      },
      spacing: {
        small: '8px',
        medium: '16px',
        large: '24px',
        xlarge: '32px'
      },
      borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px'
      },
      shadows: {
        small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        large: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    },
    advancedPricing: {
      rules: [],
      formulas: [],
      discounts: [],
      enableDynamicPricing: true,
      enableVolumeDiscounts: true,
      enableLoyaltyProgram: false,
      enableSeasonalPricing: false,
      enableBulkPricing: true,
      basePriceCalculation: 'hybrid',
      priceUpdateFrequency: 'realtime',
      priceCacheTime: 300,
      enablePriceHistory: true,
      enablePriceAlerts: true
    },
    analytics: {
      enableTracking: true,
      trackUserBehavior: true,
      trackPricingDecisions: true,
      trackConversionRates: true,
      customEvents: ['block_click', 'price_change', 'formula_used']
    },
    integrations: {
      crm: false,
      erp: false,
      inventory: false,
      payment: false,
      shipping: false,
      marketing: false
    },
    previewMode: false,
    lastModified: new Date(),
    version: '2.0.0'
  });

  const [selectedBlock, setSelectedBlock] = useState<BlockSettings | null>(null);
  const [draggedBlockType, setDraggedBlockType] = useState<BlockType | null>(null);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  // Загрузка категорий из API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading categories from API...');
        const response = await fetch('/api/constructor/categories');
        console.log('API response status:', response.status);
        
        if (response.ok) {
          const categoriesData = await response.json();
          console.log('Categories data received:', categoriesData);
          
          const categoryConfigs: CategoryConfig[] = categoriesData.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            type: 'main',
            catalogCategoryId: cat.id,
            products: [],
            properties: [],
            pricingRules: {
              basePrice: 0,
              formula: '',
              discounts: [],
              markups: []
            }
          }));
          
          console.log('Category configs created:', categoryConfigs);
          
          setConfig(prev => ({
            ...prev,
            categories: categoryConfigs
          }));
        } else {
          console.error('Failed to fetch categories:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };

    loadCategories();
  }, []);

  const handleDragStart = useCallback((blockType: BlockType) => {
    setDraggedBlockType(blockType);
  }, []);

  const handleBlockSelect = useCallback((block: BlockSettings) => {
    setSelectedBlock(block);
  }, []);

  const handleBlockUpdate = useCallback((updatedBlock: BlockSettings) => {
    setConfig(prev => ({
      ...prev,
      blocks: prev.blocks.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      ),
      lastModified: new Date()
    }));
    setSelectedBlock(updatedBlock);
  }, []);

  const handleBlockDelete = useCallback((blockId: string) => {
    setConfig(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId),
      lastModified: new Date()
    }));
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  }, [selectedBlock]);

  const handleBlockAdd = useCallback((newBlock: BlockSettings) => {
    setConfig(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      lastModified: new Date()
    }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/constructor-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.name,
          description: config.description,
          config: config
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Конструктор сохранен!');
          // Обновляем ID конфигурации
          setConfig(prev => ({ ...prev, id: result.config.id }));
        } else {
          throw new Error(result.error || 'Ошибка сохранения');
        }
      } else {
        throw new Error('Ошибка сохранения');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения конструктора: ' + error.message);
    }
  }, [config]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-100">
        {/* Заголовок */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                🚀 Максимальный конструктор страниц
              </h1>
              <p className="text-sm text-gray-600">
                Профессиональный уровень с продвинутым ценообразованием, аналитикой и интеграциями
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setConfig(prev => ({ ...prev, previewMode: !prev.previewMode }))}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                {config.previewMode ? 'Редактировать' : 'Предпросмотр'}
              </Button>
              <Button
                onClick={() => {
                  // Открыть панель глобальных настроек
                  setShowGlobalSettings(!showGlobalSettings);
                }}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 flex overflow-hidden">
          {!config.previewMode && <BlockPalette onDragStart={handleDragStart} />}
          
          <Canvas
            blocks={config.blocks}
            selectedBlock={selectedBlock}
            onBlockSelect={handleBlockSelect}
            onBlockUpdate={handleBlockUpdate}
            onBlockDelete={handleBlockDelete}
            onBlockAdd={handleBlockAdd}
          />
          
          {!config.previewMode && (
            <ProfessionalPropertyPanel
              selectedBlock={selectedBlock}
              categories={config.categories.map(cat => ({
                id: cat.id,
                name: cat.name,
                parentId: null, // Пока все категории корневые
                level: 0,
                productCount: cat.products?.length || 0,
                imageUrl: null,
                description: cat.description || '',
                isActive: true,
                sortOrder: 0
              }))}
              onBlockUpdate={handleBlockUpdate}
              onCategoryChange={(categoryId, categoryInfo) => {
                console.log('Category changed:', categoryId, categoryInfo);
              }}
            />
          )}
        </div>
        
        {/* Максимальная панель глобальных настроек */}
        {showGlobalSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-6xl overflow-hidden">
              <div className="flex h-full">
                {/* Боковая панель навигации */}
                <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Глобальные настройки</h3>
                  <nav className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md">
                      Общие
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Ценообразование
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Аналитика
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Интеграции
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                      Безопасность
                    </button>
                  </nav>
                </div>
                
                {/* Основной контент настроек */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl">
                    {/* Общие настройки */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Общие настройки</h4>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Название конструктора
                            </label>
                            <Input
                              value={config.name}
                              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Название конструктора"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Версия
                            </label>
                            <Input
                              value={config.version}
                              onChange={(e) => setConfig(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="2.0.0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Настройки темы */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Настройки темы</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Основной цвет
                            </label>
                            <Input
                              type="color"
                              value={config.globalSettings.colors.primary}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                globalSettings: {
                                  ...prev.globalSettings,
                                  colors: { ...prev.globalSettings.colors, primary: e.target.value }
                                }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Вторичный цвет
                            </label>
                            <Input
                              type="color"
                              value={config.globalSettings.colors.secondary}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                globalSettings: {
                                  ...prev.globalSettings,
                                  colors: { ...prev.globalSettings.colors, secondary: e.target.value }
                                }
                              }))}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Акцентный цвет
                            </label>
                            <Input
                              type="color"
                              value={config.globalSettings.colors.accent}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                globalSettings: {
                                  ...prev.globalSettings,
                                  colors: { ...prev.globalSettings.colors, accent: e.target.value }
                                }
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Продвинутое ценообразование */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Продвинутое ценообразование</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Checkbox
                              checked={config.advancedPricing.enableDynamicPricing}
                              onChange={(checked) => setConfig(prev => ({
                                ...prev,
                                advancedPricing: { ...prev.advancedPricing, enableDynamicPricing: checked }
                              }))}
                              label="Динамическое ценообразование"
                            />
                            <Checkbox
                              checked={config.advancedPricing.enableVolumeDiscounts}
                              onChange={(checked) => setConfig(prev => ({
                                ...prev,
                                advancedPricing: { ...prev.advancedPricing, enableVolumeDiscounts: checked }
                              }))}
                              label="Скидки за объем"
                            />
                            <Checkbox
                              checked={config.advancedPricing.enableBulkPricing}
                              onChange={(checked) => setConfig(prev => ({
                                ...prev,
                                advancedPricing: { ...prev.advancedPricing, enableBulkPricing: checked }
                              }))}
                              label="Оптовые цены"
                            />
                            <Checkbox
                              checked={config.advancedPricing.enablePriceHistory}
                              onChange={(checked) => setConfig(prev => ({
                                ...prev,
                                advancedPricing: { ...prev.advancedPricing, enablePriceHistory: checked }
                              }))}
                              label="История цен"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Частота обновления цен
                              </label>
                              <Select
                                value={config.advancedPricing.priceUpdateFrequency}
                                onChange={(value) => setConfig(prev => ({
                                  ...prev,
                                  advancedPricing: { ...prev.advancedPricing, priceUpdateFrequency: value }
                                }))}
                                options={[
                                  { value: 'realtime', label: 'В реальном времени' },
                                  { value: 'hourly', label: 'Каждый час' },
                                  { value: 'daily', label: 'Ежедневно' },
                                  { value: 'weekly', label: 'Еженедельно' },
                                  { value: 'monthly', label: 'Ежемесячно' }
                                ]}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Время кэширования (сек)
                              </label>
                              <Input
                                type="number"
                                value={config.advancedPricing.priceCacheTime}
                                onChange={(e) => setConfig(prev => ({
                                  ...prev,
                                  advancedPricing: { ...prev.advancedPricing, priceCacheTime: parseInt(e.target.value) || 300 }
                                }))}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Аналитика */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Аналитика и отслеживание</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <Checkbox
                            checked={config.analytics.enableTracking}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              analytics: { ...prev.analytics, enableTracking: checked }
                            }))}
                            label="Включить отслеживание"
                          />
                          <Checkbox
                            checked={config.analytics.trackUserBehavior}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              analytics: { ...prev.analytics, trackUserBehavior: checked }
                            }))}
                            label="Отслеживать поведение пользователей"
                          />
                          <Checkbox
                            checked={config.analytics.trackPricingDecisions}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              analytics: { ...prev.analytics, trackPricingDecisions: checked }
                            }))}
                            label="Отслеживать решения по ценообразованию"
                          />
                          <Checkbox
                            checked={config.analytics.trackConversionRates}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              analytics: { ...prev.analytics, trackConversionRates: checked }
                            }))}
                            label="Отслеживать конверсии"
                          />
                        </div>
                      </div>
                      
                      {/* Интеграции */}
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Внешние интеграции</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <Checkbox
                            checked={config.integrations.crm}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, crm: checked }
                            }))}
                            label="CRM система"
                          />
                          <Checkbox
                            checked={config.integrations.erp}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, erp: checked }
                            }))}
                            label="ERP система"
                          />
                          <Checkbox
                            checked={config.integrations.inventory}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, inventory: checked }
                            }))}
                            label="Система складского учета"
                          />
                          <Checkbox
                            checked={config.integrations.payment}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, payment: checked }
                            }))}
                            label="Платежная система"
                          />
                          <Checkbox
                            checked={config.integrations.shipping}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, shipping: checked }
                            }))}
                            label="Система доставки"
                          />
                          <Checkbox
                            checked={config.integrations.marketing}
                            onChange={(checked) => setConfig(prev => ({
                              ...prev,
                              integrations: { ...prev.integrations, marketing: checked }
                            }))}
                            label="Маркетинговая система"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Кнопки управления */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowGlobalSettings(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    setShowGlobalSettings(false);
                    handleSave();
                  }}
                >
                  Сохранить настройки
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
