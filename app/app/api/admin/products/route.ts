import { NextRequest, NextResponse } from "next/server";

// Простое хранилище в памяти для демонстрации
// В реальном приложении это будет база данных
let importedProducts: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('=== PRODUCTS API CALL ===');
    console.log('Category:', category);
    console.log('Limit:', limit);
    console.log('Offset:', offset);
    console.log('Total products in storage:', importedProducts.length);

    let filteredProducts = importedProducts;
    
    if (category) {
      filteredProducts = importedProducts.filter(p => p.category === category);
      console.log('Filtered products for category:', filteredProducts.length);
    }

    const paginatedProducts = filteredProducts.slice(offset, offset + limit);
    console.log('Paginated products:', paginatedProducts.length);

    return NextResponse.json({
      products: paginatedProducts,
      total: filteredProducts.length,
      category: category || 'all',
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < filteredProducts.length
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: "Ошибка получения товаров" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { products, category } = await req.json();
    
    // Добавляем товары в хранилище
    const productsWithIds = products.map((product: any, index: number) => ({
      ...product,
      id: `product_${Date.now()}_${index}`,
      category: category || 'unknown',
      imported_at: new Date().toISOString()
    }));
    
    importedProducts.push(...productsWithIds);
    
    return NextResponse.json({ 
      success: true, 
      imported: productsWithIds.length,
      total: importedProducts.length
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: "Ошибка импорта товаров" },
      { status: 500 }
    );
  }
}
