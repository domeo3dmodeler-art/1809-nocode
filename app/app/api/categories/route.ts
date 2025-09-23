import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Универсальная система для управления категориями товаров
export async function GET(req: NextRequest) {
  try {
    // Получаем категории из базы данных
    const categories = await prisma.categories.findMany({
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json({
      categories,
      total: categories.length,
      message: "Универсальная система категорий товаров"
    });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    return NextResponse.json(
      { error: "Ошибка получения категорий" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, icon, properties, import_mapping } = body;

    // Валидация обязательных полей
    if (!name || !properties || !Array.isArray(properties)) {
      return NextResponse.json(
        { error: "Название и свойства обязательны" },
        { status: 400 }
      );
    }

    // Генерируем ID на основе названия
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    // Создаем категорию в базе данных
    const newCategory = await prisma.categories.create({
      data: {
        id,
        name,
        description: description || "",
        icon: icon || "📦",
        properties: properties,
        import_mapping: import_mapping || {}
      }
    });

    return NextResponse.json({
      message: "Категория создана успешно",
      category: newCategory
    }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    return NextResponse.json(
      { error: "Ошибка создания категории" },
      { status: 500 }
    );
  }
}
