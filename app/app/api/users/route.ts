import { NextRequest, NextResponse } from 'next/server';

// Общий массив пользователей (в реальном проекте будет база данных)
let demoUsers = [
  {
    id: '1',
    email: 'admin@domeo.ru',
    password: 'admin123',
    role: 'admin',
    name: 'Иванов Петр Владимирович',
    firstName: 'Петр',
    lastName: 'Иванов',
    middleName: 'Владимирович',
    permissions: ['products.import', 'products.manage', 'categories.create', 'users.manage'],
    createdAt: '2024-01-01',
    lastLogin: '2024-01-30',
    isActive: true
  },
  {
    id: '2',
    email: 'sales@domeo.ru',
    password: 'sales123',
    role: 'complectator',
    name: 'Петров Иван Сергеевич',
    firstName: 'Иван',
    lastName: 'Петров',
    middleName: 'Сергеевич',
    permissions: ['catalog.view', 'pricing.calculate', 'quotes.create', 'quotes.export'],
    createdAt: '2024-01-05',
    lastLogin: '2024-01-29',
    isActive: true
  },
  {
    id: '3',
    email: 'executor@domeo.ru',
    password: 'executor123',
    role: 'executor',
    name: 'Сидоров Алексей Михайлович',
    firstName: 'Алексей',
    lastName: 'Сидоров',
    middleName: 'Михайлович',
    permissions: ['catalog.view', 'pricing.calculate', 'quotes.create', 'factory.order'],
    createdAt: '2024-01-10',
    lastLogin: '2024-01-28',
    isActive: true
  },
  {
    id: '4',
    email: 'sales2@domeo.ru',
    password: 'sales2123',
    role: 'complectator',
    name: 'Смирнова Анна Александровна',
    firstName: 'Анна',
    lastName: 'Смирнова',
    middleName: 'Александровна',
    permissions: ['catalog.view', 'pricing.calculate', 'quotes.create', 'quotes.export'],
    createdAt: '2024-01-15',
    lastLogin: '2024-01-25',
    isActive: false
  }
];

export async function GET(req: NextRequest) {
  try {
    // Возвращаем список пользователей без паролей
    const usersWithoutPasswords = demoUsers.map(({ password, ...user }) => user);
    
    return NextResponse.json({
      success: true,
      users: usersWithoutPasswords
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, middleName, role } = await req.json();

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    // Проверяем, что пользователь с таким email не существует
    const existingUser = demoUsers.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Валидация пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен быть не короче 6 символов' },
        { status: 400 }
      );
    }

    // Валидация роли
    const validRoles = ['admin', 'complectator', 'executor'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Недопустимая роль пользователя' },
        { status: 400 }
      );
    }

    // Создаем нового пользователя
    const newUser = {
      id: (demoUsers.length + 1).toString(),
      email,
      password,
      role,
      name: `${lastName} ${firstName} ${middleName || ''}`.trim(),
      firstName,
      lastName,
      middleName: middleName || '',
      permissions: getRolePermissions(role),
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null,
      isActive: true
    };

    // Добавляем пользователя в общий массив
    demoUsers.push(newUser);

    // Возвращаем данные пользователя (без пароля)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Пользователь успешно создан',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

function getRolePermissions(role: string): string[] {
  const permissions: { [key: string]: string[] } = {
    'admin': ['products.import', 'products.manage', 'categories.create', 'users.manage'],
    'complectator': ['catalog.view', 'pricing.calculate', 'quotes.create', 'quotes.export'],
    'executor': ['catalog.view', 'pricing.calculate', 'quotes.create', 'factory.order']
  };
  return permissions[role] || [];
}

// Экспортируем массив для использования в других API
export { demoUsers };
