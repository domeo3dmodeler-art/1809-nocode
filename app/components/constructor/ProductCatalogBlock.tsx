'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, Badge, Checkbox } from '../ui';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Table, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Image as ImageIcon,
  Star,
  ShoppingCart,
  Eye,
  Settings
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  model?: string;
  series?: string;
  base_price: number;
  currency: string;
  stock_quantity: number;
  min_order_qty: number;
  weight?: number;
  dimensions?: string;
  specifications?: string;
  properties: { [key: string]: any };
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  primaryImage?: {
    id: string;
    url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
  } | null;
  images: Array<{
    id: string;
    url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
  }>;
}

interface ProductCatalogBlockProps {
  block: {
    id: string;
    name: string;
    type: string;
    catalogCategoryId?: string;
    catalogCategoryInfo?: {
      id: string;
      name: string;
      description?: string;
      productCount: number;
      imageUrl?: string;
    };
    // Настройки отображения
    displayMode?: 'cards' | 'list' | 'table';
    itemsPerPage?: number;
    showImages?: boolean;
    showPrices?: boolean;
    showDescriptions?: boolean;
    showFilters?: boolean;
    showSearch?: boolean;
    imageSize?: 'small' | 'medium' | 'large';
    columns?: number;
    // Фильтры
    filters?: { [key: string]: any };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    // Поля для отображения
    displayFields?: string[];
  };
  isPreview?: boolean;
  onProductSelect?: (product: Product) => void;
  onProductAddToCart?: (product: Product) => void;
}

const ProductCatalogBlock: React.FC<ProductCatalogBlockProps> = ({
  block,
  isPreview = false,
  onProductSelect,
  onProductAddToCart
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: block.itemsPerPage || 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [availableFilters, setAvailableFilters] = useState<any[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{ [key: string]: any }>(block.filters || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(block.sortBy || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(block.sortOrder || 'asc');
  const [displayMode, setDisplayMode] = useState<'cards' | 'list' | 'table'>(block.displayMode || 'cards');

  // Загрузка товаров
  const loadProducts = async (page = 1, filters = appliedFilters, search = searchTerm) => {
    if (!block.catalogCategoryId) {
      setError('Категория не выбрана');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
        ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) }),
        ...(block.displayFields && { fields: JSON.stringify(block.displayFields) })
      });

      const response = await fetch(`/api/products/category/${block.catalogCategoryId}?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
        setAvailableFilters(data.data.filters.available);
      } else {
        setError(data.error || 'Ошибка загрузки товаров');
      }
    } catch (err) {
      setError('Ошибка загрузки товаров');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка при изменении параметров
  useEffect(() => {
    loadProducts(1, appliedFilters, searchTerm);
  }, [block.catalogCategoryId, sortBy, sortOrder]);

  // Обработчики
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    loadProducts(1, appliedFilters, value);
  };

  const handleFilterChange = (propertyKey: string, value: any) => {
    const newFilters = { ...appliedFilters };
    if (value === null || value === undefined || value === '') {
      delete newFilters[propertyKey];
    } else {
      newFilters[propertyKey] = value;
    }
    setAppliedFilters(newFilters);
    loadProducts(1, newFilters, searchTerm);
  };

  const handlePageChange = (newPage: number) => {
    loadProducts(newPage, appliedFilters, searchTerm);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
    setSortOrder(newSortOrder);
  };

  // Рендер карточки товара
  const renderProductCard = (product: Product) => (
    <Card key={product.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
      {block.showImages && product.primaryImage && (
        <div className="relative">
          <img
            src={product.primaryImage.url}
            alt={product.primaryImage.alt_text || product.name}
            className={`w-full object-cover ${
              block.imageSize === 'small' ? 'h-32' :
              block.imageSize === 'medium' ? 'h-48' : 'h-64'
            }`}
          />
          {product.is_featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500">
              <Star className="w-3 h-3 mr-1" />
              Хит
            </Badge>
          )}
        </div>
      )}
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {block.showDescriptions && product.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {product.description}
            </p>
          )}
          
          <div className="space-y-1 text-xs text-gray-500 mb-3">
            <div>Артикул: {product.sku}</div>
            {product.brand && <div>Бренд: {product.brand}</div>}
            {product.model && <div>Модель: {product.model}</div>}
            {product.stock_quantity > 0 && (
              <div className="text-green-600">В наличии: {product.stock_quantity}</div>
            )}
          </div>
        </div>
        
        <div className="mt-auto">
          {block.showPrices && (
            <div className="text-lg font-bold text-gray-900 mb-3">
              {product.base_price.toLocaleString()} {product.currency}
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onProductSelect?.(product)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Подробнее
            </Button>
            {onProductAddToCart && (
              <Button
                size="sm"
                onClick={() => onProductAddToCart(product)}
                className="flex-1"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                В корзину
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  // Рендер списка товаров
  const renderProductList = (product: Product) => (
    <div key={product.id} className="flex items-center space-x-4 p-4 border-b border-gray-200 hover:bg-gray-50">
      {block.showImages && product.primaryImage && (
        <img
          src={product.primaryImage.url}
          alt={product.primaryImage.alt_text || product.name}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500">Артикул: {product.sku}</p>
        {block.showDescriptions && product.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        )}
      </div>
      
      {block.showPrices && (
        <div className="text-right">
          <div className="font-semibold text-gray-900">
            {product.base_price.toLocaleString()} {product.currency}
          </div>
          {product.stock_quantity > 0 && (
            <div className="text-xs text-green-600">В наличии</div>
          )}
        </div>
      )}
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onProductSelect?.(product)}
        >
          <Eye className="w-4 h-4" />
        </Button>
        {onProductAddToCart && (
          <Button
            size="sm"
            onClick={() => onProductAddToCart(product)}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );

  // Рендер таблицы товаров
  const renderProductTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {block.showImages && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Фото</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Артикул</th>
            {block.showPrices && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Наличие</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              {block.showImages && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.primaryImage ? (
                    <img
                      src={product.primaryImage.url}
                      alt={product.primaryImage.alt_text || product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </td>
              )}
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                {block.showDescriptions && product.description && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
              {block.showPrices && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.base_price.toLocaleString()} {product.currency}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                {product.stock_quantity > 0 ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    В наличии ({product.stock_quantity})
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Нет в наличии
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProductSelect?.(product)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                {onProductAddToCart && (
                  <Button
                    size="sm"
                    onClick={() => onProductAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!block.catalogCategoryId) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Выберите категорию товаров для отображения</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок и управление */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{block.name}</h3>
            {block.catalogCategoryInfo && (
              <p className="text-sm text-gray-600">
                {block.catalogCategoryInfo.name} ({pagination.total} товаров)
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Переключатель режима отображения */}
            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={displayMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('cards')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={displayMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('list')}
                className="rounded-none border-x-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={displayMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('table')}
                className="rounded-l-none"
              >
                <Table className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Поиск и фильтры */}
        <div className="flex items-center space-x-4">
          {block.showSearch && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Поиск товаров..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Сортировка */}
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            options={[
              { value: 'name', label: 'По названию' },
              { value: 'base_price', label: 'По цене' },
              { value: 'created_at', label: 'По дате добавления' },
              { value: 'sku', label: 'По артикулу' }
            ]}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>

        {/* Фильтры */}
        {block.showFilters && availableFilters.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded border">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Фильтры:</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {availableFilters.map((filter) => (
                <div key={filter.key} className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">{filter.key}:</label>
                  <Select
                    value={appliedFilters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value || null)}
                    options={[
                      { value: '', label: 'Все' },
                      ...filter.values.map((value: string) => ({ value, label: value }))
                    ]}
                    className="min-w-32"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Загрузка товаров...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            <p>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadProducts()}
              className="mt-2"
            >
              Попробовать снова
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Товары не найдены</p>
          </div>
        ) : (
          <>
            {displayMode === 'cards' && (
              <div className={`grid gap-4 ${
                block.columns === 1 ? 'grid-cols-1' :
                block.columns === 2 ? 'grid-cols-2' :
                block.columns === 3 ? 'grid-cols-3' :
                block.columns === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}>
                {products.map(renderProductCard)}
              </div>
            )}

            {displayMode === 'list' && (
              <div className="space-y-0">
                {products.map(renderProductList)}
              </div>
            )}

            {displayMode === 'table' && renderProductTable()}
          </>
        )}
      </div>

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Показано {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
                Назад
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Вперед
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalogBlock;


