import { NextRequest, NextResponse } from 'next/server';
import { catalogService } from '@/lib/services/catalog.service';

// GET /api/catalog/products/[id] - Получить товар по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await catalogService.getProductById(params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/catalog/products/[id] - Обновить товар
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Валидация
    if (data.sku !== undefined && (!data.sku || data.sku.trim().length === 0)) {
      return NextResponse.json(
        { error: 'SKU cannot be empty' },
        { status: 400 }
      );
    }

    if (data.name !== undefined && (!data.name || data.name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Проверяем уникальность SKU (если изменился)
    if (data.sku) {
      const existingProduct = await catalogService.getProductBySku(data.sku);
      if (existingProduct && existingProduct.id !== params.id) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
    }

    const product = await catalogService.updateProduct(params.id, data);
    return NextResponse.json(product);

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalog/products/[id] - Удалить товар
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await catalogService.deleteProduct(params.id);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
