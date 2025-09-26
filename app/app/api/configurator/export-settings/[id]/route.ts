import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/configurator/export-settings/[id] - Получить настройку экспорта по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const setting = await prisma.exportSetting.findUnique({
      where: { id: params.id },
      include: {
        configurator_category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    if (!setting) {
      return NextResponse.json(
        { success: false, message: 'Настройка экспорта не найдена' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Error fetching export setting:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении настройки экспорта' },
      { status: 500 }
    );
  }
}

// PUT /api/configurator/export-settings/[id] - Обновить настройку экспорта
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      name,
      document_type,
      configurator_category_id,
      fields_config,
      display_options,
      header_config,
      footer_config
    } = body;

    // Проверяем уникальность названия (кроме текущей настройки)
    if (name) {
      const existingSetting = await prisma.exportSetting.findFirst({
        where: {
          name,
          configurator_category_id,
          document_type,
          id: { not: params.id }
        }
      });

      if (existingSetting) {
        return NextResponse.json(
          { success: false, message: 'Настройка с таким названием уже существует для данной категории и типа документа' },
          { status: 400 }
        );
      }
    }

    const setting = await prisma.exportSetting.update({
      where: { id: params.id },
      data: {
        name,
        document_type,
        configurator_category_id,
        fields_config: fields_config ? JSON.stringify(fields_config) : undefined,
        display_options: display_options ? JSON.stringify(display_options) : undefined,
        header_config: header_config ? JSON.stringify(header_config) : undefined,
        footer_config: footer_config ? JSON.stringify(footer_config) : undefined
      },
      include: {
        configurator_category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Error updating export setting:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при обновлении настройки экспорта' },
      { status: 500 }
    );
  }
}

// DELETE /api/configurator/export-settings/[id] - Удалить настройку экспорта
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.exportSetting.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Настройка экспорта удалена'
    });
  } catch (error) {
    console.error('Error deleting export setting:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при удалении настройки экспорта' },
      { status: 500 }
    );
  }
}
