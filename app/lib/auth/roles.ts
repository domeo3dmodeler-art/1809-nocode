// lib/auth/roles.ts
// Система ролей и прав доступа для Domeo No-Code

export type Role = 'admin' | 'complectator' | 'executor';

export type Permission = 
  | 'products.import'           // Импорт прайсов
  | 'products.manage'           // Управление товарами
  | 'products.photos'           // Загрузка фото
  | 'categories.create'         // Создание категорий
  | 'categories.manage'         // Управление категориями
  | 'catalog.view'              // Просмотр каталога
  | 'catalog.search'            // Поиск товаров
  | 'pricing.calculate'         // Расчет цен
  | 'quotes.create'             // Создание КП
  | 'quotes.read'               // Просмотр КП
  | 'quotes.update'             // Редактирование КП
  | 'quotes.export'             // Экспорт КП
  | 'factory.order'             // Заказ на фабрику
  | 'analytics.view'            // Просмотр аналитики
  | 'users.manage';             // Управление пользователями

export type UserRole = {
  id: string;
  userId: string;
  role: Role;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type RoleDefinition = {
  role: Role;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // Уровень доступа (чем выше, тем больше прав)
  color: string; // Цвет для UI
  icon: string;  // Иконка для UI
};

class RoleService {
  private roleDefinitions: RoleDefinition[] = [
    {
      role: 'admin',
      name: 'Администратор',
      description: 'Управляет базой товаров, загружает фото, создает категории',
      permissions: [
        'products.import',
        'products.manage', 
        'products.photos',
        'categories.create',
        'categories.manage',
        'catalog.view',
        'catalog.search',
        'pricing.calculate',
        'quotes.create',
        'quotes.read',
        'quotes.update',
        'quotes.export',
        'analytics.view',
        'users.manage'
      ],
      level: 100,
      color: 'red',
      icon: '👑'
    },
    {
      role: 'complectator',
      name: 'Комплектатор',
      description: 'Все функции кроме заказа на фабрику',
      permissions: [
        'catalog.view',
        'catalog.search',
        'pricing.calculate',
        'quotes.create',
        'quotes.read',
        'quotes.update',
        'quotes.export',
        'analytics.view'
      ],
      level: 80,
      color: 'blue',
      icon: '📋'
    },
    {
      role: 'executor',
      name: 'Исполнитель заказа',
      description: 'Видит все, включая заказ на фабрику',
      permissions: [
        'catalog.view',
        'catalog.search',
        'pricing.calculate',
        'quotes.create',
        'quotes.read',
        'quotes.update',
        'quotes.export',
        'factory.order',
        'analytics.view'
      ],
      level: 90,
      color: 'green',
      icon: '⚡'
    }
  ];

  // Получить все роли
  getAllRoles(): RoleDefinition[] {
    return [...this.roleDefinitions];
  }

  // Получить роль по ID
  getRole(role: Role): RoleDefinition | null {
    return this.roleDefinitions.find(r => r.role === role) || null;
  }

  // Получить разрешения для роли
  getRolePermissions(role: Role): Permission[] {
    const roleDef = this.getRole(role);
    return roleDef ? roleDef.permissions : [];
  }

  // Проверить, есть ли у роли разрешение
  hasPermission(role: Role, permission: Permission): boolean {
    const permissions = this.getRolePermissions(role);
    return permissions.includes(permission);
  }

  // Проверить доступ к импорту товаров
  canImportProducts(role: Role): boolean {
    return this.hasPermission(role, 'products.import');
  }

  // Проверить доступ к управлению товарами
  canManageProducts(role: Role): boolean {
    return this.hasPermission(role, 'products.manage');
  }

  // Проверить доступ к загрузке фото
  canUploadPhotos(role: Role): boolean {
    return this.hasPermission(role, 'products.photos');
  }

  // Проверить доступ к созданию категорий
  canCreateCategories(role: Role): boolean {
    return this.hasPermission(role, 'categories.create');
  }

  // Проверить доступ к управлению категориями
  canManageCategories(role: Role): boolean {
    return this.hasPermission(role, 'categories.manage');
  }

  // Проверить доступ к каталогу
  canViewCatalog(role: Role): boolean {
    return this.hasPermission(role, 'catalog.view');
  }

  // Проверить доступ к поиску
  canSearchProducts(role: Role): boolean {
    return this.hasPermission(role, 'catalog.search');
  }

  // Проверить доступ к расчету цен
  canCalculatePricing(role: Role): boolean {
    return this.hasPermission(role, 'pricing.calculate');
  }

  // Проверить доступ к КП
  canManageQuotes(role: Role, action: 'create' | 'read' | 'update' | 'export'): boolean {
    const permission = `quotes.${action}` as Permission;
    return this.hasPermission(role, permission);
  }

  // Проверить доступ к заказу на фабрику
  canCreateFactoryOrder(role: Role): boolean {
    return this.hasPermission(role, 'factory.order');
  }

  // Проверить доступ к аналитике
  canViewAnalytics(role: Role): boolean {
    return this.hasPermission(role, 'analytics.view');
  }

  // Проверить доступ к управлению пользователями
  canManageUsers(role: Role): boolean {
    return this.hasPermission(role, 'users.manage');
  }

  // Получить уровень доступа роли
  getRoleLevel(role: Role): number {
    const roleDef = this.getRole(role);
    return roleDef ? roleDef.level : 0;
  }

  // Проверить, может ли роль управлять другой ролью
  canManageRole(managerRole: Role, targetRole: Role): boolean {
    const managerLevel = this.getRoleLevel(managerRole);
    const targetLevel = this.getRoleLevel(targetRole);
    return managerLevel > targetLevel;
  }

  // Получить роли, которыми может управлять данная роль
  getManageableRoles(role: Role): Role[] {
    const roleLevel = this.getRoleLevel(role);
    return this.roleDefinitions
      .filter(r => r.level < roleLevel)
      .map(r => r.role);
  }

  // Получить ограничения для роли
  getRoleRestrictions(role: Role): {
    maxQuotesPerDay?: number;
    canImportProducts: boolean;
    canUploadPhotos: boolean;
    canCreateCategories: boolean;
    canCreateFactoryOrders: boolean;
    canManageUsers: boolean;
  } {
    const restrictions = {
      maxQuotesPerDay: undefined as number | undefined,
      canImportProducts: false,
      canUploadPhotos: false,
      canCreateCategories: false,
      canCreateFactoryOrders: false,
      canManageUsers: false
    };

    switch (role) {
      case 'admin':
        restrictions.canImportProducts = true;
        restrictions.canUploadPhotos = true;
        restrictions.canCreateCategories = true;
        restrictions.canManageUsers = true;
        break;
      
      case 'complectator':
        restrictions.maxQuotesPerDay = 100;
        break;
      
      case 'executor':
        restrictions.canCreateFactoryOrders = true;
        restrictions.maxQuotesPerDay = 200;
        break;
    }

    return restrictions;
  }

  // Получить цвет роли для UI
  getRoleColor(role: Role): string {
    const roleDef = this.getRole(role);
    return roleDef ? roleDef.color : 'gray';
  }

  // Получить иконку роли для UI
  getRoleIcon(role: Role): string {
    const roleDef = this.getRole(role);
    return roleDef ? roleDef.icon : '👤';
  }

  // Проверить доступ к админке
  canAccessAdmin(role: Role): boolean {
    return ['admin'].includes(role);
  }

  // Проверить доступ к функциям импорта
  canAccessImport(role: Role): boolean {
    return this.hasPermission(role, 'products.import');
  }

  // Проверить доступ к функциям загрузки фото
  canAccessMedia(role: Role): boolean {
    return this.hasPermission(role, 'products.photos');
  }
}

// Экспортируем singleton instance
export const roleService = new RoleService();
