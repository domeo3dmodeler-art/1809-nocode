/**
 * Утилиты для работы со строками и решения проблем с кодировкой
 */

/**
 * Нормализует строку для сравнения (убирает лишние пробелы, приводит к нижнему регистру)
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Проверяет, совпадают ли две строки с учетом возможных проблем с кодировкой
 */
export function fuzzyMatch(str1: string, str2: string): boolean {
  // 1. Точное совпадение
  if (str1 === str2) return true;
  
  // 2. Нормализованное совпадение
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  if (norm1 === norm2) return true;
  
  // 3. Частичное совпадение
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  // 4. Совпадение по ключевым словам (минимум 3 символа)
  const keywords1 = norm1.split(/[\s_-]+/).filter(word => word.length >= 3);
  const keywords2 = norm2.split(/[\s_-]+/).filter(word => word.length >= 3);
  
  // Проверяем, есть ли совпадения по ключевым словам
  const hasCommonKeywords = keywords1.some(keyword => 
    keywords2.some(keyKeyword => 
      keyword.includes(keyKeyword) || keyKeyword.includes(keyword)
    )
  );
  
  return hasCommonKeywords;
}

/**
 * Находит значение свойства в объекте по имени с учетом возможных проблем с кодировкой
 */
export function findPropertyValue(propertyName: string, data: Record<string, any>): any {
  // 1. Пробуем точное совпадение
  if (data[propertyName] !== undefined) {
    return data[propertyName];
  }
  
  // 2. Пробуем найти по fuzzy match
  for (const key in data) {
    if (fuzzyMatch(key, propertyName)) {
      return data[key];
    }
  }
  
  return undefined;
}

/**
 * Извлекает уникальные значения свойства из массива товаров
 */
export function extractUniquePropertyValues(
  products: any[],
  propertyName: string
): Array<{ value: any; label: string }> {
  const uniqueValues = new Set<any>();
  
  products.forEach((product: any) => {
    if (product.properties_data) {
      try {
        const propsData = typeof product.properties_data === 'string' 
          ? JSON.parse(product.properties_data) 
          : product.properties_data;
        
        const propertyValue = findPropertyValue(propertyName, propsData);
        
        if (propertyValue !== undefined && propertyValue !== null && propertyValue !== '') {
          // Приводим к строке для корректного сравнения
          const valueStr = String(propertyValue);
          uniqueValues.add(valueStr);
        }
      } catch (error) {
        console.error('Error parsing properties_data:', error);
      }
    }
  });
  
  // Преобразуем Set в массив опций
  return Array.from(uniqueValues).map((value) => ({
    value: value,
    label: String(value)
  }));
}

