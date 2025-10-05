# 🔍 Отладка PropertyFilter

## 🎯 Проблема:
PropertyFilter показывает "Нет доступных значений для свойства" даже после выбора категории и свойства.

## 🔧 Что добавлено для отладки:

### **1. ✅ Отладочные логи в PropertyFilter:**
- Логирование входных данных (`propertyName`, `categoryIds`, `selectedPropertyIds`)
- Логирование запроса к API
- Логирование ответа API
- Логирование найденных значений свойства

### **2. ✅ Отладочные логи в PropertiesPanel:**
- Логирование выбранных свойств
- Логирование найденного свойства по ID
- Логирование обновления `propertyName`

## 🚀 Как проверить:

1. **Откройте браузер** и перейдите на `http://localhost:3000/professional-builder`
2. **Откройте Developer Tools** (F12)
3. **Перейдите на вкладку Console**
4. **Добавьте PropertyFilter** и выберите категорию и свойство
5. **Посмотрите логи в консоли:**

### **Ожидаемые логи:**

```
PropertiesPanel: Изменение свойств {selectedPropertyIds: ["123"], availableProperties: 15}
PropertiesPanel: Найдено свойство: {id: "123", name: "Domeo_Стиль Web", ...}
PropertiesPanel: Обновляем propertyName на: Domeo_Стиль Web

PropertyFilter: Загрузка значений свойства {propertyName: "Domeo_Стиль Web", categoryIds: ["doors"], ...}
PropertyFilter: Запрос к API: /api/catalog/properties/unique-values?categoryIds=doors&propertyNames=Domeo_Стиль Web
PropertyFilter: Ответ API: {success: true, uniqueValues: {...}}
PropertyFilter: Найдены значения свойства: ["Скрытая", "Современная", "Классическая"]
PropertyFilter: Опции для отображения: [...]
```

## 🔍 Возможные проблемы:

### **Если не видно логов PropertiesPanel:**
- `availableProperties` пустой - нужно проверить загрузку свойств
- `selectedPropertyIds` не обновляется - проблема в ProductPropertiesSelector

### **Если не видно логов PropertyFilter:**
- `propertyName` не обновляется - проблема в PropertiesPanel
- `categoryIds` пустой - проблема с выбором категорий

### **Если API возвращает ошибку:**
- Проверить endpoint `/api/catalog/properties/unique-values`
- Проверить формат данных в базе

### **Если свойство не найдено по ID:**
- **Добавлено исправление:** PropertyFilter теперь сам загружает свойства через API если `propertyName` не установлен
- Проверьте логи: `PropertyFilter: Найдено имя свойства через API:`

## 📋 Следующие шаги:

После получения логов мы сможем точно определить, где происходит сбой и исправить проблему.

**Откройте консоль браузера и сообщите, какие логи вы видите!** 🔍
