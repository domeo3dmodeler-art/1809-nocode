import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products/category/[categoryId] - Получить товары категории с фильтрами
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = params.categoryId;
    
    // Параметры фильтрации
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search') || '';
    
    // Фильтры по свойствам (JSON строка)
    const filtersParam = searchParams.get('filters');
    let filters: { [key: string]: any } = {};
    if (filtersParam) {
      try {
        filters = JSON.parse(filtersParam);
      } catch (e) {
        console.warn('Invalid filters parameter:', filtersParam);
      }
    }
    
    // Поля для отображения
    const fieldsParam = searchParams.get('fields');
    let displayFields: string[] = ['id', 'sku', 'name', 'base_price', 'currency'];
    if (fieldsParam) {
      try {
        displayFields = JSON.parse(fieldsParam);
      } catch (e) {
        console.warn('Invalid fields parameter:', fieldsParam);
      }
    }
    
    // Базовый запрос
    const where: any = {
      catalog_category_id: categoryId,
      is_active: true
    };
    
    // Поиск по названию и описанию
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Фильтры по свойствам товара
    if (Object.keys(filters).length > 0) {
      const propertyConditions: any[] = [];
      
      for (const [propertyKey, propertyValue] of Object.entries(filters)) {
        if (propertyValue !== null && propertyValue !== undefined && propertyValue !== '') {
          // Поиск в properties_data JSON
          propertyConditions.push({
            properties_data: {
              path: [propertyKey],
              equals: propertyValue
            }
          });
        }
      }
      
      if (propertyConditions.length > 0) {
        where.AND = propertyConditions;
      }
    }
    
    // Подсчет общего количества
    const totalCount = await prisma.product.count({ where });
    
    // Получение товаров с пагинацией
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        sku: true,
        name: true,
        description: true,
        brand: true,
        model: true,
        series: true,
        base_price: true,
        currency: true,
        stock_quantity: true,
        min_order_qty: true,
        weight: true,
        dimensions: true,
        specifications: true,
        properties_data: true,
        tags: true,
        is_active: true,
        is_featured: true,
        created_at: true,
        updated_at: true,
        images: {
          select: {
            id: true,
            url: true,
            alt_text: true,
            is_primary: true,
            sort_order: true
          },
          orderBy: [
            { is_primary: 'desc' },
            { sort_order: 'asc' }
          ]
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Обработка свойств товаров
    const processedProducts = products.map(product => {
      let propertiesData = {};
      try {
        propertiesData = JSON.parse(product.properties_data || '{}');
      } catch (e) {
        console.warn('Invalid properties_data for product:', product.id);
      }
      
      return {
        ...product,
        properties_data: propertiesData, // Заменяем строку на объект
        properties: propertiesData,
        primaryImage: product.images.find(img => img.is_primary) || product.images[0] || null,
        images: product.images
      };
    });
    
    // Получение доступных свойств для фильтрации
    const availableProperties = await getAvailableProperties(categoryId);
    
    return NextResponse.json({
      success: true,
      data: {
        products: processedProducts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        filters: {
          available: availableProperties,
          applied: filters
        },
        displayFields
      }
    });
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Функция для получения доступных свойств категории
async function getAvailableProperties(categoryId: string) {
  try {
    // Получаем все товары категории для анализа свойств
    const products = await prisma.product.findMany({
      where: {
        catalog_category_id: categoryId,
        is_active: true
      },
      select: {
        properties_data: true
      },
      take: 100 // Ограничиваем для производительности
    });
    
    const propertiesMap = new Map<string, Set<string>>();
    
    products.forEach(product => {
      try {
        const properties = JSON.parse(product.properties_data || '{}');
        Object.entries(properties).forEach(([key, value]) => {
          if (!propertiesMap.has(key)) {
            propertiesMap.set(key, new Set());
          }
          if (value !== null && value !== undefined) {
            propertiesMap.get(key)!.add(String(value));
          }
        });
      } catch (e) {
        // Игнорируем невалидные данные
      }
    });
    
    // Преобразуем в массив объектов
    const availableProperties = Array.from(propertiesMap.entries()).map(([key, values]) => ({
      key,
      type: 'select', // По умолчанию select, можно определить тип по значениям
      values: Array.from(values).sort(),
      count: values.size
    }));
    
    return availableProperties;
    
  } catch (error) {
    console.error('Error getting available properties:', error);
    return [];
  }
}


