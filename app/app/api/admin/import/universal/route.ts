import { NextRequest, NextResponse } from "next/server";
import * as XLSX from 'xlsx';

// Функция для создания динамической схемы категории на основе заголовков прайса
async function createDynamicSchema(categoryId: string, headers: string[]) {
  console.log('Creating dynamic schema for category:', categoryId, 'with headers:', headers);
  
  // Создаем свойства на основе заголовков
  const properties = headers.map((header, index) => {
    // Определяем тип поля по названию
    let type = 'text';
    let required = false;
    let unit = '';
    
    // Логика определения типа поля
    if (header.toLowerCase().includes('цена') || header.toLowerCase().includes('стоимость')) {
      type = 'number';
      unit = '₽';
      required = true;
    } else if (header.toLowerCase().includes('ширина') || header.toLowerCase().includes('высота') || 
               header.toLowerCase().includes('толщина') || header.toLowerCase().includes('/мм')) {
      type = 'number';
      unit = 'мм';
    } else if (header.toLowerCase().includes('фото') || header.toLowerCase().includes('ссылка')) {
      type = 'url';
    } else if (header.toLowerCase().includes('название') || header.toLowerCase().includes('модель') || 
               header.toLowerCase().includes('артикул') || header.toLowerCase().includes('поставщик')) {
      required = true;
    }
    
    return {
      key: `field_${index + 1}`,
      name: header,
      type: type,
      required: required,
      unit: unit
    };
  });
  
  // Создаем import_mapping
  const import_mapping = {};
  headers.forEach((header, index) => {
    import_mapping[`field_${index + 1}`] = header;
  });
  
  const schema = {
    properties: properties,
    import_mapping: import_mapping
  };
  
  console.log('Created dynamic schema:', schema);
  
  // Обновляем категорию в базе данных (пока что просто возвращаем схему)
  // В реальной системе здесь будет вызов API для обновления категории
  
  return schema;
}

// Универсальный импорт прайсов для любой категории товаров
export async function POST(req: NextRequest) {
  console.log('=== API CALL START ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    const formData = await req.formData();
    console.log('FormData received, keys:', Array.from(formData.keys()));
    
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const mapping = formData.get("mapping") as string;
    const mode = formData.get("mode") as string; // 'headers' или 'full'

    console.log('Parsed parameters:', { 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type,
      category, 
      mode,
      mapping
    });

    // Дополнительная проверка типа файла по расширению
    const fileName = file.name.toLowerCase();
    const isExcelFile = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isCsvFile = fileName.endsWith('.csv');
    
    console.log('File extension check:', {
      fileName: file.name,
      isExcelFile,
      isCsvFile,
      mimeType: file.type
    });

    if (!file) {
      console.log('ERROR: No file provided');
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      );
    }

    if (!category) {
      console.log('ERROR: No category provided');
      console.log('Available form data keys:', Array.from(formData.keys()));
      return NextResponse.json(
        { error: "Категория не указана" },
        { status: 400 }
      );
    }

    // Простая валидация файла
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "text/csv", // .csv
      "application/vnd.ms-excel" // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Неподдерживаемый тип файла. Разрешены: .xlsx, .csv, .xls" },
        { status: 400 }
      );
    }

    // Получаем информацию о категории
    const categoriesResponse = await fetch(`${req.nextUrl.origin}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    const categoryInfo = categoriesData.categories.find((cat: any) => cat.id === category);

    if (!categoryInfo) {
      return NextResponse.json(
        { error: `Категория "${category}" не найдена` },
        { status: 404 }
      );
    }

    // Если режим "только заголовки", возвращаем только заголовки
    if (mode === 'headers') {
      console.log('Headers mode - processing file:', file.name, file.type, file.size);
      try {
        const buffer = await file.arrayBuffer();
        let workbook;
        
        if (file.type === 'text/csv' || isCsvFile) {
          console.log('Processing CSV file');
          // Для CSV файлов читаем как текст с правильной кодировкой
          const text = await file.text();
          console.log('CSV text length:', text.length);
          console.log('CSV first 200 chars:', text.substring(0, 200));
          
          const lines = text.split('\n').filter(line => line.trim());
          console.log('CSV lines count:', lines.length);
          
          if (lines.length === 0) {
            console.log('CSV file is empty');
            return NextResponse.json({ error: "CSV файл пустой" }, { status: 400 });
          }
          
          // Пробуем разные разделители
          let headers;
          const firstLine = lines[0];
          console.log('CSV first line:', firstLine);
          
          if (firstLine.includes(',')) {
            headers = firstLine.split(',').map(h => h.trim().replace(/"/g, ''));
          } else if (firstLine.includes(';')) {
            headers = firstLine.split(';').map(h => h.trim().replace(/"/g, ''));
          } else if (firstLine.includes('\t')) {
            headers = firstLine.split('\t').map(h => h.trim().replace(/"/g, ''));
          } else {
            headers = [firstLine.trim()];
          }
          
          console.log('CSV headers extracted:', headers);
          
          // Создаем схему категории на основе заголовков
          const dynamicSchema = await createDynamicSchema(category, headers);
          
          return NextResponse.json({ 
            ok: true, 
            headers,
            schema: dynamicSchema,
            message: "Заголовки CSV файла успешно прочитаны"
          });
        } else {
          console.log('Processing Excel file');
          console.log('File details:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          });
          
          // Для Excel файлов - пробуем разные варианты чтения
          try {
            // Вариант 1: Чтение как array buffer
            workbook = XLSX.read(buffer, { type: 'array' });
            console.log('Excel workbook created successfully');
            console.log('Workbook details:', {
              sheetNames: workbook.SheetNames,
              sheetCount: workbook.SheetNames.length
            });
            
            // Пробуем все листы, если первый не содержит данных
            let headers: string[] = [];
            let usedSheet = '';
            
            for (const sheetName of workbook.SheetNames) {
              console.log(`Trying sheet: ${sheetName}`);
              const worksheet = workbook.Sheets[sheetName];
              console.log('Worksheet details:', {
                range: worksheet['!ref'],
                hasData: !!worksheet['!ref']
              });
              
              if (!worksheet['!ref']) {
                console.log(`Sheet ${sheetName} has no data range, skipping`);
                continue;
              }
              
              // Пробуем разные варианты чтения
              let jsonData;
              try {
                // Сначала пробуем с raw: true для сохранения оригинальных значений
                console.log('Trying sheet_to_json with raw: true...');
                jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });
                console.log('Sheet to JSON (raw: true) result:', {
                  length: jsonData.length,
                  firstRow: jsonData[0],
                  firstFewRows: jsonData.slice(0, 3)
                });
                
                if (jsonData.length === 0) {
                  // Если не получилось, пробуем без raw
                  console.log('No data with raw: true, trying without raw...');
                  jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                  console.log('Sheet to JSON (no raw) result:', {
                    length: jsonData.length,
                    firstRow: jsonData[0],
                    firstFewRows: jsonData.slice(0, 3)
                  });
                }
              } catch (e) {
                console.log('Sheet to JSON failed, trying alternative method:', e);
                jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                console.log('Alternative method result:', {
                  length: jsonData.length,
                  firstRow: jsonData[0]
                });
              }
              
              if (jsonData.length === 0) {
                console.log(`Sheet ${sheetName} appears to be empty, trying next sheet`);
                continue;
              }
              
              // Читаем заголовки из первой строки
              let headerRowIndex = 0; // Всегда первая строка
              
              console.log(`Using first row (index 0) as headers from sheet ${sheetName}`);
              const headerRow = jsonData[0] as any[];
              console.log('Raw headers from first row:', headerRow);
              
              // Фильтруем пустые заголовки и заголовки типа _EMPTY_X
              const filteredHeaders = headerRow.filter(h => {
                if (h === null || h === undefined) {
                  console.log('Filtering out null/undefined header:', h);
                  return false;
                }
                if (typeof h === 'string') {
                  const trimmed = h.trim();
                  if (trimmed === '') {
                    console.log('Filtering out empty string header');
                    return false;
                  }
                  if (trimmed.startsWith('_EMPTY_')) {
                    console.log('Filtering out _EMPTY_ header:', trimmed);
                    return false;
                  }
                  if (trimmed.startsWith('__EMPTY')) {
                    console.log('Filtering out __EMPTY header:', trimmed);
                    return false;
                  }
                  console.log('Keeping valid string header:', trimmed);
                  return true;
                }
                // Для не-строковых значений тоже включаем
                console.log('Keeping non-string header:', h, typeof h);
                return true;
              }).map(h => String(h).trim());
              
              console.log('Final filtered headers:', filteredHeaders);
              console.log('Headers count:', filteredHeaders.length);
              console.log('All headers:', filteredHeaders.map((h, i) => `${i+1}. ${h}`).join(', '));
              
              if (filteredHeaders.length > 0) {
                headers = filteredHeaders;
                usedSheet = sheetName;
                break; // Нашли валидные заголовки, выходим из цикла
              }
            }
            
            if (headers.length === 0) {
              console.log('No valid headers found in any sheet, trying raw data approach');
              // Пробуем получить данные напрямую из первого листа
              const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
              const rawData = XLSX.utils.sheet_to_json(firstSheet, { raw: true });
              console.log('Raw data sample:', rawData.slice(0, 2));
              
              if (rawData.length > 0) {
                const firstRow = rawData[0];
                const rawHeaders = Object.keys(firstRow);
                console.log('Raw headers from object keys:', rawHeaders);
                
                // Фильтруем пустые заголовки и заголовки типа _EMPTY_X
                const filteredRawHeaders = rawHeaders.filter(h => {
                  if (!h || typeof h !== 'string') return false;
                  const trimmed = h.trim();
                  if (trimmed === '') return false;
                  if (trimmed.startsWith('_EMPTY_')) return false;
                  if (trimmed.startsWith('__EMPTY')) return false;
                  return true;
                });
                
                console.log('Filtered raw headers:', filteredRawHeaders);
                
                if (filteredRawHeaders.length > 0) {
                  return NextResponse.json({ 
                    ok: true, 
                    headers: filteredRawHeaders,
                    message: "Заголовки файла прочитаны из raw данных"
                  });
                }
              }
              
              // Если все методы не сработали, возвращаем ошибку с деталями
              return NextResponse.json({ 
                error: "Не удалось извлечь заголовки из Excel файла. Возможно, файл имеет нестандартный формат.",
                debug: {
                  sheetNames: workbook.SheetNames,
                  worksheetRange: workbook.SheetNames.map(name => ({
                    sheet: name,
                    range: workbook.Sheets[name]['!ref']
                  })),
                  firstSheetData: workbook.SheetNames.length > 0 ? 
                    XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 }).slice(0, 3) : [],
                  rawHeaders: rawData.length > 0 ? Object.keys(rawData[0]) : []
                }
              }, { status: 400 });
            }
            
            // Создаем схему категории на основе заголовков
            const dynamicSchema = await createDynamicSchema(category, headers);
            
            return NextResponse.json({ 
              ok: true, 
              headers: headers,
              schema: dynamicSchema,
              message: `Заголовки файла успешно прочитаны из листа "${usedSheet}"`
            });
          } catch (excelError) {
            console.error('Excel parsing error:', excelError);
            console.error('Error details:', {
              message: excelError.message,
              stack: excelError.stack
            });
            
            // Пробуем альтернативный способ
            try {
              console.log('Trying alternative Excel parsing...');
              workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
              
              console.log('Alternative parsing result:', {
                length: jsonData.length,
                firstRow: jsonData[0]
              });
              
              if (jsonData.length > 0) {
                const headers = jsonData[0] as any[];
                
                // Фильтруем пустые заголовки и заголовки типа _EMPTY_X
                const filteredHeaders = headers.filter(h => {
                  if (h === null || h === undefined) return false;
                  if (typeof h === 'string') {
                    const trimmed = h.trim();
                    if (trimmed === '') return false;
                    if (trimmed.startsWith('_EMPTY_')) return false;
                    if (trimmed.startsWith('__EMPTY')) return false;
                    return true;
                  }
                  return true;
                }).map(h => String(h).trim());
                
                console.log('Alternative Excel headers:', filteredHeaders);
                console.log('Alternative original headers:', headers);
                
                if (filteredHeaders.length > 0) {
                  // Создаем схему категории на основе заголовков
                  const dynamicSchema = await createDynamicSchema(category, filteredHeaders);
                  
                  return NextResponse.json({ 
                    ok: true, 
                    headers: filteredHeaders,
                    schema: dynamicSchema,
                    message: "Заголовки файла прочитаны альтернативным способом"
                  });
                }
              }
            } catch (altError) {
              console.error('Alternative Excel parsing also failed:', altError);
            }
            
            return NextResponse.json({ 
              error: "Не удалось прочитать Excel файл. Проверьте формат файла.",
              debug: {
                originalError: excelError.message,
                fileSize: file.size,
                fileName: file.name
              }
            }, { status: 400 });
          }
        }
      } catch (error) {
        console.error('Ошибка чтения заголовков:', error);
        return NextResponse.json(
          { error: "Ошибка чтения файла. Проверьте формат файла." },
          { status: 400 }
        );
      }
    }

    // Парсим mapping если предоставлен
    let mappingConfig = categoryInfo.import_mapping; // Используем дефолтный mapping
    if (mapping) {
      try {
        mappingConfig = JSON.parse(mapping);
      } catch (e) {
        return NextResponse.json(
          { error: "Неверный формат mapping JSON" },
          { status: 400 }
        );
      }
    }

    // Если настройки импорта уже существуют, используем их
    if (categoryInfo.import_mapping && Object.keys(categoryInfo.import_mapping).length > 0) {
      console.log('Using existing import mapping:', categoryInfo.import_mapping);
      mappingConfig = categoryInfo.import_mapping;
    }

    // Реальная обработка файла с библиотекой xlsx
    const buffer = await file.arrayBuffer();
    let workbook;
    
    if (file.type === 'text/csv') {
      // Для CSV файлов читаем как текст с правильной кодировкой
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const csvData = lines.map(line => line.split(','));
      workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(csvData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    } else {
      // Для Excel файлов используем стандартный парсер
      workbook = XLSX.read(buffer, { type: 'array' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: "Файл пустой или не содержит данных" },
        { status: 400 }
      );
    }

    // Первая строка - заголовки
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as any[][];

    // Валидация обязательных полей
    const requiredFields = categoryInfo.properties.filter((prop: any) => prop.required).map((prop: any) => prop.key);
    const errors: string[] = [];
    const products: any[] = [];

    // Обрабатываем каждую строку
    rows.forEach((row, index) => {
      if (row.length === 0 || row.every(cell => !cell)) return; // Пропускаем пустые строки

      const product: any = {};
      let hasErrors = false;

      // Маппим поля согласно настройкам категории
      if (mappingConfig.calculator_fields) {
        // Новая структура с разделением на типы полей
        mappingConfig.calculator_fields.forEach((headerName: string) => {
          const headerIndex = headers.findIndex(h => h === headerName);
          if (headerIndex !== -1 && row[headerIndex] !== undefined) {
            product[headerName] = row[headerIndex];
          }
        });
        
        // Добавляем цену для корзины
        if (mappingConfig.frontend_price) {
          const priceIndex = headers.findIndex(h => h === mappingConfig.frontend_price);
          if (priceIndex !== -1 && row[priceIndex] !== undefined) {
            product.price = row[priceIndex];
          }
        }
      } else {
        // Старая структура - обратная совместимость
        Object.entries(mappingConfig).forEach(([fieldKey, headerName]) => {
          const headerIndex = headers.findIndex(h => h === headerName);
          if (headerIndex !== -1 && row[headerIndex] !== undefined) {
            product[fieldKey] = row[headerIndex];
          }
        });
      }

      // Проверяем обязательные поля
      if (mappingConfig.calculator_fields) {
        // Для новой структуры проверяем поля калькулятора
        mappingConfig.calculator_fields.forEach((field: string) => {
          if (!product[field] || product[field] === '') {
            errors.push(`Строка ${index + 2}: Отсутствует обязательное поле "${field}"`);
            hasErrors = true;
          }
        });
        
        // Проверяем цену
        if (mappingConfig.frontend_price && (!product.price || product.price === '')) {
          errors.push(`Строка ${index + 2}: Отсутствует цена "${mappingConfig.frontend_price}"`);
          hasErrors = true;
        }
      } else {
        // Для старой структуры
        requiredFields.forEach(field => {
          if (!product[field] || product[field] === '') {
            errors.push(`Строка ${index + 2}: Отсутствует обязательное поле "${field}"`);
            hasErrors = true;
          }
        });
      }

      if (!hasErrors) {
        products.push({
          ...product,
          row_number: index + 2,
          category: category
        });
      }
    });

    const result = {
      message: "Файл успешно обработан",
      category: categoryInfo,
      filename: file.name,
      size: file.size,
      type: file.type,
      mapping: mappingConfig,
      imported: products.length,
      errors: errors,
      products: products.slice(0, 10), // Показываем первые 10 товаров для предпросмотра
      photo_mapping: {}, // Будет заполнено после загрузки фото
      file_content_preview: headers.join(', '), // Показываем заголовки
      processing_status: errors.length > 0 ? "partial" : "success",
      note: `Обработано ${rows.length} строк, успешно импортировано ${products.length} товаров`,
      category_properties: categoryInfo.properties,
      required_fields: requiredFields,
      headers: headers,
      total_rows: rows.length,
      valid_rows: products.length,
      error_rows: errors.length,
      debug: {
        first_row: rows[0],
        mapping_config: mappingConfig,
        sample_product: products[0] || null
      }
    };

    console.log('=== API CALL SUCCESS ===');
    
    // Сохраняем товары в API
    try {
      const saveResponse = await fetch(`${req.nextUrl.origin}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          products: products,
          category: category
        })
      });
      
      if (saveResponse.ok) {
        const saveData = await saveResponse.json();
        console.log('Products saved:', saveData);
      }
    } catch (saveError) {
      console.error('Error saving products:', saveError);
    }
    
    // Обновляем статистику
    try {
      await fetch(`${req.nextUrl.origin}/api/admin/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imported: products.length, 
          filename: file.name,
          category: category
        })
      });
    } catch (statsError) {
      console.error('Error updating stats:', statsError);
    }
    
    // Добавляем в историю импортов
    try {
      await fetch(`${req.nextUrl.origin}/api/admin/import-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category: category,
          filename: file.name,
          products_count: products.length,
          status: 'completed'
        })
      });
    } catch (historyError) {
      console.error('Error updating import history:', historyError);
    }
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('=== API CALL ERROR ===');
    console.error('Ошибка обработки файла:', error);
    console.error('Error stack:', (error as Error).stack);
    return NextResponse.json(
      { error: "Ошибка обработки файла: " + (error as Error).message },
      { status: 500 }
    );
  }
}
