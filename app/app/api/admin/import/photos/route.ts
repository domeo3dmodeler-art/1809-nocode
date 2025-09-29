import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// POST /api/admin/import/photos - Загрузка фотографий товаров
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photos = formData.getAll('photos') as File[];
    const category = formData.get('category') as string;
    const mappingProperty = formData.get('mapping_property') as string;

    console.log('=== ЗАГРУЗКА ФОТО ===');
    console.log('Количество фото:', photos.length);
    console.log('Категория:', category);
    console.log('Свойство для привязки:', mappingProperty);

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Не выбраны фотографии для загрузки' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Не указана категория для загрузки' },
        { status: 400 }
      );
    }

    if (!mappingProperty) {
      return NextResponse.json(
        { success: false, message: 'Не указано свойство для привязки фото' },
        { status: 400 }
      );
    }

    // Создаем директорию для загрузки
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', category);
    
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('Директория создана:', uploadDir);
    } catch (error) {
      console.log('Директория уже существует или ошибка создания:', error);
    }

    const uploadedPhotos: any[] = [];
    const uploadErrors: string[] = [];

    // Загружаем фотографии
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        console.log(`Загружаем фото ${i + 1}/${photos.length}: ${photo.name}`);
        
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Генерируем уникальное имя файла
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}_${randomString}_${photo.name}`;
        const filePath = path.join(uploadDir, fileName);
        
        await writeFile(filePath, buffer);
        
        // Сохраняем информацию о загруженной фотографии
        uploadedPhotos.push({
          originalName: photo.name,
          fileName: fileName,
          filePath: `/uploads/products/${category}/${fileName}`,
          size: photo.size,
          type: photo.type
        });
        
        console.log(`Photo ${i} uploaded successfully:`, fileName);
        
      } catch (error) {
        console.error(`Error uploading photo ${i}:`, error);
        uploadErrors.push(`Ошибка при загрузке ${photo.name}: ${error.message}`);
      }
    }
    
    // Привязываем фото к товарам, если указано свойство для привязки
    let linkedPhotos = 0;
    if (mappingProperty && uploadedPhotos.length > 0) {
      console.log('Привязка фото к товарам по свойству:', mappingProperty);
      
      try {
        // Получаем все товары из категории
        const products = await prisma.product.findMany({
          where: {
            catalog_category_id: category
          },
          select: {
            id: true,
            sku: true,
            properties_data: true
          }
        });
        
        console.log(`Найдено ${products.length} товаров в категории ${category}`);
        
        if (products.length > 0) {
          console.log('Пример товара:', products[0]);
          try {
            const sampleProperties = JSON.parse(products[0].properties_data || '{}');
            console.log('Свойства примера товара:', Object.keys(sampleProperties));
            console.log(`Значение ${mappingProperty} в примере:`, sampleProperties[mappingProperty]);
          } catch (error) {
            console.error('Ошибка парсинга примера:', error);
          }
        }
        
        for (const photo of uploadedPhotos) {
          // Извлекаем имя файла без расширения для поиска
          const fileNameWithoutExt = path.parse(photo.originalName).name;
          
          console.log(`\n=== ОБРАБОТКА ФОТО: ${photo.originalName} ===`);
          console.log(`Имя файла без расширения: ${fileNameWithoutExt}`);
          console.log(`Свойство для поиска: ${mappingProperty}`);
          
          // Находим ВСЕ товары с таким же значением свойства
          const matchingProducts = products.filter(product => {
            try {
              const properties = JSON.parse(product.properties_data || '{}');
              
              // Ищем по всем возможным ключам свойств (из-за проблем с кодировкой)
              let foundMatch = false;
              let matchedValue = null;
              
              // Список возможных ключей для поиска артикула
              const possibleKeys = [
                mappingProperty, // Оригинальный ключ
                'Артикул поставщика',
                'Артикул',
                'SKU',
                'sku',
                'Артикул_поставщика',
                'Артикул поставщика',
                'Supplier SKU',
                'Supplier_sku'
              ];
              
              // Также ищем по всем ключам, которые содержат "артикул" или "sku"
              const allKeys = Object.keys(properties);
              allKeys.forEach(key => {
                if (key.toLowerCase().includes('артикул') || 
                    key.toLowerCase().includes('sku') ||
                    key.toLowerCase().includes('supplier')) {
                  possibleKeys.push(key);
                }
              });
              
              // Убираем дубликаты
              const uniqueKeys = [...new Set(possibleKeys)];
              
              for (const key of uniqueKeys) {
                const propertyValue = properties[key];
                if (propertyValue) {
                  const valueStr = propertyValue.toString().trim();
                  const fileNameStr = fileNameWithoutExt.trim();
                  
                  console.log(`Проверка товара ${product.sku} по ключу "${key}":`, {
                    propertyValue: valueStr,
                    fileNameWithoutExt: fileNameStr,
                    exactMatch: valueStr === fileNameStr,
                    partialMatch: valueStr.includes(fileNameStr) || fileNameStr.includes(valueStr)
                  });
                  
                  // Проверяем точное совпадение
                  const exactMatch = valueStr === fileNameStr;
                  
                  // Проверяем частичное совпадение
                  const partialMatch = valueStr.includes(fileNameStr) || fileNameStr.includes(valueStr);
                  
                  if (exactMatch || partialMatch) {
                    foundMatch = true;
                    matchedValue = valueStr;
                    console.log(`✅ НАЙДЕНО СОВПАДЕНИЕ для товара ${product.sku}: ключ="${key}", значение="${valueStr}"`);
                    break;
                  }
                }
              }
              
              if (!foundMatch) {
                console.log(`❌ Совпадений не найдено для товара ${product.sku}`);
                console.log(`Доступные свойства:`, Object.keys(properties));
                console.log(`Доступные значения:`, Object.values(properties));
              }
              
              return foundMatch;
            } catch (error) {
              console.error('Ошибка парсинга свойств товара:', error);
              return false;
            }
          });
          
          console.log(`Найдено ${matchingProducts.length} товаров для фото ${photo.originalName}`);
            
          // Инициализируем счетчики для этого фото
          photo.productsLinked = 0;
          photo.matchedProducts = [];
          
          // Привязываем фото ко всем найденным товарам
          for (const product of matchingProducts) {
            try {
              const currentProperties = JSON.parse(product.properties_data || '{}');
              currentProperties.photos = currentProperties.photos || [];
              
              // Проверяем, не привязано ли уже это фото к товару
              if (!currentProperties.photos.includes(photo.filePath)) {
                currentProperties.photos.push(photo.filePath);
                
                await prisma.product.update({
                  where: { id: product.id },
                  data: {
                    properties_data: JSON.stringify(currentProperties)
                  }
                });
                
                linkedPhotos++;
                photo.productsLinked++;
                photo.matchedProducts.push({
                  id: product.id,
                  sku: product.sku,
                  name: product.name
                });
                
                console.log(`Фото ${photo.originalName} привязано к товару ${product.sku}`);
              } else {
                console.log(`Фото ${photo.originalName} уже привязано к товару ${product.sku}`);
                photo.matchedProducts.push({
                  id: product.id,
                  sku: product.sku,
                  name: product.name,
                  alreadyLinked: true
                });
              }
            } catch (error) {
              console.error(`Ошибка при привязке фото ${photo.originalName} к товару ${product.sku}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка при привязке фото к товарам:', error);
      }
    }
    
    // Создаем детальный отчет
    const details = uploadedPhotos.map(photo => ({
      fileName: photo.originalName,
      message: photo.productsLinked > 0 
        ? `Привязано к ${photo.productsLinked} товарам`
        : 'Товары не найдены для привязки',
      productsLinked: photo.productsLinked,
      matchedProducts: photo.matchedProducts || []
    }));

    const result = {
      success: uploadErrors.length === 0,
      message: uploadErrors.length === 0 
        ? `Успешно загружено ${uploadedPhotos.length} фотографий${linkedPhotos > 0 ? `, привязано к товарам: ${linkedPhotos} привязок` : ''}`
        : `Загружено ${uploadedPhotos.length} фотографий, ${uploadErrors.length} ошибок${linkedPhotos > 0 ? `, привязано к товарам: ${linkedPhotos} привязок` : ''}`,
      uploaded: uploadedPhotos.length,
      linked: linkedPhotos,
      errors: uploadErrors.length,
      details: details,
      photos: uploadedPhotos,
      category: category,
      upload_dir: uploadDir,
      mapping_property: mappingProperty
    };

    console.log('=== РЕЗУЛЬТАТ ЗАГРУЗКИ ===');
    console.log(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Ошибка при загрузке фотографий:', error);
    return NextResponse.json(
      { success: false, message: 'Ошибка сервера при загрузке фотографий' },
      { status: 500 }
    );
  }
}