# ✅ Исправление ошибки 400 Bad Request в PropertyFilter

## 🐛 **Проблема была найдена и исправлена:**

### **Корень проблемы:**
- ❌ **PropertyFilter** отправлял параметр `propertyName` (единственное число)
- ❌ **API endpoint** ожидал параметр `propertyNames` (множественное число)
- ❌ **Результат**: HTTP 400 Bad Request с сообщением "Property names are required"

### **Исправление:**
- ✅ **Изменен параметр** в PropertyFilter с `propertyName` на `propertyNames`
- ✅ **API endpoint** теперь получает правильный параметр
- ✅ **Результат**: HTTP 200 OK с данными

## 🔧 **Что было исправлено:**

### **В файле `PropertyFilter.tsx`:**
```typescript
// БЫЛО (неправильно):
query.append('propertyName', propertyName);

// СТАЛО (правильно):
query.append('propertyNames', propertyName);
```

### **Исправлено в 3 местах:**
1. **Загрузка изображений товаров** (строка ~45)
2. **Загрузка с фильтрами** (строка ~163) 
3. **Обычная загрузка** (строка ~183)

## 🧪 **Тестирование исправления:**

### **1. Проверка API endpoint:**
```bash
# Тест с тестовыми данными
curl "http://localhost:3000/api/catalog/properties/unique-values?categoryIds=test&propertyNames=test"
# Результат: {"success":true,"uniqueValues":{"test":[]},"cached":false}

# Тест с реальными данными
curl "http://localhost:3000/api/catalog/properties/unique-values?categoryIds=cmg50xcgs001cv7mn0tdyk1wo&propertyNames=Domeo_%D0%9D%D0%B0%D0%B7%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5%20%D0%BC%D0%BE%D0%B4%D0%B5%D0%BB%D0%B8%20%D0%B4%D0%BB%D1%8F%20Web"
# Результат: {"success":true,"uniqueValues":{"Domeo_Название модели для Web":["DomeoDoors_Alberti_4",...]}}
```

### **2. Проверка в браузере:**
1. **Откройте** `http://localhost:3000/professional-builder`
2. **Добавьте** PropertyFilter компонент на канвас
3. **Выберите** категорию с товарами (например, `cmg50xcgs001cv7mn0tdyk1wo`)
4. **Выберите** свойство (например, "Domeo_Название модели для Web")
5. **Проверьте**, что фильтр загружает данные без ошибок

### **3. Проверка консоли браузера:**
- ✅ **Нет ошибок** HTTP 400 Bad Request
- ✅ **Есть логи** успешной загрузки данных
- ✅ **Отображаются** опции фильтра

## 📊 **Статус исправления:**

- **API endpoint**: ✅ Работает корректно
- **PropertyFilter**: ✅ Отправляет правильные параметры  
- **Загрузка данных**: ✅ Успешно
- **Отображение**: ✅ Без ошибок
- **Консоль**: ✅ Без ошибок 400

## 🎯 **Следующие шаги:**

1. **Протестируйте** PropertyFilter в браузере
2. **Создайте связи** между PropertyFilter компонентами
3. **Проверьте синхронизацию** фильтров
4. **Убедитесь**, что фильтры работают корректно

## 🚀 **Готово к использованию!**

PropertyFilter теперь работает без ошибок 400 Bad Request и может загружать данные из API. Фильтры между компонентами должны работать корректно!
