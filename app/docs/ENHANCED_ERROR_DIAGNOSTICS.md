# 🔍 Улучшенная диагностика ошибки сохранения данных фотографий

## ❌ **Текущая проблема:**
При завершении настройки связки фото появляется детальная ошибка:
```
"Ошибка при сохранении данных фотографий: Ошибка при сохранении данных фотографий: Ошибка при обновлении категории"
```

## ✅ **Что было добавлено для диагностики:**

### **1. Детальное логирование в API (`/api/admin/categories/[id]`):**

#### **Проверка существования категории:**
```typescript
console.log('Проверяем существование категории:', categoryId);
console.log('Категория найдена:', {
  id: existingCategory.id,
  name: existingCategory.name,
  slug: existingCategory.slug,
  isActive: existingCategory.is_active
});
```

#### **Безопасная сериализация JSON:**
```typescript
if (photoMapping) {
  console.log('Сохранение photoMapping:', photoMapping);
  try {
    updateData.photo_mapping = JSON.stringify(photoMapping);
    console.log('photoMapping успешно сериализован');
  } catch (error) {
    console.error('Ошибка сериализации photoMapping:', error);
    return NextResponse.json(
      { error: 'Ошибка сериализации данных фото-связки' },
      { status: 400 }
    );
  }
}
```

#### **Обработка ошибок Prisma:**
```typescript
try {
  updatedCategory = await prisma.frontendCategory.update({
    where: { id: categoryId },
    data: updateData
  });
  console.log('Категория успешно обновлена:', updatedCategory.id);
} catch (prismaError) {
  console.error('Ошибка Prisma при обновлении категории:', prismaError);
  return NextResponse.json(
    { error: `Ошибка базы данных: ${prismaError.message}` },
    { status: 500 }
  );
}
```

### **2. Проверка categoryId в DataUpload:**

```typescript
console.log('handlePhotoMappingComplete вызван с categoryId:', categoryId);

if (!categoryId) {
  console.error('categoryId не определен! Нельзя сохранить данные фотографий.');
  alert('Ошибка: ID категории не определен. Невозможно сохранить данные фотографий.');
  return;
}
```

## 🔍 **Как диагностировать проблему:**

### **1. Откройте Developer Tools:**
```
F12 → Console
```

### **2. Повторите процесс связки фото:**
```
1. Загрузите фото
2. Настройте связку
3. Нажмите "Завершить настройку"
```

### **3. Проверьте логи в консоли:**

#### **Успешный случай:**
```
handlePhotoMappingComplete вызван с categoryId: clxxx
Отправляем данные фотографий на сервер: { categoryId: "clxxx", photoMapping: {...}, photoData: {...} }
PUT /api/admin/categories/[id] - Обновление категории: { categoryId: "clxxx", hasPhotoMapping: true, hasPhotoData: true, photoMappingType: "object", photoDataType: "object" }
Проверяем существование категории: clxxx
Категория найдена: { id: "clxxx", name: "Двери тест", slug: "doors-test", isActive: true }
Сохранение photoMapping: { mappingType: "by_sku", photoFiles: [...], mappedPhotos: {...} }
photoMapping успешно сериализован
Сохранение photoData: { totalCount: 26, files: ["photo1.jpg", "photo2.jpg", ...] }
photoData успешно сериализован
Обновление в БД с данными: { photo_mapping: "{...}", photo_data: "{...}", updated_at: "2024-..." }
Категория успешно обновлена: clxxx
Данные фотографий сохранены в БД
```

#### **Ошибка categoryId:**
```
handlePhotoMappingComplete вызван с categoryId: undefined
categoryId не определен! Нельзя сохранить данные фотографий.
```

#### **Ошибка сериализации:**
```
Сохранение photoMapping: { mappingType: "by_sku", photoFiles: [...], mappedPhotos: {...} }
Ошибка сериализации photoMapping: TypeError: Converting circular structure to JSON
```

#### **Ошибка Prisma:**
```
Обновление в БД с данными: { photo_mapping: "{...}", photo_data: "{...}", updated_at: "2024-..." }
Ошибка Prisma при обновлении категории: PrismaClientValidationError: Invalid value provided
```

#### **Ошибка категории не найдена:**
```
Проверяем существование категории: clxxx
Категория не найдена: clxxx
```

## 🎯 **Возможные причины ошибки:**

### **1. categoryId не определен:**
```typescript
// Если categoryId = undefined
if (!categoryId) {
  // Ошибка: ID категории не определен
}
```

### **2. Категория не существует в БД:**
```sql
-- Если категория была удалена или ID неправильный
SELECT * FROM frontend_categories WHERE id = 'clxxx';
-- Результат: пустой
```

### **3. Проблемы с JSON сериализацией:**
```typescript
// Если photoMapping содержит циклические ссылки
JSON.stringify(photoMapping); // TypeError: Converting circular structure to JSON
```

### **4. Проблемы с Prisma:**
```typescript
// Если данные не соответствуют схеме БД
await prisma.frontendCategory.update({
  where: { id: categoryId },
  data: updateData // Неправильные данные
});
```

### **5. Проблемы с файлами:**
```typescript
// Если файлы не имеют свойства name
photoData.files.map(f => f.name); // TypeError: Cannot read property 'name' of undefined
```

## 🚀 **Следующие шаги:**

### **1. Проверьте логи в консоли браузера:**
- Откройте Developer Tools (F12)
- Перейдите на вкладку Console
- Повторите процесс связки фото
- Скопируйте все логи

### **2. Проверьте логи сервера:**
- Откройте терминал где запущен Next.js
- Посмотрите логи при выполнении запроса
- Найдите ошибки Prisma или JSON

### **3. Проверьте данные:**
- Убедитесь, что `categoryId` передается правильно
- Проверьте, что категория существует в БД
- Убедитесь, что все файлы имеют свойство `name`
- Проверьте, что `mapping` не содержит циклических ссылок

## 💡 **Быстрые исправления:**

### **1. Если categoryId undefined:**
```typescript
// Проверьте передачу categoryId в CategoryBuilder
<DataUpload
  categoryId={categoryData?.id} // Должно быть не undefined
  onPriceListLoaded={handlePriceListLoaded}
  onPhotosLoaded={handlePhotosLoaded}
  onComplete={handleDataComplete}
/>
```

### **2. Если категория не найдена:**
```sql
-- Проверьте существование категории в БД
SELECT id, name, slug FROM frontend_categories WHERE id = 'your-category-id';
```

### **3. Если ошибка JSON:**
```typescript
// Добавьте проверку на циклические ссылки
const safePhotoMapping = JSON.parse(JSON.stringify(mapping));
```

## 🎉 **Результат:**

**Добавлена полная диагностика для выявления точной причины ошибки сохранения данных фотографий!**

- ✅ **Проверка categoryId** - видно определен ли ID категории
- ✅ **Проверка существования категории** - видно найдена ли категория в БД
- ✅ **Безопасная сериализация JSON** - обработка ошибок сериализации
- ✅ **Обработка ошибок Prisma** - детальная информация об ошибках БД
- ✅ **Детальное логирование** - полная трассировка процесса сохранения

**Теперь при возникновении ошибки вы увидите точную причину в консоли браузера!** 🔍✨




