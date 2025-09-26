import { NextRequest, NextResponse } from 'next/server';
import { catalogService } from '@/lib/services/catalog.service';

// GET /api/catalog/products - Получить товары
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const catalogCategoryId = searchParams.get('catalogCategoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const products = await catalogService.getProducts({
      catalogCategoryId,
      search,
      page,
      limit,
      sortBy,
      sortOrder
    });

    return NextResponse.json(products);

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/catalog/products - Создать товар
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Валидация
    if (!data.sku || data.sku.trim().length === 0) {
      return NextResponse.json(
        { error: 'SKU is required' },
        { status: 400 }
      );
    }

    if (!data.name || data.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!data.catalog_category_id) {
      return NextResponse.json(
        { error: 'Catalog category ID is required' },
        { status: 400 }
      );
    }

    // Проверяем уникальность SKU
    const existingProduct = await catalogService.getProductBySku(data.sku);
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this SKU already exists' },
        { status: 400 }
      );
    }

    const product = await catalogService.createProduct(data);
    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
