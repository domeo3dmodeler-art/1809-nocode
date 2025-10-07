# 🔍 Отладка propertyName: undefined

## 🚨 ПРОБЛЕМА
```
🔗 PropertyFilter отправляет данные: {propertyName: undefined, value: "Скрытая", ...}
```

`PropertyFilter` не знает название своего свойства, поэтому фильтрация не работает.

## 🔧 ИСПРАВЛЕНИЯ

### 1. Добавлено подробное логирование
- **PropertiesPanel.tsx**: Логи загрузки свойств и настройки `propertyName`
- **PropertyFilter.tsx**: Логи отправки данных через систему связей

### 2. Добавлен fallback механизм
- Если свойство не найдено по ID, используется имя свойства напрямую

## 📋 ТЕСТИРОВАНИЕ

### Шаг 1: Открыть конструктор
```
http://localhost:3000/professional-builder
```

### Шаг 2: Создать блок PropertyFilter
1. Перетащите блок "Фильтр свойств"
2. В правой панели настройте:
   - **Категория**: "Межкомнатные двери"
   - **Свойство**: "Domeo_Стиль Web"

### Шаг 3: Проверить логи загрузки свойств
В консоли должны появиться:
```
PropertiesPanel: Загрузка свойств для категорий: ["cmg50xcgs001cv7mn0tdyk1wo"]
PropertiesPanel: Загружены свойства: [{id: "...", name: "Domeo_Стиль Web"}, ...]
PropertiesPanel: Установлены доступные свойства: [{id: "...", name: "Domeo_Стиль Web"}, ...]
```

### Шаг 4: Проверить настройку propertyName
При выборе свойства в консоли должны появиться:
```
PropertiesPanel: Изменение свойств: {selectedPropertyIds: ["..."], availableProperties: 25, ...}
PropertiesPanel: Найдено свойство: {id: "...", name: "Domeo_Стиль Web"}
PropertiesPanel: Обновляем propertyName на: Domeo_Стиль Web
PropertiesPanel: Проверка после обновления: {propertyName: "Domeo_Стиль Web", ...}
```

### Шаг 5: Протестировать фильтрацию
1. Создайте второй блок PropertyFilter
2. Настройте его на свойство "Domeo_Название модели для Web"
3. Создайте связь между блоками
4. Выберите значение в первом блоке

**Ожидаемые логи:**
```
🔗 PropertyFilter отправляет данные: {propertyName: "Domeo_Стиль Web", value: "Скрытая", ...}
🔗 handleConnectionData вызвана: {sourceElementId: "...", data: {propertyName: "Domeo_Стиль Web", ...}}
🔍 Обновляем PropertyFilter фильтр: {propertyName: "Domeo_Стиль Web", propertyValue: "Скрытая", ...}
```

## 🐛 ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### Проблема 1: availableProperties пустой
**Симптомы:**
```
PropertiesPanel: availableProperties: 0
PropertiesPanel: Свойство не найдено!
```
**Решение:** Проверить загрузку категорий и свойств

### Проблема 2: Свойство не найдено по ID
**Симптомы:**
```
PropertiesPanel: Найдено свойство: undefined
PropertiesPanel: Попытка найти свойство по имени...
```
**Решение:** Используется fallback механизм

### Проблема 3: propertyName все еще undefined
**Симптомы:**
```
PropertiesPanel: Проверка после обновления: {propertyName: undefined, ...}
```
**Решение:** Проверить `handleElementPropChange` в PageBuilder

## ✅ КРИТЕРИИ УСПЕХА

1. **Загрузка свойств:**
   ```
   PropertiesPanel: Установлены доступные свойства: [{id: "...", name: "Domeo_Стиль Web"}, ...]
   ```

2. **Настройка propertyName:**
   ```
   PropertiesPanel: Обновляем propertyName на: Domeo_Стиль Web
   PropertiesPanel: Проверка после обновления: {propertyName: "Domeo_Стиль Web", ...}
   ```

3. **Отправка данных:**
   ```
   🔗 PropertyFilter отправляет данные: {propertyName: "Domeo_Стиль Web", value: "Скрытая", ...}
   ```

4. **Работа связей:**
   ```
   🔍 Обновляем PropertyFilter фильтр: {propertyName: "Domeo_Стиль Web", propertyValue: "Скрытая", ...}
   ```

## 🎯 СЛЕДУЮЩИЕ ШАГИ

После успешного исправления:
1. Убрать избыточное логирование
2. Протестировать с разными свойствами
3. Добавить валидацию свойств
4. Оптимизировать загрузку свойств

