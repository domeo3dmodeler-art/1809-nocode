import { NextRequest, NextResponse } from 'next/server';
import { catalogService } from '@/lib/services/catalog.service';
import { CreateProductPropertyDto } from '@/lib/types/catalog';

// GET /api/catalog/properties - Получить свойства для модерации
export async function GET(request: NextRequest) {
  try {
    const result = await catalogService.getPropertiesForModeration();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching product properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product properties' },
      { status: 500 }
    );
  }
}

// POST /api/catalog/properties - Создать новое свойство
export async function POST(request: NextRequest) {
  try {
    const data: CreateProductPropertyDto = await request.json();

    // Валидация
    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!data.type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    const validTypes = ['text', 'number', 'select', 'boolean', 'date', 'file'];
    if (!validTypes.includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid property type' },
        { status: 400 }
      );
    }

    // Для select полей нужны опции
    if (data.type === 'select' && (!data.options || data.options.length === 0)) {
      return NextResponse.json(
        { error: 'Options are required for select type' },
        { status: 400 }
      );
    }

    const property = await catalogService.createProperty(data);
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating product property:', error);
    return NextResponse.json(
      { error: 'Failed to create product property' },
      { status: 500 }
    );
  }
}
