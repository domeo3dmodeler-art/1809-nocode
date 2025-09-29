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

    // Получаем информацию о категории из каталога
    const categoriesResponse = await fetch(`${req.nextUrl.origin}/api/catalog/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('Получены категории каталога:', categoriesData);
    
    // Ищем категорию в списке
    let categoryInfo = null;
    if (Array.isArray(categoriesData)) {
      categoryInfo = categoriesData.find((cat: any) => cat.id === category);
    } else if (categoriesData.categories && Array.isArray(categoriesData.categories)) {
      categoryInfo = categoriesData.categories.find((cat: any) => cat.id === category);
    }
    
    console.log('Найденная категория:', categoryInfo);
    console.log('CategoryInfo import_mapping:', categoryInfo?.import_mapping);

    if (!categoryInfo) {
      console.warn(`Категория "${category}" не найдена в каталоге, создаем базовую информацию`);
      // Создаем базовую информацию о категории
      categoryInfo = {
        id: category,
        name: `Категория ${category}`,
        properties: [],
        import_mapping: {}
      };
    }

    // Получаем шаблон импорта для этой категории
    let importTemplate = null;
    try {
      const templateResponse = await fetch(`${req.nextUrl.origin}/api/admin/import-templates?catalog_category_id=${category}`);
      if (templateResponse.ok) {
        const templateData = await templateResponse.json();
        if (templateData.success && templateData.templates && templateData.templates.length > 0) {
          importTemplate = templateData.templates[0];
          console.log('Found import template:', importTemplate);
        }
      }
    } catch (templateError) {
      console.log('No import template found or error:', templateError);
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

    // Если есть шаблон импорта, используем его данные для маппинга
    if (importTemplate && importTemplate.requiredFields) {
      console.log('Using import template for mapping');
      
      // Парсим templateFields если это строка
      let templateFields = importTemplate.requiredFields;
      if (typeof templateFields === 'string') {
        try {
          templateFields = JSON.parse(templateFields);
        } catch (e) {
          console.error('Error parsing requiredFields:', e);
          templateFields = [];
        }
      }
      
      // Проверяем, что templateFields является массивом
      if (!Array.isArray(templateFields) || templateFields.length === 0) {
        console.log('Template fields is not an array or empty, skipping template mapping');
      } else {
        const calculatorFields = templateFields.map((field: any) => field.fieldName || field);
        
        mappingConfig = {
          calculator_fields: calculatorFields,
          frontend_price: calculatorFields[0] // Используем первое поле как цену
        };
        
        // Также обновляем categoryInfo.properties для совместимости
        categoryInfo.properties = templateFields.map((field: any) => ({
          key: field.fieldName || field,
          name: field.displayName || field.fieldName || field,
          required: true
        }));
        
        console.log('Generated mapping config from template:', mappingConfig);
        console.log('Updated category properties:', categoryInfo.properties);
      }
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
    const rawHeaders = jsonData[0] as string[];
    // Очищаем заголовки от кавычек и лишних пробелов
    const headers = rawHeaders.map(header => 
      header ? header.toString().replace(/^["']|["']$/g, '').trim() : ''
    ).filter(header => header); // Убираем пустые заголовки
    
    const rows = jsonData.slice(1) as any[][];
    
    console.log('=== HEADERS PROCESSING ===');
    console.log('Raw headers:', rawHeaders);
    console.log('Cleaned headers:', headers);
    console.log('Headers count:', headers.length);

    // Валидация обязательных полей
    const requiredFields = categoryInfo.properties.filter((prop: any) => prop.required).map((prop: any) => prop.key);
    const errors: string[] = [];
    const products: any[] = [];
    
    console.log('=== IMPORT PROCESSING DEBUG ===');
    console.log('Headers:', headers);
    console.log('CategoryInfo properties:', categoryInfo.properties);
    console.log('Required fields:', requiredFields);
    console.log('Mapping config:', mappingConfig);
    console.log('Import template:', importTemplate);
    console.log('CategoryInfo import_mapping:', categoryInfo.import_mapping);
    
    // Fallback: если нет mappingConfig, создаем простой mapping на основе заголовков
    if (!mappingConfig || (typeof mappingConfig === 'object' && Object.keys(mappingConfig).length === 0)) {
      console.log('No mapping config found, creating fallback mapping from headers');
      mappingConfig = {};
      headers.forEach(header => {
        mappingConfig[header] = header; // Прямое соответствие заголовок -> поле
      });
      console.log('Fallback mapping config:', mappingConfig);
    }
    
    console.log('=== END IMPORT PROCESSING DEBUG ===');

    console.log('=== STARTING ROW PROCESSING ===');
    console.log('Total rows to process:', rows.length);
    console.log('First few rows:', rows.slice(0, 3));

    // Обрабатываем каждую строку
    rows.forEach((row, index) => {
      console.log(`\n=== PROCESSING ROW ${index + 1} ===`);
      console.log('Row data:', row);
      console.log('Headers:', headers);
      console.log('Row length:', row.length);
      console.log('Headers length:', headers.length);
      
      if (row.length === 0 || row.every(cell => !cell)) {
        console.log(`Skipping empty row ${index + 2}`);
        return; // Пропускаем пустые строки
      }

      console.log(`=== PROCESSING ROW ${index + 2} ===`);
      console.log('Row data:', row);
      console.log('Row length:', row.length);

      const product: any = {};
      let hasErrors = false;

      // Создаем объект specifications для хранения всех свойств
      const specifications: any = {};

      // Маппим поля согласно настройкам категории
      console.log('Mapping config:', mappingConfig);
      console.log('Has calculator_fields:', !!mappingConfig.calculator_fields);
      console.log('Calculator fields:', mappingConfig.calculator_fields);
      
      // Упрощенный маппинг - добавляем все данные из строки в specifications
      console.log('Using direct mapping - adding all row data to specifications');
      headers.forEach((header, headerIndex) => {
        if (row[headerIndex] !== undefined && row[headerIndex] !== null && row[headerIndex] !== '') {
          specifications[header] = row[headerIndex];
          console.log(`Added to specifications: ${header} = ${row[headerIndex]}`);
        }
      });
      
      // Ищем поле с ценой для product.price
      const priceFields = ['Цена ррц', 'Цена', 'Price', 'цена', 'price'];
      for (const priceField of priceFields) {
        const priceIndex = headers.findIndex(h => h.includes(priceField));
        if (priceIndex !== -1 && row[priceIndex] !== undefined && row[priceIndex] !== null && row[priceIndex] !== '') {
            product.price = row[priceIndex];
          console.log(`Added price from field "${headers[priceIndex]}": ${row[priceIndex]}`);
          break;
        }
      }
      
      console.log('Specifications after mapping:', specifications);
      
      // Дополнительная проверка: если specifications пустой, добавляем все данные из строки
      if (Object.keys(specifications).length === 0) {
        console.log('Specifications is empty, adding all row data directly');
        headers.forEach((header, index) => {
          if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
            specifications[header] = row[index];
            console.log(`Fallback: Added ${header} = ${row[index]}`);
          }
        });
        console.log('Specifications after fallback:', specifications);
      }
      
      // Сохраняем все данные в specifications
      product.specifications = specifications;
      
      // Отладочная информация для первого товара
      if (index === 0) {
        console.log('=== FIRST PRODUCT DEBUG ===');
        console.log('Row data:', row);
        console.log('Headers:', headers);
        console.log('Mapping config:', mappingConfig);
        console.log('Specifications:', specifications);
        console.log('Product before saving:', product);
        console.log('=== END FIRST PRODUCT DEBUG ===');
      }

      // Проверяем обязательные поля - только если они заданы
      console.log('=== VALIDATION ===');
      console.log('Required fields:', requiredFields);
      console.log('Calculator fields:', mappingConfig.calculator_fields);
      console.log('Specifications keys:', Object.keys(specifications));
      
      // Валидация на основе шаблона - более мягкая
      if (importTemplate && importTemplate.requiredFields) {
        console.log('Validating against template required fields');
        
        // Парсим requiredFields если это строка
        let templateRequiredFields = importTemplate.requiredFields;
        if (typeof templateRequiredFields === 'string') {
          try {
            templateRequiredFields = JSON.parse(templateRequiredFields);
          } catch (e) {
            console.error('Error parsing requiredFields for validation:', e);
            templateRequiredFields = [];
          }
        }
        
        // Проверяем, что это массив
        if (Array.isArray(templateRequiredFields) && templateRequiredFields.length > 0) {
          let missingRequiredFields = [];
          
          templateRequiredFields.forEach((field: any) => {
            const fieldName = field.fieldName || field;
            if (!specifications[fieldName] || specifications[fieldName] === '') {
              missingRequiredFields.push(fieldName);
            }
          });
        
          if (missingRequiredFields.length > 0) {
            console.log(`Validation warning: Missing required fields: ${missingRequiredFields.join(', ')}`);
            console.log('But continuing anyway - soft validation mode');
            // Не добавляем ошибку, просто предупреждение
            // errors.push(`Строка ${index + 2}: Отсутствуют обязательные поля: ${missingRequiredFields.join(', ')}`);
            // hasErrors = true;
          } else {
            console.log('Product passed validation - all required fields present');
          }
        }
      }
      
      // Основная валидация - проверяем только что есть данные
      if (Object.keys(specifications).length === 0) {
        console.log('Validation error: No data in specifications');
        errors.push(`Строка ${index + 2}: Товар не содержит данных`);
        hasErrors = true;
      } else {
        console.log('Product passed validation - has specifications data');
        console.log('Specifications keys count:', Object.keys(specifications).length);
      }
      
      console.log('Has errors:', hasErrors);
      console.log('=== END VALIDATION ===');

      if (!hasErrors) {
        products.push({
          ...product,
          row_number: index + 2,
          category: category
        });
        
        // Отладочная информация для первых нескольких товаров
        if (index < 5) {
          console.log(`=== PRODUCT ${index + 1} ADDED ===`);
          console.log('Product:', product);
          console.log('Specifications:', specifications);
          console.log('Has errors:', hasErrors);
        }
      } else {
        // Отладочная информация для товаров с ошибками
        if (index < 5) {
          console.log(`=== PRODUCT ${index + 1} REJECTED ===`);
          console.log('Product:', product);
          console.log('Specifications:', specifications);
          console.log('Has errors:', hasErrors);
          console.log('Errors for this product:', errors.slice(-1)); // Последняя ошибка
        }
      }
    });

    console.log('\n=== ROW PROCESSING COMPLETED ===');
    console.log('Total products processed:', products.length);
    console.log('Total errors found:', errors.length);
    console.log('Products array:', products.slice(0, 3)); // Первые 3 товара для отладки

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
    console.log('Products array length:', products.length);
    console.log('Errors array length:', errors.length);
    
    // Сохраняем товары напрямую в базу данных
    try {
      console.log('Saving products directly to database...');
      console.log('Total products to save:', products.length);
      console.log('First product sample:', products[0]);
      
      // Импортируем PrismaClient напрямую
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const savedProducts = [];
      
      if (products.length === 0) {
        console.log('WARNING: No products to save - products array is empty');
        console.log('This might be due to validation errors or empty data');
        result.save_message = 'Предупреждение: Нет товаров для сохранения - возможно, все товары были отклонены при валидации';
      }
      
      for (const product of products) {
        try {
          // Создаем товар в базе данных
          const savedProduct = await prisma.product.create({
            data: {
              catalog_category_id: category,
              sku: product.sku || `SKU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: product.name || 'Без названия',
              base_price: parseFloat(product.price || product.base_price || 0),
              stock_quantity: parseInt(product.stock || product.stock_quantity || 0),
              brand: product.brand || '',
              model: product.model || '',
              description: product.description || '',
              specifications: JSON.stringify(product.specifications || {}),
              properties_data: JSON.stringify(product.specifications || {}), // Добавляем properties_data
              is_active: true
            }
          });
          
          savedProducts.push(savedProduct);
          console.log('Product saved:', savedProduct.id, savedProduct.name);
          
        } catch (productError) {
          console.error('Error saving product:', {
            product: product,
            error: productError,
            errorMessage: productError instanceof Error ? productError.message : 'Unknown error',
            errorCode: (productError as any)?.code
          });
          // Продолжаем с остальными товарами
        }
      }
      
      await prisma.$disconnect();
      
      console.log('Products saved directly to database:', savedProducts.length);
      result.imported = savedProducts.length;
      result.database_saved = savedProducts.length;
      result.save_message = `Успешно сохранено ${savedProducts.length} товаров в базу данных`;
      
    } catch (saveError) {
      console.error('Error saving products directly:', saveError);
      result.save_message = 'Ошибка при сохранении в базу данных: ' + (saveError instanceof Error ? saveError.message : 'Неизвестная ошибка');
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
    
    // Обновляем счетчики товаров в категориях
    try {
      await fetch(`${req.nextUrl.origin}/api/admin/categories/update-counts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Product counts updated successfully');
    } catch (countsError) {
      console.error('Error updating product counts:', countsError);
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
