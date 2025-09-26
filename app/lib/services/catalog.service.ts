import { PrismaClient } from '@prisma/client';
import {
  CatalogCategory,
  ProductProperty,
  CategoryPropertyAssignment,
  ImportTemplate,
  ExportSetting,
  FrontendCategory,
  CreateCatalogCategoryDto,
  UpdateCatalogCategoryDto,
  CreateProductPropertyDto,
  UpdateProductPropertyDto,
  CreatePropertyAssignmentDto,
  UpdatePropertyAssignmentDto,
  CreateImportTemplateDto,
  CreateExportSettingDto,
  CreateFrontendCategoryDto,
  CatalogTreeResponse,
  PropertyModerationResponse,
  CategoryWithPropertiesResponse
} from '../types/catalog';

const prisma = new PrismaClient();

export class CatalogService {
  // ===========================================
  // КАТАЛОГ КАТЕГОРИЙ
  // ===========================================

  async getCatalogTree(): Promise<CatalogTreeResponse> {
    const categories = await prisma.catalogCategory.findMany({
      where: { is_active: true },
      orderBy: [
        { level: 'asc' },
        { sort_order: 'asc' },
        { name: 'asc' }
      ],
      include: {
        subcategories: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    // Добавляем счетчики товаров
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      products_count: category._count.products
    }));

    return {
      categories: categoriesWithCounts,
      total_count: categories.length
    };
  }

  async getCategoryById(id: string): Promise<CategoryWithPropertiesResponse | null> {
    const category = await prisma.catalogCategory.findUnique({
      where: { id },
      include: {
        property_assignments: {
          include: {
            product_property: true
          },
          orderBy: { sort_order: 'asc' }
        },
        import_templates: true,
        export_settings: true,
        subcategories: {
          where: { is_active: true },
          orderBy: { sort_order: 'asc' }
        },
        parent: true,
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) return null;

    return {
      ...category,
      products_count: category._count.products
    };
  }

  async createCategory(data: CreateCatalogCategoryDto): Promise<CatalogCategory> {
    // Определяем уровень и путь
    let level = 0;
    let path = '';
    
    if (data.parent_id) {
      const parent = await prisma.catalogCategory.findUnique({
        where: { id: data.parent_id }
      });
      
      if (parent) {
        level = parent.level + 1;
        path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
      }
    }

    const category = await prisma.catalogCategory.create({
      data: {
        ...data,
        level,
        path,
        sort_order: data.sort_order || 0
      }
    });

    return category;
  }

  async updateCategory(id: string, data: UpdateCatalogCategoryDto): Promise<CatalogCategory> {
    // Если меняется родитель, нужно пересчитать уровень и путь
    if (data.parent_id !== undefined) {
      let level = 0;
      let path = '';
      
      if (data.parent_id) {
        const parent = await prisma.catalogCategory.findUnique({
          where: { id: data.parent_id }
        });
        
        if (parent) {
          level = parent.level + 1;
          path = parent.path ? `${parent.path}/${parent.id}` : parent.id;
        }
      }

      return prisma.catalogCategory.update({
        where: { id },
        data: {
          ...data,
          level,
          path
        }
      });
    }

    return prisma.catalogCategory.update({
      where: { id },
      data
    });
  }

  async deleteCategory(id: string): Promise<void> {
    // Проверяем, есть ли подкатегории или товары
    const category = await prisma.catalogCategory.findUnique({
      where: { id },
      include: {
        subcategories: true,
        products: true
      }
    });

    if (!category) {
      throw new Error('Категория не найдена');
    }

    if (category.subcategories.length > 0) {
      throw new Error('Нельзя удалить категорию с подкатегориями');
    }

    if (category.products.length > 0) {
      throw new Error('Нельзя удалить категорию с товарами');
    }

    await prisma.catalogCategory.delete({
      where: { id }
    });
  }

  // ===========================================
  // СВОЙСТВА ТОВАРОВ
  // ===========================================

  async getPropertiesForModeration(): Promise<PropertyModerationResponse> {
    const properties = await prisma.productProperty.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        category_assignments: {
          include: {
            catalog_category: true
          }
        }
      }
    });

    const pendingCount = properties.filter(p => 
      p.category_assignments.length === 0
    ).length;

    return {
      properties,
      pending_count: pendingCount,
      total_count: properties.length
    };
  }

  async createProperty(data: CreateProductPropertyDto): Promise<ProductProperty> {
    return prisma.productProperty.create({
      data: {
        ...data,
        options: data.options ? JSON.stringify(data.options) : null
      }
    });
  }

  async updateProperty(id: string, data: UpdateProductPropertyDto): Promise<ProductProperty> {
    return prisma.productProperty.update({
      where: { id },
      data: {
        ...data,
        options: data.options ? JSON.stringify(data.options) : undefined
      }
    });
  }

  async deleteProperty(id: string): Promise<void> {
    // Проверяем, используется ли свойство
    const assignments = await prisma.categoryPropertyAssignment.findMany({
      where: { product_property_id: id }
    });

    if (assignments.length > 0) {
      throw new Error('Нельзя удалить свойство, которое используется в категориях');
    }

    await prisma.productProperty.delete({
      where: { id }
    });
  }

  // ===========================================
  // НАЗНАЧЕНИЕ СВОЙСТВ КАТЕГОРИЯМ
  // ===========================================

  async assignPropertyToCategory(data: CreatePropertyAssignmentDto): Promise<CategoryPropertyAssignment> {
    // Проверяем, не назначено ли уже это свойство этой категории
    const existing = await prisma.categoryPropertyAssignment.findUnique({
      where: {
        catalog_category_id_product_property_id: {
          catalog_category_id: data.catalog_category_id,
          product_property_id: data.product_property_id
        }
      }
    });

    if (existing) {
      throw new Error('Свойство уже назначено этой категории');
    }

    return prisma.categoryPropertyAssignment.create({
      data,
      include: {
        product_property: true,
        catalog_category: true
      }
    });
  }

  async updatePropertyAssignment(id: string, data: UpdatePropertyAssignmentDto): Promise<CategoryPropertyAssignment> {
    return prisma.categoryPropertyAssignment.update({
      where: { id },
      data,
      include: {
        product_property: true,
        catalog_category: true
      }
    });
  }

  async removePropertyAssignment(id: string): Promise<void> {
    await prisma.categoryPropertyAssignment.delete({
      where: { id }
    });
  }

  // ===========================================
  // ШАБЛОНЫ ИМПОРТА
  // ===========================================

  async createImportTemplate(data: CreateImportTemplateDto): Promise<ImportTemplate> {
    return prisma.importTemplate.create({
      data: {
        ...data,
        required_fields: JSON.stringify(data.required_fields),
        calculator_fields: JSON.stringify(data.calculator_fields),
        export_fields: JSON.stringify(data.export_fields)
      }
    });
  }

  async getImportTemplatesByCategory(categoryId: string): Promise<ImportTemplate[]> {
    const templates = await prisma.importTemplate.findMany({
      where: { catalog_category_id: categoryId },
      orderBy: { created_at: 'desc' }
    });

    return templates.map(template => ({
      ...template,
      required_fields: JSON.parse(template.required_fields),
      calculator_fields: JSON.parse(template.calculator_fields),
      export_fields: JSON.parse(template.export_fields)
    }));
  }

  // ===========================================
  // НАСТРОЙКИ ЭКСПОРТА
  // ===========================================

  async createExportSetting(data: CreateExportSettingDto): Promise<ExportSetting> {
    return prisma.exportSetting.create({
      data: {
        ...data,
        fields_config: JSON.stringify(data.fields_config),
        display_config: JSON.stringify(data.display_config)
      }
    });
  }

  async getExportSettingsByCategory(categoryId: string): Promise<ExportSetting[]> {
    const settings = await prisma.exportSetting.findMany({
      where: { catalog_category_id: categoryId },
      orderBy: { export_type: 'asc' }
    });

    return settings.map(setting => ({
      ...setting,
      fields_config: JSON.parse(setting.fields_config),
      display_config: JSON.parse(setting.display_config)
    }));
  }

  // ===========================================
  // КАТЕГОРИИ ФРОНТА
  // ===========================================

  async getFrontendCategories(): Promise<FrontendCategory[]> {
    const categories = await prisma.frontendCategory.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });

    return categories.map(category => ({
      ...category,
      catalog_category_ids: JSON.parse(category.catalog_category_ids),
      display_config: JSON.parse(category.display_config)
    }));
  }

  async getFrontendCategoryById(id: string): Promise<FrontendCategory | null> {
    const category = await prisma.frontendCategory.findUnique({
      where: { id }
    });

    if (!category) return null;

    return {
      ...category,
      catalog_category_ids: JSON.parse(category.catalog_category_ids),
      display_config: JSON.parse(category.display_config)
    };
  }

  async getFrontendCategoryBySlug(slug: string): Promise<FrontendCategory | null> {
    const category = await prisma.frontendCategory.findUnique({
      where: { slug }
    });

    if (!category) return null;

    return {
      ...category,
      catalog_category_ids: JSON.parse(category.catalog_category_ids),
      display_config: JSON.parse(category.display_config)
    };
  }

  async createFrontendCategory(data: CreateFrontendCategoryDto): Promise<FrontendCategory> {
    const category = await prisma.frontendCategory.create({
      data: {
        ...data,
        catalog_category_ids: JSON.stringify(data.catalog_category_ids),
        display_config: JSON.stringify(data.display_config || {})
      }
    });

    return {
      ...category,
      catalog_category_ids: JSON.parse(category.catalog_category_ids),
      display_config: JSON.parse(category.display_config)
    };
  }

  async updateFrontendCategory(id: string, data: Partial<CreateFrontendCategoryDto>): Promise<FrontendCategory> {
    const updateData: any = { ...data };
    
    if (data.catalog_category_ids) {
      updateData.catalog_category_ids = JSON.stringify(data.catalog_category_ids);
    }
    
    if (data.display_config) {
      updateData.display_config = JSON.stringify(data.display_config);
    }

    const category = await prisma.frontendCategory.update({
      where: { id },
      data: updateData
    });

    return {
      ...category,
      catalog_category_ids: JSON.parse(category.catalog_category_ids),
      display_config: JSON.parse(category.display_config)
    };
  }

  async deleteFrontendCategory(id: string): Promise<void> {
    // Проверяем, используется ли категория
    // Здесь можно добавить проверки на связанные данные
    
    await prisma.frontendCategory.delete({
      where: { id }
    });
  }

  // ===========================================
  // ТОВАРЫ
  // ===========================================

  async getProducts(params: {
    catalogCategoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    products: Array<{
      id: string;
      sku: string;
      name: string;
      catalog_category_id: string;
      properties_data: Record<string, any>;
      base_price: number;
      currency: string;
      stock_quantity: number;
      is_active: boolean;
      created_at: Date;
      updated_at: Date;
      catalog_category: {
        id: string;
        name: string;
        level: number;
        path: string;
      };
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      catalogCategoryId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = params;

    const skip = (page - 1) * limit;

    // Формируем условия поиска
    const where: any = {};

    if (catalogCategoryId) {
      where.catalog_category_id = catalogCategoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Получаем товары
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          catalog_category: {
            select: {
              id: true,
              name: true,
              level: true,
              path: true
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    const processedProducts = products.map(product => ({
      ...product,
      properties_data: JSON.parse(product.properties_data)
    }));

    return {
      products: processedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getProductById(id: string): Promise<{
    id: string;
    sku: string;
    name: string;
    catalog_category_id: string;
    properties_data: Record<string, any>;
    base_price: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    catalog_category: {
      id: string;
      name: string;
      level: number;
      path: string;
    };
  } | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
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

    if (!product) return null;

    return {
      ...product,
      properties_data: JSON.parse(product.properties_data)
    };
  }

  async getProductBySku(sku: string): Promise<{
    id: string;
    sku: string;
    name: string;
    catalog_category_id: string;
    properties_data: Record<string, any>;
    base_price: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  } | null> {
    const product = await prisma.product.findUnique({
      where: { sku }
    });

    if (!product) return null;

    return {
      ...product,
      properties_data: JSON.parse(product.properties_data)
    };
  }

  async createProduct(data: {
    sku: string;
    name: string;
    catalog_category_id: string;
    properties_data?: Record<string, any>;
    base_price?: number;
    currency?: string;
    stock_quantity?: number;
    is_active?: boolean;
  }): Promise<{
    id: string;
    sku: string;
    name: string;
    catalog_category_id: string;
    properties_data: Record<string, any>;
    base_price: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }> {
    const product = await prisma.product.create({
      data: {
        ...data,
        properties_data: JSON.stringify(data.properties_data || {}),
        base_price: data.base_price || 0,
        currency: data.currency || 'RUB',
        stock_quantity: data.stock_quantity || 0,
        is_active: data.is_active !== undefined ? data.is_active : true
      }
    });

    return {
      ...product,
      properties_data: JSON.parse(product.properties_data)
    };
  }

  async updateProduct(id: string, data: Partial<{
    sku: string;
    name: string;
    catalog_category_id: string;
    properties_data: Record<string, any>;
    base_price: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
  }>): Promise<{
    id: string;
    sku: string;
    name: string;
    catalog_category_id: string;
    properties_data: Record<string, any>;
    base_price: number;
    currency: string;
    stock_quantity: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }> {
    const updateData: any = { ...data };
    
    if (data.properties_data) {
      updateData.properties_data = JSON.stringify(data.properties_data);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return {
      ...product,
      properties_data: JSON.parse(product.properties_data)
    };
  }

  async deleteProduct(id: string): Promise<void> {
    // Проверяем, используется ли товар в заказах
    // Здесь можно добавить проверки на связанные данные
    
    await prisma.product.delete({
      where: { id }
    });
  }

  // ===========================================
  // ПОИСК И ФИЛЬТРАЦИЯ
  // ===========================================

  async searchCategories(query: string): Promise<CatalogCategory[]> {
    return prisma.catalogCategory.findMany({
      where: {
        is_active: true,
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      orderBy: { name: 'asc' },
      take: 20
    });
  }

  async getCategoriesByLevel(level: number): Promise<CatalogCategory[]> {
    return prisma.catalogCategory.findMany({
      where: {
        level,
        is_active: true
      },
      orderBy: { sort_order: 'asc' }
    });
  }
}

export const catalogService = new CatalogService();
