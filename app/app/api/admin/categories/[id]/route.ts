import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ===================== Удаление категории =====================

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Не указан ID категории' },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Проверяем, есть ли связанные данные
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию с товарами. Сначала удалите все товары.' },
        { status: 400 }
      );
    }

    if (category._count.subcategories > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию с подкатегориями. Сначала удалите все подкатегории.' },
        { status: 400 }
      );
    }

    // Удаляем категорию
    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Категория успешно удалена'
    });

  } catch (error) {
    console.error('Category deletion error:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении категории' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ===================== Получение категории по ID =====================

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Не указан ID категории' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
            subcategories: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    const formattedCategory = {
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
    };

    return NextResponse.json({
      success: true,
      category: formattedCategory
    });

  } catch (error) {
    console.error('Category fetch error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении категории' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
