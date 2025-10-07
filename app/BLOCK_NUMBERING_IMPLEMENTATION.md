# ✅ Реализация нумерации блоков

## 🎯 **Проблема:**
Пользователь не мог понять, какой блок первый, а какой второй при создании связей, так как все блоки имели одинаковые названия.

## 🔧 **Решение:**
Добавлена автоматическая нумерация повторяющихся блоков с русскими названиями.

## 📋 **Изменения:**

### **1. Обновлена функция `getDisplayName`:**
```typescript
// lib/block-names.ts
export function getDisplayName(type: string, existingElements: any[] = [], currentElementId?: string): string {
  const baseName = getBlockName(type);
  
  // Для некоторых типов добавляем номера
  const typesWithNumbers = [
    'propertyFilter',
    'productFilter', 
    'filteredProducts',
    'productCard',
    'productGallery',
    'productDetails',
    'priceDisplay',
    'summaryTable'
  ];
  
  if (typesWithNumbers.includes(type)) {
    return getBlockNameWithNumber(type, existingElements, currentElementId);
  }
  
  return baseName;
}
```

### **2. Улучшена функция `getBlockNameWithNumber`:**
```typescript
export function getBlockNameWithNumber(type: string, existingElements: any[] = [], currentElementId?: string): string {
  const baseName = getBlockName(type);
  
  // Считаем сколько уже есть элементов этого типа (исключая текущий)
  const sameTypeElements = existingElements.filter(el => el.type === type && el.id !== currentElementId);
  
  // Если это первый элемент такого типа, возвращаем без номера
  if (sameTypeElements.length === 0) {
    return baseName;
  }
  
  // Иначе добавляем номер (количество предыдущих + 1)
  return `${baseName} ${sameTypeElements.length + 1}`;
}
```

### **3. Обновлен `SelectionOverlay`:**
- Добавлен проп `allElements` для передачи всех элементов страницы
- Передается `currentElementId` для правильного подсчета номеров
- Используется `getDisplayName` вместо `getBlockName`

### **4. Обновлен `ElementRenderer`:**
- Добавлен проп `allElements`
- Передается в `SelectionOverlay`

### **5. Обновлен `Canvas`:**
- Передается `page?.elements` в `ElementRenderer` как `allElements`

### **6. Исправлен API для изображений:**
- Исправлено поле `properties` → `properties_data` в `/api/catalog/products/images/route.ts`

## 🎨 **Результат:**

### **Нумерация блоков:**
- **"Фильтр свойств"** (первый блок)
- **"Фильтр свойств 2"** (второй блок)
- **"Фильтр свойств 3"** (третий блок)
- **"Каталог товаров"** (первый блок)
- **"Каталог товаров 2"** (второй блок)

### **Типы с нумерацией:**
- `propertyFilter` → "Фильтр свойств"
- `productFilter` → "Фильтр товаров"
- `filteredProducts` → "Отфильтрованные товары"
- `productCard` → "Карточка товара"
- `productGallery` → "Галерея товара"
- `productDetails` → "Детали товара"
- `priceDisplay` → "Отображение цены"
- `summaryTable` → "Сводная таблица"

## 🧪 **Как протестировать:**

### **1. Создание нескольких блоков:**
1. **Добавьте несколько блоков "Фильтр свойств"** на страницу
2. **Выделите каждый блок** - должны появиться номера:
   - Первый: "Фильтр свойств"
   - Второй: "Фильтр свойств 2"
   - Третий: "Фильтр свойств 3"

### **2. Проверка направления связей:**
1. **Выделите два блока PropertyFilter** (Ctrl + клик)
2. **В меню создания связей** теперь понятно:
   - "Фильтры → (от первого ко второму)" - от "Фильтр свойств" к "Фильтр свойств 2"
   - "Фильтры ← (от второго к первому)" - от "Фильтр свойств 2" к "Фильтр свойств"

### **3. Проверка в тултипе:**
1. **Наведите на блок** - в тултипе должно быть правильное название с номером
2. **Проверьте ID блока** - должен отображаться корректно

## 📋 **Измененные файлы:**

1. **`lib/block-names.ts`**
   - Обновлены функции `getDisplayName` и `getBlockNameWithNumber`
   - Добавлена поддержка `currentElementId`

2. **`components/page-builder/elements/SelectionOverlay.tsx`**
   - Добавлен проп `allElements`
   - Передается `currentElementId` в `getDisplayName`

3. **`components/page-builder/elements/ElementRenderer.tsx`**
   - Добавлен проп `allElements`
   - Передается в `SelectionOverlay`

4. **`components/page-builder/layout/Canvas.tsx`**
   - Передается `page?.elements` в `ElementRenderer`

5. **`app/api/catalog/products/images/route.ts`**
   - Исправлено поле `properties` → `properties_data`

## ✅ **Результат:**

- ✅ **Номера в названиях** - блоки имеют уникальные названия
- ✅ **Понятное направление связей** - ясно, какой блок первый, какой второй
- ✅ **Правильный подсчет** - номера учитывают порядок добавления
- ✅ **Исправлены ошибки API** - нет ошибок Prisma
- ✅ **Русские названия** - все блоки имеют русские названия

---

**Теперь при создании связей понятно, какой блок первый, а какой второй! 🚀**

