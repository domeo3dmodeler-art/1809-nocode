// lib/auth/roles.ts
// Система ролей и прав доступа

export type Role = 'admin' | 'manager' | 'sales' | 'viewer';

export type Permission = 
  | 'quotes.create'
  | 'quotes.read'
  | 'quotes.update'
  | 'quotes.delete'
  | 'quotes.export'
  | 'quotes.change_status'
  | 'templates.create'
  | 'templates.read'
  | 'templates.update'
  | 'templates.delete'
  | 'analytics.read'
  | 'users.manage'
  | 'settings.manage';

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
};

class RoleService {
  private roleDefinitions: RoleDefinition[] = [
    {
      role: 'admin',
      name: 'Администратор',
      description: 'Полный доступ ко всем функциям системы',
      permissions: [
        'quotes.create',
        'quotes.read',
        'quotes.update',
        'quotes.delete',
        'quotes.export',
        'quotes.change_status',
        'templates.create',
        'templates.read',
        'templates.update',
        'templates.delete',
        'analytics.read',
        'users.manage',
        'settings.manage'
      ],
      level: 100
    },
    {
      role: 'manager',
      name: 'Менеджер',
      description: 'Управление КП и аналитика',
      permissions: [
        'quotes.create',
        'quotes.read',
        'quotes.update',
        'quotes.change_status',
        'quotes.export',
        'templates.create',
        'templates.read',
        'templates.update',
        'analytics.read'
      ],
      level: 80
    },
    {
      role: 'sales',
      name: 'Продавец',
      description: 'Работа с КП и клиентами',
      permissions: [
        'quotes.create',
        'quotes.read',
        'quotes.update',
        'quotes.change_status',
        'quotes.export',
        'templates.read'
      ],
      level: 60
    },
    {
      role: 'viewer',
      name: 'Наблюдатель',
      description: 'Только просмотр КП и аналитики',
      permissions: [
        'quotes.read',
        'analytics.read'
      ],
      level: 20
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

  // Проверить, может ли роль выполнить действие
  canPerformAction(role: Role, action: string): boolean {
    const permissions = this.getRolePermissions(role);
    return permissions.some(permission => permission.includes(action));
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

  // Проверить доступ к КП
  canAccessQuote(role: Role, quoteStatus: string, action: 'read' | 'update' | 'delete' | 'change_status'): boolean {
    const permissions = this.getRolePermissions(role);
    
    switch (action) {
      case 'read':
        return permissions.includes('quotes.read');
      
      case 'update':
        if (!permissions.includes('quotes.update')) return false;
        // Только создатель или менеджер может редактировать принятые КП
        if (quoteStatus === 'accepted') {
          return permissions.includes('quotes.change_status');
        }
        return true;
      
      case 'delete':
        if (!permissions.includes('quotes.delete')) return false;
        // Нельзя удалять принятые КП
        if (quoteStatus === 'accepted') return false;
        return true;
      
      case 'change_status':
        return permissions.includes('quotes.change_status');
      
      default:
        return false;
    }
  }

  // Проверить доступ к экспорту
  canExportQuote(role: Role, quoteStatus: string): boolean {
    if (!this.hasPermission(role, 'quotes.export')) return false;
    
    // Только принятые КП можно экспортировать на фабрику
    if (quoteStatus === 'accepted') return true;
    
    // Для других статусов - только администраторы и менеджеры
    return ['admin', 'manager'].includes(role);
  }

  // Проверить доступ к аналитике
  canViewAnalytics(role: Role): boolean {
    return this.hasPermission(role, 'analytics.read');
  }

  // Проверить доступ к шаблонам
  canManageTemplates(role: Role, action: 'create' | 'read' | 'update' | 'delete'): boolean {
    const permission = `templates.${action}` as Permission;
    return this.hasPermission(role, permission);
  }

  // Получить ограничения для роли
  getRoleRestrictions(role: Role): {
    maxQuotesPerDay?: number;
    canDeleteAcceptedQuotes: boolean;
    canChangeAcceptedQuotes: boolean;
    canExportAllQuotes: boolean;
    canViewAllAnalytics: boolean;
  } {
    const restrictions = {
      maxQuotesPerDay: undefined as number | undefined,
      canDeleteAcceptedQuotes: false,
      canChangeAcceptedQuotes: false,
      canExportAllQuotes: false,
      canViewAllAnalytics: false
    };

    switch (role) {
      case 'admin':
        restrictions.canDeleteAcceptedQuotes = true;
        restrictions.canChangeAcceptedQuotes = true;
        restrictions.canExportAllQuotes = true;
        restrictions.canViewAllAnalytics = true;
        break;
      
      case 'manager':
        restrictions.canChangeAcceptedQuotes = true;
        restrictions.canExportAllQuotes = true;
        restrictions.canViewAllAnalytics = true;
        break;
      
      case 'sales':
        restrictions.maxQuotesPerDay = 50;
        break;
      
      case 'viewer':
        restrictions.maxQuotesPerDay = 0;
        break;
    }

    return restrictions;
  }
}

// Экспортируем singleton instance
export const roleService = new RoleService();
