'use client';

// components/layout/AdminLayout.tsx
// Основной layout для админ панели с боковым меню

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui';
import { formatUserName, getRoleDisplayName, getRoleColor, getRoleIcon, User } from '../../lib/utils/user-display';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
        {
          id: 'dashboard',
          label: 'Главная',
          href: '/admin'
        },
  {
    id: 'catalog',
    label: 'Каталог товаров',
    href: '/admin/catalog',
    children: [
      { id: 'catalog-tree', label: 'Дерево каталога', href: '/admin/catalog' },
      { id: 'catalog-properties', label: 'Свойства товаров', href: '/admin/catalog/properties' },
      { id: 'catalog-import', label: 'Импорт каталога', href: '/admin/catalog/import' },
      { id: 'catalog-products', label: 'Товары', href: '/admin/catalog/products' }
    ]
  },
  {
    id: 'configurator',
    label: 'Категории конфигуратора',
    href: '/admin/configurator',
    children: [
      { id: 'configurator-list', label: 'Список категорий', href: '/admin/configurator' },
      { id: 'configurator-create', label: 'Создать категорию', href: '/admin/configurator/create' },
              { id: 'configurator-links', label: 'Связи категорий', href: '/admin/configurator/category-links' },
              { id: 'configurator-import', label: 'Импорт товаров', href: '/admin/configurator/import' },
              { id: 'configurator-export', label: 'Настройки экспорта', href: '/admin/configurator/export-settings' }
    ]
  },
  {
    id: 'users',
    label: 'Пользователи',
    href: '/admin/users'
  },
  {
    id: 'settings',
    label: 'Настройки',
    href: '/admin/settings'
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    href: '/analytics'
  }
];

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['catalog', 'configurator']));
  const pathname = usePathname();

  useEffect(() => {
    // Проверяем аутентификацию из localStorage
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    if (token && userRole && userId) {
      // Пользователь авторизован
      setUser({
        id: userId,
        email: localStorage.getItem('userEmail') || '',
        firstName: localStorage.getItem('userFirstName') || 'Иван',
        lastName: localStorage.getItem('userLastName') || 'Иванов',
        middleName: localStorage.getItem('userMiddleName') || 'Иванович',
        role: userRole
      });
    } else {
      // Если нет токена, перенаправляем на страницу входа
      window.location.href = '/login';
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    // Очищаем данные аутентификации
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userLastName');
    localStorage.removeItem('userMiddleName');
    
    // Перенаправляем на страницу входа
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/10 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-black/10">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-black">Domeo</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.children ? (
                  // Menu item with children (expandable)
                  <div>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-400 text-black rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {/* Arrow icon */}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedMenus.has(item.id) ? 'rotate-90' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Submenu */}
                    {expandedMenus.has(item.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={`group flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                              pathname === child.href
                                ? 'bg-gray-100 text-black'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                            }`}
                          >
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular menu item (no children)
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-400 text-black rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-black/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user ? `${user.lastName} ${user.firstName} ${user.middleName || ''}`.trim() : 'Пользователь'}
              </p>
              <p className="text-xs text-gray-500 truncate">{getRoleDisplayName(user?.role || 'admin')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-black/10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="ml-4 lg:ml-0">
                {title && (
                  <h1 className="text-xl font-semibold text-black">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick actions */}
              <div className="hidden sm:flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          Статистика
                        </Button>
                <Button variant="ghost" size="sm">
                  Уведомления
                </Button>
              </div>
              
              {/* User info */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-black">{formatUserName(user)}</p>
                  <p className="text-xs text-gray-500">({getRoleDisplayName(user?.role || 'admin')})</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
