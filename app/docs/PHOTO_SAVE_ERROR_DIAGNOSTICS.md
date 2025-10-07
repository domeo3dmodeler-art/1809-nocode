# 🔍 Диагностика ошибки сохранения данных фотографий

## ❌ **Проблема:**
При завершении настройки связки фото появляется ошибка:
```
"Ошибка при сохранении данных фотографий: Ошибка при сохранении данных фотографий"
```

## 🔍 **Что было сделано для диагностики:**

### **1. Добавлено детальное логирование в API:**
```typescript
// app/app/api/admin/categories/[id]/route.ts
console.log('PUT /api/admin/categories/[id] - Обновление категории:', {
  categoryId,
  hasPhotoMapping: !!photoMapping,
  hasPhotoData: !!photoData,
  photoMappingType: typeof photoMapping,
  photoDataType: typeof photoData
});

console.log('Сохранение photoMapping:', photoMapping);
console.log('Сохранение photoData:', photoData);
console.log('Обновление в БД с данными:', updateData);
```

### **2. Добавлено логирование в DataUpload:**
```typescript
// app/components/category-builder/DataUpload.tsx
console.log('Отправляем данные фотографий на сервер:', {
  categoryId,
  photoMapping: mapping,
  photoData: requestBody.photoData
});

// Улучшена обработка ошибок:
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  console.error('Ошибка ответа сервера:', {
    status: response.status,
    statusText: response.statusText,
    errorData
  });
  throw new Error(`Ошибка при сохранении данных фотографий: ${errorData.error || response.statusText}`);
}
```

### **3. Проверена схема базы данных:**
- ✅ Поля `photo_mapping` и `photo_data` существуют в модели `FrontendCategory`
- ✅ База данных синхронизирована с схемой
- ✅ API поддерживает эти поля

## 🚀 **Как диагностировать проблему:**

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
```
Отправляем данные фотографий на сервер: { categoryId: "...", photoMapping: {...}, photoData: {...} }
PUT /api/admin/categories/[id] - Обновление категории: { categoryId: "...", hasPhotoMapping: true, ... }
Сохранение photoMapping: { mappingType: "by_sku", ... }
Сохранение photoData: { totalCount: 26, files: [...] }
Обновление в БД с данными: { photo_mapping: "...", photo_data: "...", ... }
```

### **4. Если есть ошибка, вы увидите:**
```
Ошибка ответа сервера: {
  status: 500,
  statusText: "Internal Server Error",
  errorData: { error: "..." }
}
```

## 🔧 **Возможные причины ошибки:**

### **1. Проблемы с JSON:**
```typescript
// Если photoMapping или photoData содержат циклические ссылки
JSON.stringify(photoMapping) // может вызвать ошибку
```

### **2. Проблемы с базой данных:**
```sql
-- Если поля photo_mapping или photo_data имеют ограничения
-- или неправильный тип данных
```

### **3. Проблемы с Prisma:**
```typescript
// Если Prisma Client не синхронизирован с схемой
await prisma.frontendCategory.update({ ... }) // может вызвать ошибку
```

### **4. Проблемы с данными:**
```typescript
// Если mapping.photoFiles содержит файлы без name
photoData.files.map(f => f.name) // может вызвать ошибку
```

## 📋 **Следующие шаги:**

### **1. Проверьте консоль браузера:**
- Откройте Developer Tools (F12)
- Перейдите на вкладку Console
- Повторите процесс связки фото
- Скопируйте все логи, связанные с сохранением

### **2. Проверьте логи сервера:**
- Откройте терминал где запущен Next.js
- Посмотрите логи при выполнении запроса
- Найдите ошибки Prisma или JSON

### **3. Проверьте данные:**
- Убедитесь, что все файлы имеют свойство `name`
- Проверьте, что `mapping` не содержит циклических ссылок
- Убедитесь, что `categoryId` существует

## 🎯 **Ожидаемый результат:**

После добавления логирования вы должны увидеть в консоли:

### **Успешный случай:**
```
Отправляем данные фотографий на сервер: { categoryId: "clxxx", photoMapping: {...}, photoData: {...} }
PUT /api/admin/categories/[id] - Обновление категории: { categoryId: "clxxx", hasPhotoMapping: true, hasPhotoData: true, photoMappingType: "object", photoDataType: "object" }
Сохранение photoMapping: { mappingType: "by_sku", photoFiles: [...], mappedPhotos: {...} }
Сохранение photoData: { totalCount: 26, files: ["photo1.jpg", "photo2.jpg", ...] }
Обновление в БД с данными: { photo_mapping: "{...}", photo_data: "{...}", updated_at: "2024-..." }
Категория успешно обновлена: clxxx
Данные фотографий сохранены в БД
```

### **Ошибка:**
```
Ошибка ответа сервера: {
  status: 400,
  statusText: "Bad Request",
  errorData: { error: "Не указан ID категории" }
}
```

## 💡 **Быстрые исправления:**

### **1. Если ошибка "Не указан ID категории":**
```typescript
// Проверьте, что categoryId передается правильно
console.log('categoryId:', categoryId); // Должно быть не undefined
```

### **2. Если ошибка JSON.stringify:**
```typescript
// Добавьте проверку на циклические ссылки
try {
  JSON.stringify(photoMapping);
} catch (e) {
  console.error('Ошибка сериализации photoMapping:', e);
}
```

### **3. Если ошибка Prisma:**
```typescript
// Проверьте, что все поля соответствуют схеме
console.log('updateData:', updateData);
```

## 🎉 **Результат:**

**Добавлено детальное логирование для диагностики ошибки сохранения данных фотографий!**

- ✅ **Логирование в API** - видно что приходит на сервер
- ✅ **Логирование в DataUpload** - видно что отправляется
- ✅ **Улучшенная обработка ошибок** - точная причина ошибки
- ✅ **Проверка схемы БД** - поля существуют и синхронизированы

**Теперь при возникновении ошибки вы увидите точную причину в консоли браузера!** 🔍✨




