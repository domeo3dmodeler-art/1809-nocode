import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { catalogService } from './catalog.service';
import { CatalogImportResult } from '../types/catalog';

const prisma = new PrismaClient();


export interface ExcelRow {
  [key: string]: any;
}

export class CatalogImportService {
  /**
   * Импорт каталога из Excel файла
   */
  async importFromExcel(file: Buffer, filename: string): Promise<CatalogImportResult> {
    try {
      // Читаем Excel файл
      const workbook = XLSX.read(file, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Конвертируем в JSON
      const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Пропускаем заголовок (первую строку)
      const rows = data.slice(1).filter(row => row.length > 0);
      
      if (rows.length === 0) {
        return {
          success: false,
          message: 'Файл не содержит данных',
          imported: 0,
          errors: ['Файл пуст или не содержит данных'],
          warnings: [],
          categories: []
        };
      }

      // Анализируем структуру файла
      const analysis = this.analyzeFileStructure(rows);
      
      if (!analysis.isValid) {
        return {
          success: false,
          message: 'Неверная структура файла',
          imported: 0,
          errors: analysis.errors,
          warnings: analysis.warnings,
          categories: []
        };
      }

      // Парсим категории
      const categories = this.parseCategories(rows, analysis);
      
      // Валидируем данные
      const validation = this.validateCategories(categories);
      
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Ошибки валидации данных',
          imported: 0,
          errors: validation.errors,
          warnings: validation.warnings,
          categories: []
        };
      }

      // Импортируем в базу данных
      const importResult = await this.importToDatabase(categories);
      
      return {
        success: true,
        message: `Успешно импортировано ${importResult.imported} категорий`,
        imported: importResult.imported,
        errors: importResult.errors,
        warnings: [...analysis.warnings, ...validation.warnings, ...importResult.warnings],
        categories: categories.map(cat => ({
          name: cat.name,
          level: cat.level,
          path: cat.path,
          parent: cat.parent,
          fullPath: cat.fullPath
        }))
      };

    } catch (error) {
      console.error('Error importing catalog:', error);
      return {
        success: false,
        message: 'Ошибка при импорте файла',
        imported: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        warnings: [],
        categories: []
      };
    }
  }

  /**
   * Анализ структуры файла
   */
  private analyzeFileStructure(rows: ExcelRow[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    maxLevel: number;
    columns: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (rows.length === 0) {
      errors.push('Файл не содержит данных');
      return { isValid: false, errors, warnings, maxLevel: 0, columns: [] };
    }

    // Определяем максимальное количество колонок
    const maxColumns = Math.max(...rows.map(row => Array.isArray(row) ? row.length : 0));
    
    if (maxColumns < 2) {
      errors.push('Файл должен содержать минимум 2 колонки (название и уровень)');
      return { isValid: false, errors, warnings, maxLevel: 0, columns: [] };
    }

    // Генерируем названия колонок
    const columns = Array.from({ length: maxColumns }, (_, i) => `Колонка ${i + 1}`);
    
    // Определяем максимальный уровень вложенности
    let maxLevel = 0;
    for (const row of rows) {
      if (Array.isArray(row)) {
        // Ищем первую непустую ячейку с названием
        for (let i = 0; i < row.length; i++) {
          if (row[i] && typeof row[i] === 'string' && row[i].trim()) {
            maxLevel = Math.max(maxLevel, i + 1);
            break;
          }
        }
      }
    }

    if (maxLevel === 0) {
      errors.push('Не найдено ни одной категории с названием');
      return { isValid: false, errors, warnings, maxLevel: 0, columns: [] };
    }

    if (maxLevel > 10) {
      warnings.push(`Обнаружено ${maxLevel} уровней вложенности. Рекомендуется не более 5-6 уровней.`);
    }

    return {
      isValid: true,
      errors,
      warnings,
      maxLevel,
      columns
    };
  }

  /**
   * Парсинг категорий из строк Excel
   */
  private parseCategories(rows: ExcelRow[], analysis: any): Array<{
    name: string;
    level: number;
    path: string;
    parent?: string;
    sortOrder: number;
    fullPath: string; // Полный путь для проверки дубликатов
  }> {
    const categories: Array<{
      name: string;
      level: number;
      path: string;
      parent?: string;
      sortOrder: number;
      fullPath: string;
    }> = [];

    const parentStack: string[] = [];

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      
      if (!Array.isArray(row)) continue;

      // Собираем все непустые ячейки в строке для построения полного пути
      const rowValues: string[] = [];
      let categoryName = '';
      let level = 0;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cellValue = row[colIndex];
        if (cellValue && typeof cellValue === 'string' && cellValue.trim()) {
          rowValues[colIndex] = cellValue.trim();
          if (!categoryName) {
            categoryName = cellValue.trim();
            level = colIndex + 1;
          }
        } else {
          rowValues[colIndex] = '';
        }
      }

      if (!categoryName) continue;

      // Обновляем стек родителей
      while (parentStack.length >= level) {
        parentStack.pop();
      }

      const parent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : undefined;
      const path = parentStack.length > 0 ? parentStack.join('/') : '';
      
      // Создаем полный путь для проверки дубликатов
      const fullPath = rowValues.filter(val => val).join('/');

      categories.push({
        name: categoryName,
        level,
        path,
        parent,
        sortOrder: rowIndex + 1,
        fullPath
      });

      // Добавляем в стек родителей
      parentStack.push(categoryName);
    }

    return categories;
  }

  /**
   * Валидация категорий
   */
  private validateCategories(categories: Array<{
    name: string;
    level: number;
    path: string;
    parent?: string;
    sortOrder: number;
    fullPath: string;
  }>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fullPathSet = new Set<string>(); // Для проверки полных дубликатов
    const nameSet = new Set<string>(); // Для статистики уникальных названий

    for (const category of categories) {
      // Проверка на пустое название
      if (!category.name || category.name.trim().length === 0) {
        errors.push(`Строка ${category.sortOrder}: пустое название категории`);
        continue;
      }

      // Проверка на полные дубликаты (одинаковые пути)
      if (fullPathSet.has(category.fullPath)) {
        errors.push(`Строка ${category.sortOrder}: полный дубликат пути "${category.fullPath}"`);
      } else {
        fullPathSet.add(category.fullPath);
      }

      // Добавляем в статистику названий (для информации)
      nameSet.add(category.name);

      // Проверка длины названия
      if (category.name.length > 255) {
        errors.push(`Строка ${category.sortOrder}: название слишком длинное (${category.name.length} символов)`);
      }

      // Проверка на специальные символы
      if (/[<>:"/\\|?*]/.test(category.name)) {
        warnings.push(`Строка ${category.sortOrder}: название содержит специальные символы: "${category.name}"`);
      }
    }

    // Информационное сообщение о статистике
    const totalCategories = categories.length;
    const uniqueNames = nameSet.size;
    if (totalCategories > uniqueNames) {
      warnings.push(`Обнаружено ${totalCategories} категорий с ${uniqueNames} уникальными названиями. Повторяющиеся названия в разных ветках - это нормально.`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Импорт в базу данных
   */
  private async importToDatabase(categories: Array<{
    name: string;
    level: number;
    path: string;
    parent?: string;
    sortOrder: number;
    fullPath: string;
  }>): Promise<{
    imported: number;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let imported = 0;

    try {
      // Начинаем транзакцию
      await prisma.$transaction(async (tx) => {
        // Очищаем существующие категории (опционально)
        // await tx.catalogCategory.deleteMany({});

        const categoryMap = new Map<string, string>(); // name -> id

        for (const categoryData of categories) {
          try {
            // Определяем parent_id
            let parentId: string | undefined;
            if (categoryData.parent) {
              parentId = categoryMap.get(categoryData.parent);
              if (!parentId) {
                errors.push(`Не найден родитель для категории "${categoryData.name}"`);
                continue;
              }
            }

            // Создаем категорию
            const category = await tx.catalogCategory.create({
              data: {
                name: categoryData.name,
                parent_id: parentId,
                level: categoryData.level,
                path: categoryData.path,
                sort_order: categoryData.sortOrder,
                is_active: true
              }
            });

            categoryMap.set(categoryData.name, category.id);
            imported++;

          } catch (error) {
            const errorMsg = `Ошибка создания категории "${categoryData.name}": ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
            errors.push(errorMsg);
            console.error(errorMsg, error);
          }
        }
      });

    } catch (error) {
      const errorMsg = `Ошибка транзакции: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`;
      errors.push(errorMsg);
      console.error(errorMsg, error);
    }

    return {
      imported,
      errors,
      warnings
    };
  }

  /**
   * Получение шаблона Excel файла
   */
  async getExcelTemplate(): Promise<Buffer> {
    const templateData = [
      ['Уровень 1', 'Уровень 2', 'Уровень 3', 'Уровень 4'],
      ['Бытовая техника для кухни', '', '', ''],
      ['', 'Холодильники', '', ''],
      ['', '', 'Однокамерные', ''],
      ['', '', '', 'Белые'],
      ['', '', '', 'Серые'],
      ['', '', 'Двухкамерные', ''],
      ['', '', '', 'Белые'],
      ['', '', '', 'Серые'],
      ['', 'Морозильники', '', ''],
      ['', '', 'Горизонтальные', ''],
      ['', '', 'Вертикальные', ''],
      ['Двери', '', '', ''],
      ['', 'Межкомнатные', '', ''],
      ['', '', 'Деревянные', ''],
      ['', '', 'Стеклянные', ''],
      ['', 'Входные', '', ''],
      ['', '', 'Металлические', ''],
      ['', '', 'Деревянные', ''],
      ['Кухни на заказ', '', '', ''],
      ['', 'Корпуса', '', ''],
      ['', '', 'ЛДСП', ''],
      ['', '', 'МДФ', ''],
      ['', 'Фасады', '', ''],
      ['', '', 'Пластик', ''],
      ['', '', 'Эмаль', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['ПРИМЕРЫ ПРАВИЛЬНОЙ СТРУКТУРЫ:', '', '', ''],
      ['', '', '', ''],
      ['Бытовая техника', '', '', ''],
      ['', 'Холодильники', '', ''],
      ['', '', 'Белые', ''],
      ['', '', 'Серые', ''],
      ['', 'Стиральные машины', '', ''],
      ['', '', 'Белые', ''],
      ['', '', 'Серые', ''],
      ['Двери', '', '', ''],
      ['', 'Межкомнатные', '', ''],
      ['', '', 'Белые', ''],
      ['', '', 'Серые', ''],
      ['', 'Входные', '', ''],
      ['', '', 'Белые', ''],
      ['', '', 'Серые', '']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Каталог');

    // Устанавливаем ширину колонок
    worksheet['!cols'] = [
      { width: 30 },
      { width: 25 },
      { width: 20 },
      { width: 15 }
    ];

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  /**
   * Получение истории импортов
   */
  async getImportHistory(): Promise<Array<{
    id: string;
    filename: string;
    imported_count: number;
    error_count: number;
    status: string;
    created_at: Date;
  }>> {
    return prisma.importHistory.findMany({
      orderBy: { created_at: 'desc' },
      take: 50
    });
  }
}

export const catalogImportService = new CatalogImportService();
