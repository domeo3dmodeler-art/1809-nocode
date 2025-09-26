import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/configurator/export-settings - Получить все настройки экспорта
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const configuratorCategoryId = searchParams.get('configuratorCategoryId');
    const documentType = searchParams.get('documentType');

    const where: any = {};
    
    if (configuratorCategoryId) {
      where.configurator_category_id = configuratorCategoryId;
    }
    
    if (documentType) {
      where.document_type = documentType;
    }

    const settings = await prisma.exportSetting.findMany({
      where,
      include: {
        configurator_category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching export settings:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при получении настроек экспорта' },
      { status: 500 }
    );
  }
}

// POST /api/configurator/export-settings - Создать новую настройку экспорта
export async function POST(request: NextRequest) {
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

    if (!name || !document_type || !configurator_category_id) {
      return NextResponse.json(
        { success: false, message: 'Не указаны обязательные поля' },
        { status: 400 }
      );
    }

    // Проверяем уникальность названия для данной категории и типа документа
    const existingSetting = await prisma.exportSetting.findFirst({
      where: {
        name,
        configurator_category_id,
        document_type
      }
    });

    if (existingSetting) {
      return NextResponse.json(
        { success: false, message: 'Настройка с таким названием уже существует для данной категории и типа документа' },
        { status: 400 }
      );
    }

    const setting = await prisma.exportSetting.create({
      data: {
        name,
        document_type,
        configurator_category_id,
        fields_config: JSON.stringify(fields_config),
        display_options: JSON.stringify(display_options),
        header_config: JSON.stringify(header_config),
        footer_config: JSON.stringify(footer_config)
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
    console.error('Error creating export setting:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка при создании настройки экспорта' },
      { status: 500 }
    );
  }
}
