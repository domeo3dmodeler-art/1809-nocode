import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Демо-пользователи (в реальном проекте будет база данных)
const demoUsers = [
  {
    id: '1',
    email: 'admin@domeo.ru',
    password: 'admin123',
    role: 'admin',
    name: 'Администратор',
    permissions: ['products.import', 'products.manage', 'categories.create', 'users.manage']
  },
  {
    id: '2',
    email: 'sales@domeo.ru',
    password: 'sales123',
    role: 'complectator',
    name: 'Комплектатор',
    permissions: ['catalog.view', 'pricing.calculate', 'quotes.create', 'quotes.export']
  },
  {
    id: '3',
    email: 'executor@domeo.ru',
    password: 'executor123',
    role: 'executor',
    name: 'Исполнитель заказа',
    permissions: ['catalog.view', 'pricing.calculate', 'quotes.create', 'factory.order']
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'domeo-secret-key';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Ищем пользователя
    const user = demoUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Возвращаем данные пользователя (без пароля)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
