# 🔧 Тестирование исправления `propertyName: undefined`

## Добавленные логи для диагностики

### В `PropertyFilter.tsx`:
1. При рендере: `PropertyFilter [element-id]: Рендер. element.props.propertyName: [значение]`
2. В useEffect: `PropertyFilter [element-id]: useEffect triggered. element.props.propertyName: [значение]`
3. При изменении: `PropertyFilter [element-id]: handleValueChange. element.props.propertyName: [значение]`

### В `PropertiesPanel.tsx`:
4. При вызове onPropertiesChange: `🚨 PropertiesPanel: onPropertiesChange ВЫЗВАН!`

### В `ProductPropertiesSelector.tsx`:
5. При выборе свойства: `🚨 ProductPropertiesSelector: toggleProperty вызван!`

## Инструкции по тестированию

### Шаг 1: Откройте конструктор
1. Перейдите на `http://localhost:3000/professional-builder`
2. Откройте DevTools (F12) → Console
3. Очистите консоль (Ctrl+L)

### Шаг 2: Создайте фильтр
1. Добавьте блок "Фильтр свойств"
2. Выберите его (он должен быть выделен синим)

### Шаг 3: Настройте фильтр
1. В правой панели выберите категорию: "Межкомнатные двери"
2. **ВАЖНО:** Выберите свойство для фильтрации (например, "Domeo_Стиль Web")

### Шаг 4: Проверьте логи
После выбора свойства в консоли должны появиться:
```
🚨 ProductPropertiesSelector: toggleProperty вызван! {propertyId: "...", newSelected: [...], categoryIds: [...]}
🚨 PropertiesPanel: onPropertiesChange ВЫЗВАН! {selectedPropertyIds: [...], availableProperties: 25, ...}
PropertiesPanel: Обновляем propertyName на: Domeo_Стиль Web
PropertyFilter [element-xxx]: Рендер. element.props.propertyName: Domeo_Стиль Web
```

### Шаг 5: Протестируйте фильтрацию
1. Кликните на значение в фильтре (например, "Классика")
2. В консоли должно появиться:
```
PropertyFilter [element-xxx]: handleValueChange. element.props.propertyName: Domeo_Стиль Web value: Классика
🔗 PropertyFilter отправляет данные: {propertyName: "Domeo_Стиль Web", ...}
```

## Ожидаемый результат

✅ **Правильная работа:**
- `propertyName` устанавливается при выборе свойства
- `PropertyFilter` рендерится с правильным `propertyName`
- При клике отправляется корректный `propertyName`

❌ **Проблемная работа:**
- Нет логов `🚨 ProductPropertiesSelector: toggleProperty вызван!` - проблема в выборе свойства
- Нет логов `🚨 PropertiesPanel: onPropertiesChange ВЫЗВАН!` - проблема в обработке выбора
- `PropertyFilter` рендерится с `propertyName: undefined` - проблема в передаче данных

## Диагностика проблем

### Если нет логов от `ProductPropertiesSelector`:
- Проблема в UI - свойство не выбирается
- Проверьте, что категория выбрана
- Проверьте, что свойства загружаются

### Если нет логов от `PropertiesPanel`:
- Проблема в передаче данных между компонентами
- Проверьте, что `onPropertiesChange` передается правильно

### Если `PropertyFilter` рендерится с `undefined`:
- Проблема в `handleElementPropChange`
- Возможно, элемент не обновляется корректно

