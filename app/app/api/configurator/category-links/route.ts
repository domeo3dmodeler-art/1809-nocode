import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/configurator/category-links - Получить все связи категорий
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configuratorCategoryId = searchParams.get('configuratorCategoryId');

    const where = configuratorCategoryId ? { configurator_category_id: configuratorCategoryId } : {};

    const links = await prisma.configuratorCategoryLink.findMany({
      where,
      include: {
        configurator_category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        catalog_category: {
          select: {
            id: true,
            name: true,
            level: true,
            path: true
          }
        },
        hierarchies: {
          include: {
            parent_category: {
              select: {
                id: true,
                name: true
              }
            },
            child_category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        display_order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      links
    });
  } catch (error) {
    console.error('Error fetching category links:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении связей категорий' },
      { status: 500 }
    );
  }
}

// POST /api/configurator/category-links - Создать новую связь категорий
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      configurator_category_id, 
      catalog_category_id, 
      link_type, 
      display_order, 
      is_required, 
      pricing_type, 
      formula, 
      export_as_separate 
    } = body;

    if (!configurator_category_id || !catalog_category_id || !link_type) {
      return NextResponse.json(
        { success: false, message: 'Не указаны обязательные поля' },
        { status: 400 }
      );
    }

    // Проверяем, что связь не существует
    const existingLink = await prisma.configuratorCategoryLink.findUnique({
      where: {
        configurator_category_id_catalog_category_id: {
          configurator_category_id,
          catalog_category_id
        }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { success: false, message: 'Связь уже существует' },
        { status: 400 }
      );
    }

    const link = await prisma.configuratorCategoryLink.create({
      data: {
        configurator_category_id,
        catalog_category_id,
        link_type,
        display_order: display_order || 0,
        is_required: is_required || false,
        pricing_type: pricing_type || 'separate',
        formula: formula || null,
        export_as_separate: export_as_separate !== undefined ? export_as_separate : true
      },
      include: {
        configurator_category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        catalog_category: {
          select: {
            id: true,
            name: true,
            level: true,
            path: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Error creating category link:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при создании связи категорий' },
      { status: 500 }
    );
  }
}
