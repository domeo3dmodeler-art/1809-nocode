import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Простая валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 }
      );
    }

    // В реальном приложении здесь была бы проверка в базе данных
    // Пока что просто возвращаем токен для демо
    const token = `demo-token-${Date.now()}`;
    
    return NextResponse.json(
      { 
        message: "Вход выполнен успешно", 
        token,
        user: { email }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 }
    );
  }
}
