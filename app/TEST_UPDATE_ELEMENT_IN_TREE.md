# 🔧 Тестирование функции updateElementInTree

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

### В `updateElementInTree`:
11. При обновлении элемента: `🚨 updateElementInTree: Обновляем элемент`
12. После обновления: `🚨 updateElementInTree: Элемент найден и обновлен`

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
🚨 updateElementInTree: Обновляем элемент {elementId: "...", updates: {...}, elementsCount: ...}
🚨 updateElementInTree: Элемент найден и обновлен {elementId: "...", oldProps: {...}, newProps: {...}, propertyName: "Domeo_Стиль Web"}
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

### ❌ **Если НЕТ логов от `updateElementInTree: Обновляем элемент`:**
- **КРИТИЧЕСКАЯ ПРОБЛЕМА:** `updateElementInTree` не вызывается
- Возможно, проблема в передаче `updates` в `handleUpdateElement`

### ❌ **Если `updateElementInTree` показывает правильный `propertyName`, но `ElementRenderer` показывает `undefined`:**
- **ПРОБЛЕМА В СТРУКТУРЕ ЭЛЕМЕНТОВ:** Возможно, элемент находится в `children` контейнера
- Проверьте, что элемент не находится внутри контейнера

### ❌ **Если `updateElementInTree` НЕ находит элемент:**
- **ПРОБЛЕМА В ПОИСКЕ ЭЛЕМЕНТА:** Возможно, `elementId` не совпадает
- Проверьте, что `elementId` правильный

## Ожидаемый результат

✅ **Правильная работа:**
- Все 12 логов появляются в правильном порядке
- `updateElementInTree` находит элемент и правильно обновляет `propertyName`
- `ElementRenderer` показывает правильный `propertyName`
- `PropertyFilter` рендерится с правильным `propertyName`
- При клике отправляется корректный `propertyName`

❌ **Проблемная работа:**
- Отсутствуют логи на каком-то этапе
- `updateElementInTree` не находит элемент
- `updateElementInTree` находит элемент, но не обновляет `propertyName`
- `ElementRenderer` показывает правильный `propertyName`, но `PropertyFilter` показывает `undefined`

## Возможные решения

### Если проблема в `updateElementInTree`:
1. **Проверить `elementId`** - возможно, ID не совпадает
2. **Проверить структуру `updates`** - возможно, `updates.props.propertyName` не передается
3. **Проверить структуру элементов** - возможно, элемент находится в `children` контейнера

### Если проблема в структуре элементов:
1. **Добавить рекурсивный поиск** в контейнерах
2. **Проверить, что элемент не находится в `children`**
3. **Использовать `findElementInTree`** для поиска элемента по ID

