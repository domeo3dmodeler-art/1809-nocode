import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// ===================== Экспорт шаблона в Excel =====================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');
    const categoryId = searchParams.get('categoryId');

    if (!templateId && !categoryId) {
      return NextResponse.json(
        { error: 'Необходимо указать templateId или categoryId' },
        { status: 400 }
      );
    }

    let template;

    if (templateId) {
      // Получаем шаблон по ID
      template = await prisma.importTemplate.findUnique({
        where: { id: templateId },
        include: {
          catalog_category: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        }
      });
    } else if (categoryId) {
      // Получаем шаблон по категории
      template = await prisma.importTemplate.findFirst({
        where: { 
          catalog_category_id: categoryId,
          is_active: true 
        },
        include: {
          catalog_category: {
            select: {
              id: true,
              name: true,
              path: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Шаблон не найден' },
        { status: 404 }
      );
    }

    // Парсим поля шаблона
    let requiredFields = [];
    let calculatorFields = [];
    let exportFields = [];

    try {
      requiredFields = template.required_fields ? JSON.parse(template.required_fields) : [];
      calculatorFields = template.calculator_fields ? JSON.parse(template.calculator_fields) : [];
      exportFields = template.export_fields ? JSON.parse(template.export_fields) : [];
    } catch (error) {
      console.error('Error parsing template fields:', error);
      return NextResponse.json(
        { error: 'Ошибка при чтении полей шаблона' },
        { status: 500 }
      );
    }

    // Объединяем все поля для экспорта
    const allFields = [...requiredFields, ...calculatorFields, ...exportFields];
    
    if (allFields.length === 0) {
      return NextResponse.json(
        { error: 'Шаблон не содержит полей для экспорта' },
        { status: 400 }
      );
    }

    // Создаем заголовки для Excel
    const headers = allFields.map(field => {
      if (typeof field === 'string') {
        return field;
      }
      return field.displayName || field.fieldName || field;
    });

    // Создаем данные для Excel (заголовки + 5 пустых строк для заполнения)
    const worksheetData = [
      headers, // Заголовки
      ...Array(5).fill(null).map(() => headers.map(() => '')) // 5 пустых строк
    ];

    // Создаем рабочую книгу Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Настраиваем ширину колонок
    const columnWidths = headers.map(header => ({ 
      wch: Math.max(15, Math.min(30, String(header).length + 5)) 
    }));
    worksheet['!cols'] = columnWidths;

    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Шаблон');

    // Создаем второй лист с инструкциями
    const instructionsData = [
      ['ИНСТРУКЦИЯ ПО ЗАПОЛНЕНИЮ ШАБЛОНА'],
      [''],
      ['1. Заполните все обязательные поля (отмечены красным)'],
      ['2. Поля калькулятора используются для расчета цен'],
      ['3. Поля экспорта включаются в итоговый каталог'],
      [''],
      ['ОБЯЗАТЕЛЬНЫЕ ПОЛЯ:'],
      ...requiredFields.map(field => [
        `• ${field.displayName || field.fieldName || field} (${field.type || 'text'})`
      ]),
      [''],
      ['ПОЛЯ КАЛЬКУЛЯТОРА:'],
      ...calculatorFields.map(field => [
        `• ${field.displayName || field.fieldName || field} (${field.type || 'text'})`
      ]),
      [''],
      ['ПОЛЯ ЭКСПОРТА:'],
      ...exportFields.map(field => [
        `• ${field.displayName || field.fieldName || field} (${field.type || 'text'})`
      ]),
      [''],
      ['ПРИМЕЧАНИЯ:'],
      ['• Не изменяйте названия колонок'],
      ['• Используйте точку как разделитель десятичных дробей'],
      ['• Даты указывайте в формате ДД.ММ.ГГГГ'],
      ['• Для полей типа "список" используйте только указанные варианты'],
      ['• Пустые строки будут проигнорированы при импорте']
    ];

    const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsData);
    instructionsWorksheet['!cols'] = [{ wch: 80 }];
    XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Инструкция');

    // Генерируем Excel файл
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true
    });

    // Создаем имя файла
    const categoryName = template.catalog_category?.name || 'category';
    const templateName = template.name || 'template';
    const fileName = `template_${categoryName}_${templateName}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Возвращаем файл
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Template export error:', error);
    return NextResponse.json(
      { error: 'Ошибка при экспорте шаблона' },
      { status: 500 }
    );
  }
}
