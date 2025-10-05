# 🔍 Отладка связей между компонентами

## 🎯 **Проблема:**
Связь между фильтрами не работает - при выборе значения в первом блоке, второй блок не обновляется.

## 🔍 **Анализ проблемы:**

### **1. Ошибка Prisma (исправлена):**
```
Unknown field `properties` for select statement on model `Product`
```
**Статус:** ✅ **ИСПРАВЛЕНО** - заменено на `properties_data`

### **2. Проблема с кэшем:**
- API возвращал закэшированные данные с ошибкой
- Кэш содержал старые результаты с неправильной структурой
**Статус:** ✅ **ИСПРАВЛЕНО** - кэш очищен через `/api/cache/clear`

### **3. Возможные проблемы в логике связей:**

#### **A. Передача данных между компонентами:**
```typescript
// В PageBuilder.tsx - handleConnectionData
const handleConnectionData = useCallback((sourceElementId: string, data: any) => {
  const outgoingConnections = (currentDocument.connections || []).filter(conn => 
    conn.sourceElementId === sourceElementId && conn.isActive
  );
  // ...
}, [currentDocument, selectedPage, handleUpdateElement]);
```

#### **B. Обновление фильтров в PropertyFilter:**
```typescript
// В PropertyFilter.tsx
if (element.props.filters && Object.keys(element.props.filters).length > 0) {
  // Используем новый API для фильтрованных товаров
  response = await fetch(`/api/catalog/products/filtered?${query.toString()}`);
}
```

#### **C. API для фильтрованных товаров:**
```typescript
// В /api/catalog/products/filtered/route.ts
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
```

## 🧪 **План тестирования:**

### **1. Тест API (test-connections.html):**
- ✅ Очистка кэша
- 🔄 Тест загрузки свойств
- 🔄 Тест уникальных значений
- 🔄 Тест фильтрованных товаров

### **2. Тест в конструкторе:**
1. **Создать два блока PropertyFilter**
2. **Настроить первый блок:** категория "Межкомнатные двери", свойство "Domeo_Стиль Web"
3. **Настроить второй блок:** категория "Межкомнатные двери", свойство "Domeo_Название модели для Web"
4. **Создать связь:** Ctrl+клик на оба блока → "🔍 Фильтры → (от первого ко второму)"
5. **Выбрать стиль** в первом блоке
6. **Проверить второй блок** - должны появиться только модели для выбранного стиля

### **3. Проверка логов в консоли:**
```
🔗 handleConnectionData вызвана: {sourceElementId: "...", data: {...}}
🔍 Синхронизация фильтров: {...}
PropertyFilter: Запрос к API с фильтрами: /api/catalog/products/filtered?...
PropertyFilter: Ответ API с фильтрами: {...}
```

## 🐛 **Возможные причины неработающих связей:**

### **1. Связь не создается:**
- Меню связи не появляется при Ctrl+клик
- Связь создается, но не сохраняется в `currentDocument.connections`

### **2. Данные не передаются:**
- `handleConnectionData` не вызывается
- Данные передаются, но в неправильном формате
- `onConnectionData` не передается в PropertyFilter

### **3. PropertyFilter не реагирует:**
- `useEffect` не срабатывает при изменении `element.props.filters`
- API запрос не выполняется или возвращает ошибку
- Данные получены, но не отображаются

### **4. API проблемы:**
- `/api/catalog/products/filtered` не работает
- Фильтрация товаров работает неправильно
- Данные возвращаются, но в неправильном формате

## 🔧 **Шаги отладки:**

### **1. Проверить API:**
```bash
# Тест без фильтров
GET /api/catalog/products/filtered?categoryIds=cmg50xcgs001cv7mn0tdyk1wo&propertyName=Domeo_Название%20модели%20для%20Web

# Тест с фильтром
GET /api/catalog/products/filtered?categoryIds=cmg50xcgs001cv7mn0tdyk1wo&propertyName=Domeo_Название%20модели%20для%20Web&filters={"Domeo_Стиль Web":"Скрытая"}
```

### **2. Проверить консоль браузера:**
- Ошибки JavaScript
- Логи API запросов
- Логи handleConnectionData

### **3. Проверить состояние компонентов:**
- `currentDocument.connections` содержит ли связи
- `element.props.filters` обновляется ли в PropertyFilter
- `selectedElementIds` содержит ли выбранные элементы

### **4. Проверить данные в базе:**
```sql
-- Проверить товары с определенным стилем
SELECT id, sku, name, properties_data 
FROM product 
WHERE catalog_category_id = 'cmg50xcgs001cv7mn0tdyk1wo' 
AND properties_data LIKE '%"Domeo_Стиль Web":"Скрытая"%'
LIMIT 5;
```

## 📋 **Следующие шаги:**

1. **Протестировать API** через test-connections.html
2. **Проверить создание связей** в конструкторе
3. **Отладить передачу данных** между компонентами
4. **Проверить реакцию PropertyFilter** на изменения фильтров
5. **Убедиться в корректности API** для фильтрованных товаров

---

**Цель: Найти точную причину, почему связь между фильтрами не работает! 🎯**

