import { NextRequest, NextResponse } from "next/server";
import * as XLSX from 'xlsx';

// Универсальный импорт прайсов для любой категории товаров
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const mapping = formData.get("mapping") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Файл не предоставлен" },
        { status: 400 }
      );
    }

    if (!category) {
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
      Object.entries(mappingConfig).forEach(([fieldKey, headerName]) => {
        const headerIndex = headers.findIndex(h => h === headerName);
        if (headerIndex !== -1 && row[headerIndex] !== undefined) {
          product[fieldKey] = row[headerIndex];
        }
      });

      // Проверяем обязательные поля
      requiredFields.forEach(field => {
        if (!product[field] || product[field] === '') {
          errors.push(`Строка ${index + 2}: Отсутствует обязательное поле "${field}"`);
          hasErrors = true;
        }
      });

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

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Ошибка обработки файла:', error);
    return NextResponse.json(
      { error: "Ошибка обработки файла: " + (error as Error).message },
      { status: 500 }
    );
  }
}
