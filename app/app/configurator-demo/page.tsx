'use client'
import React, { useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
};

type SubcategoryProduct = {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
};

type Subcategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  products: SubcategoryProduct[];
};

type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
  products: Product[];
  subcategories: Subcategory[];
};

export default function ConfiguratorDemo() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSubcategoryProducts, setSelectedSubcategoryProducts] = useState<Record<string, SubcategoryProduct | null>>({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Демо данные
  const categories: Category[] = [
    {
      id: 'doors',
      name: 'Двери',
      description: 'Межкомнатные двери',
      icon: '🚪',
      products: [
        { id: 'door-1', name: 'PG Base 1', price: 25000, description: 'Современная дверь из массива' },
        { id: 'door-2', name: 'PO Base 1/1', price: 28000, description: 'Классическая дверь с эмалью' },
        { id: 'door-3', name: 'Neo-1', price: 32000, description: 'Неоклассическая дверь' }
      ],
      subcategories: [
        {
          id: 'door-handles',
          name: 'Ручки',
          description: 'Ручки для дверей',
          icon: '🔘',
          products: [
            { id: 'handle-1', name: 'Pro', price: 1200, description: 'Современная ручка' },
            { id: 'handle-2', name: 'Silver', price: 1400, description: 'Серебряная ручка' },
            { id: 'handle-3', name: 'Gold', price: 1600, description: 'Золотая ручка' }
          ]
        },
        {
          id: 'door-kits',
          name: 'Комплекты фурнитуры',
          description: 'Комплекты фурнитуры',
          icon: '🔧',
          products: [
            { id: 'kit-1', name: 'Базовый комплект', price: 5000, description: 'Стандартная фурнитура' },
            { id: 'kit-2', name: 'SoftClose', price: 2400, description: 'Комплект с плавным закрытием' },
            { id: 'kit-3', name: 'Premium', price: 8000, description: 'Премиум комплект' }
          ]
        }
      ]
    },
    {
      id: 'flooring',
      name: 'Напольные покрытия',
      description: 'Ламинат и паркет',
      icon: '🏠',
      products: [
        { id: 'floor-1', name: 'Ламинат Premium', price: 1500, description: 'Ламинат 32 класса' },
        { id: 'floor-2', name: 'Паркет Дуб', price: 3500, description: 'Массив дуба' }
      ],
      subcategories: [
        {
          id: 'flooring-accessories',
          name: 'Аксессуары',
          description: 'Плинтусы и пороги',
          icon: '📏',
          products: [
            { id: 'accessory-1', name: 'Плинтус МДФ', price: 300, description: 'Плинтус из МДФ' },
            { id: 'accessory-2', name: 'Порог алюминиевый', price: 500, description: 'Алюминиевый порог' }
          ]
        }
      ]
    }
  ];

  const calculateTotalPrice = () => {
    let total = selectedProduct?.price || 0;
    Object.values(selectedSubcategoryProducts).forEach(product => {
      if (product) total += product.price;
    });
    setTotalPrice(total);
  };

  React.useEffect(() => {
    calculateTotalPrice();
  }, [selectedProduct, selectedSubcategoryProducts]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSubcategoryProducts({});
  };

  const handleSubcategoryProductSelect = (subcategoryId: string, product: SubcategoryProduct) => {
    setSelectedSubcategoryProducts(prev => ({
      ...prev,
      [subcategoryId]: product
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Domeo</h1>
                <p className="text-xs text-gray-600">Configurators</p>
              </div>
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-gray-800">Демо конфигуратора с подкатегориями</h2>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{totalPrice.toLocaleString()} ₽</div>
              <div className="text-sm text-gray-500">Итого</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - Выбор категории */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите категорию</h3>
            <div className="space-y-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedCategory?.id === category.id
                      ? 'border-gray-800 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Средняя колонка - Выбор основного товара */}
          <div className="lg:col-span-1">
            {selectedCategory && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Выберите {selectedCategory.name.toLowerCase()}</h3>
                <div className="space-y-3">
                  {selectedCategory.products.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-gray-800 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{product.price.toLocaleString()} ₽</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Правая колонка - Подкатегории */}
          <div className="lg:col-span-1">
            {selectedCategory && selectedProduct && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Дополнительно</h3>
                <div className="space-y-6">
                  {selectedCategory.subcategories.map(subcategory => (
                    <div key={subcategory.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-xl mr-2">{subcategory.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{subcategory.name}</div>
                          <div className="text-sm text-gray-500">{subcategory.description}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {subcategory.products.map(product => (
                          <button
                            key={product.id}
                            onClick={() => handleSubcategoryProductSelect(subcategory.id, product)}
                            className={`w-full p-3 rounded border text-left transition-all ${
                              selectedSubcategoryProducts[subcategory.id]?.id === product.id
                                ? 'border-gray-800 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">{product.price.toLocaleString()} ₽</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Итоговая стоимость */}
        {selectedProduct && (
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Итоговая стоимость</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{selectedProduct.name}</span>
                <span className="font-medium">{selectedProduct.price.toLocaleString()} ₽</span>
              </div>
              {Object.entries(selectedSubcategoryProducts).map(([subcategoryId, product]) => {
                if (!product) return null;
                const subcategory = selectedCategory?.subcategories.find(s => s.id === subcategoryId);
                return (
                  <div key={subcategoryId} className="flex justify-between">
                    <span className="text-gray-600">{subcategory?.name}: {product.name}</span>
                    <span className="font-medium">{product.price.toLocaleString()} ₽</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Итого:</span>
                  <span className="font-bold text-xl text-gray-900">{totalPrice.toLocaleString()} ₽</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
