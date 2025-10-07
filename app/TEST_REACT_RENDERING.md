# 🔧 Тестирование React-рендеринга PropertyFilter

## Добавленные логи для диагностики

### В `PropertyFilter.tsx`:
1. При рендере: `PropertyFilter [element-id]: Рендер. element.props.propertyName: [значение]`
2. В useEffect: `PropertyFilter [element-id]: useEffect triggered. element.props.propertyName: [значение]`
3. При изменении: `PropertyFilter [element-id]: handleValueChange. element.props.propertyName: [значение]`

### В `PropertiesPanel.tsx`:
4. При вызове onPropertiesChange: `🚨 PropertiesPanel: onPropertiesChange ВЫЗВАН!`
5. При вызове handleElementPropChange: `🚨 PropertiesPanel: handleElementPropChange вызван!`
6. При вызове onUpdateElement: `🚨 PropertiesPanel: onUpdateElement вызван!`

### В `ProductPropertiesSelector.tsx`:
7. При выборе свойства: `🚨 ProductPropertiesSelector: toggleProperty вызван!`

### В `PageBuilder.tsx`:
8. При вызове handleUpdateElement: `🚨 PageBuilder: handleUpdateElement вызван!`
9. После обновления документа: `🚨 PageBuilder: Документ обновлен!`

### В `ElementRenderer.tsx`:
10. При рендере PropertyFilter: `🚨 ElementRenderer: Рендерим PropertyFilter`

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

### Шаг 4: Проверьте полный поток логов
После выбора свойства в консоли должны появиться **ВСЕ** следующие логи в правильном порядке:

```
🚨 ProductPropertiesSelector: toggleProperty вызван! {propertyId: "...", newSelected: [...], categoryIds: [...]}
🚨 PropertiesPanel: onPropertiesChange ВЫЗВАН! {selectedPropertyIds: [...], availableProperties: 25, ...}
PropertiesPanel: Обновляем propertyName на: Domeo_Стиль Web
🚨 PropertiesPanel: handleElementPropChange вызван! {elementId: "...", key: "propertyName", value: "Domeo_Стиль Web", currentProps: {...}}
🚨 PropertiesPanel: onUpdateElement вызван! {elementId: "...", newProps: {...}}
🚨 PageBuilder: handleUpdateElement вызван! {elementId: "...", updates: {...}, selectedPageId: "..."}
🚨 PageBuilder: Документ обновлен! {elementId: "...", updatedElement: {...}}
🚨 ElementRenderer: Рендерим PropertyFilter {elementId: "...", elementProps: {...}, propertyName: "Domeo_Стиль Web"}
PropertyFilter [element-xxx]: Рендер. element.props.propertyName: Domeo_Стиль Web
```

### Шаг 5: Протестируйте фильтрацию
1. Кликните на значение в фильтре (например, "Классика")
2. В консоли должно появиться:
```
PropertyFilter [element-xxx]: handleValueChange. element.props.propertyName: Domeo_Стиль Web value: Классика
🔗 PropertyFilter отправляет данные: {propertyName: "Domeo_Стиль Web", ...}
```

## Диагностика проблем

### ❌ **Если НЕТ логов от `ProductPropertiesSelector`:**
- Проблема в UI - свойство не выбирается
- Проверьте, что категория выбрана
- Проверьте, что свойства загружаются

### ❌ **Если НЕТ логов от `PropertiesPanel: onPropertiesChange`:**
- Проблема в передаче данных между компонентами
- Проверьте, что `onPropertiesChange` передается правильно

### ❌ **Если НЕТ логов от `PropertiesPanel: handleElementPropChange`:**
- Проблема в логике установки `propertyName`
- Код `handleElementPropChange('propertyName', property.name)` не вызывается

### ❌ **Если НЕТ логов от `PageBuilder: handleUpdateElement`:**
- Проблема в передаче `onUpdateElement` в `PropertiesPanel`
- Проверьте, что функция передается правильно

### ❌ **Если НЕТ логов от `ElementRenderer: Рендерим PropertyFilter`:**
- **КРИТИЧЕСКАЯ ПРОБЛЕМА:** React не перерендеривает `PropertyFilter`
- Возможно, проблема в `updateElementInTree` или в структуре элементов

### ❌ **Если `ElementRenderer` показывает правильный `propertyName`, но `PropertyFilter` показывает `undefined`:**
- **ПРОБЛЕМА В ПЕРЕДАЧЕ PROPS:** React не передает обновленные props в `PropertyFilter`
- Возможно, проблема в мемоизации или в структуре компонента

## Ожидаемый результат

✅ **Правильная работа:**
- Все 10 логов появляются в правильном порядке
- `ElementRenderer` показывает правильный `propertyName`
- `PropertyFilter` рендерится с правильным `propertyName`
- При клике отправляется корректный `propertyName`

❌ **Проблемная работа:**
- Отсутствуют логи на каком-то этапе
- `ElementRenderer` показывает правильный `propertyName`, но `PropertyFilter` показывает `undefined`
- При клике отправляется `propertyName: undefined`

## Возможные решения

### Если проблема в React-рендеринге:
1. **Проверить `updateElementInTree`** - возможно, функция не правильно обновляет элемент
2. **Добавить `key` prop** к `PropertyFilter` для принудительного перерендеринга
3. **Использовать `useMemo` или `useCallback`** для оптимизации рендеринга

### Если проблема в передаче props:
1. **Проверить структуру `element`** - возможно, `element.props` не обновляется
2. **Добавить `useEffect`** для отслеживания изменений в `element.props.propertyName`
3. **Использовать `useState`** для локального состояния `propertyName`

