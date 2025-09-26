import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/configurator/category-links/[id] - Получить связь по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const link = await prisma.configuratorCategoryLink.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!link) {
      return NextResponse.json(
        { success: false, message: 'Связь не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      link
    });
  } catch (error) {
    console.error('Error fetching category link:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении связи категорий' },
      { status: 500 }
    );
  }
}

// PUT /api/configurator/category-links/[id] - Обновить связь
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      link_type, 
      display_order, 
      is_required, 
      pricing_type, 
      formula, 
      export_as_separate 
    } = body;

    const link = await prisma.configuratorCategoryLink.update({
      where: { id: params.id },
      data: {
        link_type,
        display_order,
        is_required,
        pricing_type,
        formula,
        export_as_separate
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
    console.error('Error updating category link:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении связи категорий' },
      { status: 500 }
    );
  }
}

// DELETE /api/configurator/category-links/[id] - Удалить связь
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.configuratorCategoryLink.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Связь удалена'
    });
  } catch (error) {
    console.error('Error deleting category link:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении связи категорий' },
      { status: 500 }
    );
  }
}
