'use client';

import Link from 'next/link';
import React, { useState } from 'react';

// Простые типы для товаров
interface SmartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
}

interface CartItem {
  id: string;
  item: SmartItem;
  quantity: number;
  totalPrice: number;
}

export default function SmartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showClientModal, setShowClientModal] = useState(false);

  // Простые демо-товары (можно будет заменить на данные из domeosmart.ru)
  const smartItems: SmartItem[] = [
    {
      id: '1',
      name: 'Умная лампа',
      price: 2500,
      description: 'LED лампа с Wi-Fi управлением',
      image: '/assets/smart/lamp.jpg'
    },
    {
      id: '2',
      name: 'Умный выключатель',
      price: 3500,
      description: 'Сенсорный выключатель с дистанционным управлением',
      image: '/assets/smart/switch.jpg'
    },
    {
      id: '3',
      name: 'IP камера',
      price: 8500,
      description: 'Камера с ночным видением',
      image: '/assets/smart/camera.jpg'
    },
    {
      id: '4',
      name: 'Датчик движения',
      price: 1200,
      description: 'Беспроводной датчик движения',
      image: '/assets/smart/sensor.jpg'
    },
    {
      id: '5',
      name: 'Умный термостат',
      price: 12000,
      description: 'Программируемый термостат',
      image: '/assets/smart/thermostat.jpg'
    },
    {
      id: '6',
      name: 'Умная колонка',
      price: 15000,
      description: 'Голосовой помощник',
      image: '/assets/smart/speaker.jpg'
    }
  ];

  const addToCart = (item: SmartItem) => {
    const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.item.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1, totalPrice: (cartItem.quantity + 1) * item.price }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: Date.now().toString(),
        item,
        quantity: 1,
        totalPrice: item.price
      }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(cartItem => 
      cartItem.item.id === itemId 
        ? { ...cartItem, quantity, totalPrice: quantity * cartItem.item.price }
        : cartItem
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const checkClientBeforeExport = (exportFunction: () => void) => {
    if (!selectedClient) {
      setShowClientModal(true);
      return;
    }
    exportFunction();
  };

  const exportKP = () => {
    checkClientBeforeExport(() => {
      console.log('Экспорт КП для Смарт:', cart);
      alert('КП создан!');
    });
  };

  const exportInvoice = () => {
    checkClientBeforeExport(() => {
      console.log('Экспорт счета для Смарт:', cart);
      alert('Счет создан!');
    });
  };

  const exportFactory = () => {
    checkClientBeforeExport(() => {
      console.log('Заказ на фабрику для Смарт:', cart);
      alert('Заказ на фабрику создан!');
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-2xl font-bold text-black">
                Domeo
              </Link>
              <span className="text-black text-lg font-bold">•</span>
              <span className="text-lg font-semibold text-black">Смарт</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black transition-all duration-200 text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Основной контент - Товары */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-black mb-2">Каталог Смарт</h1>
              <p className="text-gray-600">
                Товары из каталога domeosmart.ru
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {smartItems.map((item) => (
                <div key={item.id} className="bg-white border border-black/10 p-6 hover:border-black transition-all duration-200">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    <div className="text-xl font-bold text-black mb-3">
                      {item.price.toLocaleString()} ₽
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    className="w-full px-4 py-2 bg-black text-white hover:bg-blue-600 transition-all duration-200 text-sm font-medium"
                  >
                    Добавить в корзину
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Правая панель - Корзина */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-black/10 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-black mb-4">Корзина</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-gray-600 text-sm">Корзина пуста</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((cartItem) => (
                    <div key={cartItem.id} className="border border-gray-200 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-black">{cartItem.item.name}</h4>
                        <button
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 text-gray-600 rounded text-xs"
                          >
                            -
                          </button>
                          <span className="text-sm text-black">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 text-gray-600 rounded text-xs"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-sm font-medium text-black">
                          {cartItem.totalPrice.toLocaleString()} ₽
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-black">Итого:</span>
                      <span className="text-lg font-bold text-black">
                        {getTotalPrice().toLocaleString()} ₽
                      </span>
                    </div>
                    
                    {/* Кнопки экспорта */}
                    <div className="space-y-2">
                      <button
                        disabled={!cart.length}
                        onClick={exportKP}
                        className="w-full px-3 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        КП
                      </button>
                      <button
                        disabled={!cart.length}
                        onClick={exportInvoice}
                        className="w-full px-3 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Счет
                      </button>
                      <button
                        disabled={!cart.length}
                        onClick={exportFactory}
                        className="w-full px-3 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Заказ на фабрику
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Client Selection Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-black mb-4">Выберите клиента</h3>
            <p className="text-sm text-gray-600 mb-4">
              Для создания документа необходимо выбрать клиента
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Клиент</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Выберите клиента</option>
                  <option value="1">Иванов Иван Иванович</option>
                  <option value="2">Петрова Анна Сергеевна</option>
                  <option value="3">Сидоров Петр Александрович</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowClientModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    if (selectedClient) {
                      setShowClientModal(false);
                      // Здесь можно добавить логику для продолжения экспорта
                    }
                  }}
                  disabled={!selectedClient}
                  className="flex-1 px-4 py-2 bg-black text-white hover:bg-blue-600 hover:text-white transition-all duration-200 text-sm font-medium disabled:opacity-50"
                >
                  Продолжить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}