# ✅ Исправления связей между фильтрами

## 🎯 **Проблемы:**
1. **Неправильная нумерация блоков** - оба блока показывали номер "2"
2. **Отсутствие связи между блоками** - фильтры не влияли друг на друга
3. **Нет общих свойств товаров** - блоки работали независимо

## 🔧 **Решения:**

### **1. Исправлена нумерация блоков**

**Проблема:** Оба блока показывали "Фильтр свойств 2"

**Решение:** Изменена логика в `getBlockNameWithNumber`:
```typescript
// lib/block-names.ts
export function getBlockNameWithNumber(type: string, existingElements: any[] = [], currentElementId?: string): string {
  const baseName = getBlockName(type);
  
  // Находим все элементы этого типа
  const sameTypeElements = existingElements.filter(el => el.type === type);
  
  // Если это единственный элемент такого типа, возвращаем без номера
  if (sameTypeElements.length <= 1) {
    return baseName;
  }
  
  // Находим позицию текущего элемента среди элементов этого типа
  const currentIndex = sameTypeElements.findIndex(el => el.id === currentElementId);
  
  // Если элемент не найден или это первый, возвращаем без номера
  if (currentIndex <= 0) {
    return baseName;
  }
  
  // Добавляем номер (позиция + 1)
  return `${baseName} ${currentIndex + 1}`;
}
```

**Результат:**
- **"Фильтр свойств"** (первый блок)
- **"Фильтр свойств 2"** (второй блок)
- **"Фильтр свойств 3"** (третий блок)

### **2. Создан API для фильтрованных товаров**

**Новый API:** `/api/catalog/products/filtered`

**Функционал:**
- Принимает `categoryIds`, `propertyName` и `filters`
- Фильтрует товары по заданным фильтрам
- Возвращает уникальные значения свойства для отфильтрованных товаров

```typescript
// app/api/catalog/products/filtered/route.ts
export async function GET(request: NextRequest) {
  // Загружаем товары с учетом фильтров
  const products = await prisma.product.findMany({
    where: {
      catalog_category_id: { in: categoryIds },
      is_active: true
    },
    select: {
      id: true,
      sku: true,
      name: true,
      properties_data: true
    }
  });

  // Фильтруем товары по значениям свойств
  const filteredProducts = products.filter(product => {
    const props = JSON.parse(product.properties_data);
    
    // Проверяем все фильтры
    for (const [filterPropertyName, filterValue] of Object.entries(filters)) {
      if (props[filterPropertyName] !== filterValue) {
        return false;
      }
    }
    
    return props.hasOwnProperty(propertyName);
  });

  // Извлекаем уникальные значения нужного свойства
  // ...
}
```

### **3. Улучшена передача данных между блоками**

**В PageBuilder.tsx:**
```typescript
// Если целевой элемент - PropertyFilter, обновляем его фильтры
if (targetElement.type === 'propertyFilter') {
  // Передаем фильтр по свойству товара
  const propertyName = data.propertyName;
  const propertyValue = data.value || data;
  
  // Обновляем фильтры целевого элемента
  const currentFilters = targetElement.props.filters || {};
  const newFilters = {
    ...currentFilters,
    [propertyName]: propertyValue
  };
  
  const updates: Partial<BaseElement> = {
    props: {
      ...targetElement.props,
      filters: newFilters
    }
  };
  handleUpdateElement(connection.targetElementId, updates);
}
```

### **4. Обновлен PropertyFilter для работы с фильтрами**

**В PropertyFilter.tsx:**
- Добавлена реакция на изменения `element.props.filters`
- Логика выбора API (с фильтрами или без)
- Использование нового API когда есть фильтры

```typescript
// Если есть фильтры, используем новый API для фильтрованных товаров
if (element.props.filters && Object.keys(element.props.filters).length > 0) {
  const query = new URLSearchParams();
  element.props.categoryIds.forEach((id: string) => {
    query.append('categoryIds', id);
  });
  query.append('propertyName', propertyName);
  query.append('filters', JSON.stringify(element.props.filters));

  response = await fetch(`/api/catalog/products/filtered?${query.toString()}`);
} else {
  // Обычный запрос без фильтров
  response = await fetch(`/api/catalog/properties/unique-values?${query.toString()}`);
}
```

## 🧪 **Как протестировать:**

### **1. Проверка нумерации:**
1. **Добавьте несколько блоков "Фильтр свойств"**
2. **Выделите каждый блок** - должны появиться правильные номера:
   - Первый: "Фильтр свойств"
   - Второй: "Фильтр свойств 2"
   - Третий: "Фильтр свойств 3"

### **2. Проверка связей между фильтрами:**
1. **Настройте первый блок** на свойство "Domeo_Стиль Web"
2. **Настройте второй блок** на свойство "Domeo_Название модели для Web"
3. **Создайте связь** "Фильтры → (от первого ко второму)"
4. **Выберите стиль** в первом блоке (например, "Скрытая")
5. **Проверьте второй блок** - должны отображаться только модели для выбранного стиля

### **3. Проверка работы фильтров:**
1. **Откройте консоль браузера** для просмотра логов
2. **Выберите значение** в первом блоке
3. **В консоли должны появиться сообщения:**
   ```
   🔗 handleConnectionData вызвана: {sourceElementId: "...", data: {...}}
   🔍 Синхронизация фильтров: {...}
   PropertyFilter: Запрос к API с фильтрами: /api/catalog/products/filtered?...
   PropertyFilter: Ответ API с фильтрами: {...}
   ```

### **4. Проверка API:**
1. **Проверьте работу API** напрямую:
   ```
   GET /api/catalog/products/filtered?categoryIds=cmg50xcgs001cv7mn0tdyk1wo&propertyName=Domeo_Название%20модели%20для%20Web&filters={"Domeo_Стиль Web":"Скрытая"}
   ```
2. **Должен вернуть** только модели для стиля "Скрытая"

## 📋 **Измененные файлы:**

1. **`lib/block-names.ts`**
   - Исправлена логика нумерации блоков

2. **`app/api/catalog/products/filtered/route.ts`** (новый)
   - API для загрузки товаров с фильтрами

3. **`components/page-builder/PageBuilder.tsx`**
   - Улучшена передача данных между блоками

4. **`components/page-builder/elements/PropertyFilter.tsx`**
   - Добавлена поддержка фильтров
   - Выбор API в зависимости от наличия фильтров

## ✅ **Результат:**

- ✅ **Правильная нумерация** - блоки имеют корректные номера
- ✅ **Работающие связи** - фильтры влияют друг на друга
- ✅ **Фильтрация по свойствам** - второй блок показывает только релевантные данные
- ✅ **Новый API** - поддержка фильтрованных запросов
- ✅ **Логирование** - подробные логи для отладки

---

**Теперь блоки правильно связаны и фильтры работают как ожидается! 🚀**

