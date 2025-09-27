import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===================== Создание новой категории =====================

export async function POST(req: NextRequest) {
  try {
    const { name, slug, description, icon, parentId } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Не указано название или slug категории' },
        { status: 400 }
      );
    }

    // Проверяем уникальность slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Категория с таким slug уже существует' },
        { status: 400 }
      );
    }

    // Определяем уровень категории
    let level = 0;
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId }
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    // Создаем категорию
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || '',
        icon: icon || '📦',
        parent_id: parentId || null,
        level,
        sort_order: 0,
        is_active: true,
        configurator_config: '{}',
        page_template: null,
        custom_layout: null,
        properties: '[]',
        import_mapping: '{}'
      }
    });

    return NextResponse.json({
      success: true,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        icon: newCategory.icon,
        level: newCategory.level,
        isActive: newCategory.is_active,
        createdAt: newCategory.created_at,
        updatedAt: newCategory.updated_at
      },
      message: 'Категория успешно создана'
    });

  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании категории' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ===================== Получение списка категорий =====================

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { sort_order: 'asc' },
        { name: 'asc' }
      ]
    });

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      parentId: category.parent_id,
      level: category.level,
      sortOrder: category.sort_order,
      isActive: category.is_active,
      productsCount: category._count.products,
      subcategoriesCount: category._count.subcategories,
      configuratorConfig: category.configurator_config ? JSON.parse(category.configurator_config) : {},
      pageTemplate: category.page_template,
      customLayout: category.custom_layout ? JSON.parse(category.custom_layout) : null,
      properties: category.properties ? JSON.parse(category.properties) : [],
      importMapping: category.import_mapping ? JSON.parse(category.import_mapping) : {},
      createdAt: category.created_at,
      updatedAt: category.updated_at
    }));

    return NextResponse.json({
      success: true,
      categories: formattedCategories
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении категорий' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}