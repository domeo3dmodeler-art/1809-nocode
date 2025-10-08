'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Button } from '../../components/ui';
import { ClientAuthGuard } from '../../components/auth/ClientAuthGuard';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: string;
  permissions: string[];
}

export default function DashboardPage() {
  return (
    <ClientAuthGuard>
      <DashboardContent />
    </ClientAuthGuard>
  );
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    // Проверяем аутентификацию
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (!token || !userRole || !userId) {
      router.push('/login');
      return;
    }

    // Загружаем данные пользователя
    setUser({
      id: userId,
      email: localStorage.getItem('userEmail') || '',
      firstName: localStorage.getItem('userFirstName') || 'Иван',
      lastName: localStorage.getItem('userLastName') || 'Иванов',
      middleName: localStorage.getItem('userMiddleName') || 'Иванович',
      role: userRole,
      permissions: JSON.parse(localStorage.getItem('userPermissions') || '[]')
    });

    // Загружаем статистику для всех ролей
    fetchStats();
    setIsLoading(false);
  }, [router]);

  const fetchStats = useCallback(async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/users')
      ]);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUserCount(usersData.users?.length || 0);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userMiddleName');
    localStorage.removeItem('userPermissions');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Мемоизируем контент по роли
  const roleContent = useMemo(() => {
    if (!user) return null;
    
    switch (user.role) {
      case 'admin':
        return {
          title: 'Панель администратора',
          description: 'Управление системой и пользователями',
          widgets: [
            { title: 'Категории товаров', count: stats?.total?.totalCategories || 0, link: '/admin/categories', icon: '📁' },
            { title: 'Пользователи', count: userCount, link: '/admin/users', icon: '👥' },
            { title: 'Импорт прайсов', count: stats?.total?.totalImports || 0, link: '/admin/import', icon: '📊' },
            { title: 'Товары', count: stats?.total?.totalProducts || 0, link: '/admin/catalog/products', icon: '📦' }
          ],
          quickActions: [
            { title: 'Создать категорию', link: '/admin/categories/builder', icon: '➕' },
            { title: 'Импорт прайса', link: '/admin/import', icon: '📥' },
            { title: 'Управление пользователями', link: '/admin/users', icon: '👤' },
            { title: 'Настройки системы', link: '/admin/settings', icon: '⚙️' }
          ]
        };
      case 'complectator':
        return {
          title: 'Личный кабинет комплектатора',
          description: 'Работа с клиентами и коммерческими предложениями',
          widgets: [
            { title: 'Клиенты', count: '23', link: '/clients', icon: '👥' },
            { title: 'КП в работе', count: '7', link: '/quotes', icon: '📄' },
            { title: 'Счета', count: '12', link: '/invoices', icon: '💰' },
            { title: 'Каталог товаров', count: stats?.total?.totalProducts || 0, link: '/doors', icon: '📦' }
          ],
          quickActions: [
            { title: 'Добавить клиента', link: '/clients', icon: '👤' },
            { title: 'Создать КП', link: '/quotes', icon: '📝' },
            { title: 'Конфигуратор дверей', link: '/doors', icon: '🚪' },
            { title: 'Каталог товаров', link: '/', icon: '📦' }
          ]
        };
      case 'executor':
        return {
          title: 'Личный кабинет исполнителя',
          description: 'Исполнение заказов и работа с фабрикой',
          widgets: [
            { title: 'Заказы в работе', count: '8', link: '/orders', icon: '⚡' },
            { title: 'Заказы у поставщика', count: '5', link: '/factory', icon: '🏭' },
            { title: 'Выполненные', count: '32', link: '/orders?status=completed', icon: '✅' },
            { title: 'Уведомления', count: '3', link: '/notifications', icon: '🔔' }
          ],
          quickActions: [
            { title: 'Новые заказы', link: '/orders?status=new', icon: '🆕' },
            { title: 'Заказ у поставщика', link: '/factory', icon: '🏭' },
            { title: 'Отслеживание', link: '/tracking', icon: '📍' },
            { title: 'Уведомления', link: '/notifications', icon: '🔔' }
          ]
        };
      default:
        return {
          title: 'Личный кабинет',
          description: 'Добро пожаловать в систему',
          widgets: [],
          quickActions: []
        };
    }
  }, [user, stats, userCount]);

  // Для админов используем AdminLayout, для остальных - обычный лейаут
  if (user.role === 'admin') {
    return (
      <AdminLayout
        title={roleContent.title}
        subtitle={roleContent.description}
      >
        <div className="space-y-8">
          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roleContent.widgets.map((widget, index) => (
              <Card key={index} variant="interactive" className="hover:border-black transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{widget.title}</p>
                      <p className="text-2xl font-bold text-black mt-1">{widget.count}</p>
                    </div>
                    <div className="text-2xl">{widget.icon}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card variant="base">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-black mb-4">Быстрые действия</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {roleContent.quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    className="p-4 h-auto flex flex-col items-center space-y-2"
                    onClick={() => router.push(action.link)}
                  >
                    <div className="text-2xl">{action.icon}</div>
                    <p className="text-sm font-medium">{action.title}</p>
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card variant="base">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-black mb-4">Последняя активность</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">📋</span>
                    <span className="text-sm text-gray-600">Создан заказ #12345</span>
                  </div>
                  <span className="text-xs text-gray-500">2 часа назад</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">📄</span>
                    <span className="text-sm text-gray-600">Отправлен КП клиенту</span>
                  </div>
                  <span className="text-xs text-gray-500">4 часа назад</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">✅</span>
                    <span className="text-sm text-gray-600">Заказ #12340 выполнен</span>
                  </div>
                  <span className="text-xs text-gray-500">1 день назад</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  // Для не-админов используем обычный лейаут
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-2xl font-bold text-black">Domeo</h1>
                <p className="text-xs text-gray-500 font-medium">Configurators</p>
              </div>
              <div className="flex items-center">
                <span className="text-black mx-3 text-lg font-bold">•</span>
                <h2 className="text-lg font-semibold text-black">{getRoleDisplayName(user.role)}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user.lastName} {user.firstName.charAt(0)}.{user.middleName ? user.middleName.charAt(0) + '.' : ''} ({getRoleText(user.role)})
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1 border border-black text-black hover:bg-black hover:text-white transition-all duration-200 text-sm"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">{roleContent.title}</h1>
          <p className="text-gray-600 mt-2">{roleContent.description}</p>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {roleContent.widgets.map((widget, index) => (
            <div
              key={index}
              onClick={() => router.push(widget.link)}
              className="bg-white border border-gray-200 p-6 hover:border-black transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{widget.title}</p>
                  <p className="text-2xl font-bold text-black mt-1">{widget.count}</p>
                </div>
                <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                  {widget.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-black mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleContent.quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.link)}
                className="bg-white border border-gray-200 p-4 hover:border-black hover:bg-black hover:text-white transition-all duration-200 group text-center"
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                  {action.icon}
                </div>
                <p className="text-sm font-medium">{action.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-black mb-4">Последняя активность</h2>
          <div className="bg-white border border-gray-200 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="text-sm">📋</span>
                  <span className="text-sm text-gray-600">Создан заказ #12345</span>
                </div>
                <span className="text-xs text-gray-500">2 часа назад</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <span className="text-sm">📄</span>
                  <span className="text-sm text-gray-600">Отправлен КП клиенту</span>
                </div>
                <span className="text-xs text-gray-500">4 часа назад</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <span className="text-sm">✅</span>
                  <span className="text-sm text-gray-600">Заказ #12340 выполнен</span>
                </div>
                <span className="text-xs text-gray-500">1 день назад</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  function getRoleText(role: string) {
    const roleMap: { [key: string]: string } = {
      'admin': 'Администратор',
      'complectator': 'Комплектатор',
      'executor': 'Исполнитель'
    };
    return roleMap[role] || 'Пользователь';
  }

  function getRoleDisplayName(role: string) {
    const roleMap: { [key: string]: string } = {
      'admin': 'Администратор',
      'complectator': 'Комплектатор',
      'executor': 'Исполнитель'
    };
    return roleMap[role] || 'Пользователь';
  }
}
