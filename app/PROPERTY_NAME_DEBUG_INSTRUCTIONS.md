# 🔍 Инструкции по диагностике `propertyName: undefined`

## Проблема
`PropertyFilter` отправляет `propertyName: undefined` при выборе значений, что приводит к сбою фильтрации между компонентами.

## Добавленные логи
В `PropertyFilter.tsx` добавлены следующие логи для диагностики:

1. **При рендере компонента:**
   ```
   PropertyFilter [element-id]: Рендер. element.props.propertyName: [значение]
   ```

2. **В начале useEffect:**
   ```
   PropertyFilter [element-id]: useEffect triggered. element.props.propertyName: [значение]
   ```

3. **При изменении значения (handleValueChange):**
   ```
   PropertyFilter [element-id]: handleValueChange. element.props.propertyName: [значение] value: [выбранное значение]
   ```

## Инструкции по тестированию

### Шаг 1: Откройте конструктор
1. Перейдите на `http://localhost:3000/professional-builder`
2. Откройте DevTools (F12) → вкладка Console
3. Очистите консоль (Ctrl+L)

### Шаг 2: Создайте два фильтра
1. Добавьте два блока "Фильтр свойств"
2. Настройте верхний фильтр:
   - Категория: Межкомнатные двери
   - Свойство: `Domeo_Стиль Web`
3. Настройте нижний фильтр:
   - Категория: Межкомнатные двери  
   - Свойство: `Domeo_Название модели для Web`

### Шаг 3: Создайте связь
1. Выберите верхний фильтр
2. Зажмите `Ctrl` и кликните на нижний фильтр
3. В меню выберите: `🔍 Фильтры → (от первого ко второму)`
4. Нажмите "Создать связь"

### Шаг 4: Протестируйте фильтрацию
1. Кликните на любое значение в верхнем фильтре (например, "Современная")
2. В консоли должны появиться новые логи

## Ожидаемые логи

### ✅ Правильная работа:
```
PropertyFilter [element-xxx]: Рендер. element.props.propertyName: Domeo_Стиль Web
PropertyFilter [element-xxx]: useEffect triggered. element.props.propertyName: Domeo_Стиль Web
PropertyFilter [element-xxx]: handleValueChange. element.props.propertyName: Domeo_Стиль Web value: Современная
🔗 PropertyFilter отправляет данные: {
  elementId: 'element-xxx',
  propertyName: 'Domeo_Стиль Web',
  value: 'Современная',
  categoryIds: ['cmg50xcgs001cv7mn0tdyk1wo']
}
```

### ❌ Проблемная работа:
```
PropertyFilter [element-xxx]: Рендер. element.props.propertyName: undefined
PropertyFilter [element-xxx]: useEffect triggered. element.props.propertyName: undefined
PropertyFilter [element-xxx]: handleValueChange. element.props.propertyName: undefined value: Современная
🔗 PropertyFilter отправляет данные: {
  elementId: 'element-xxx',
  propertyName: undefined,  ← ПРОБЛЕМА!
  value: 'Современная',
  categoryIds: ['cmg50xcgs001cv7mn0tdyk1wo']
}
```

## Диагностика проблем

### Если `propertyName: undefined` при рендере:
- Проблема в `PropertiesPanel` - не устанавливает `propertyName`
- Проверьте логи `PropertiesPanel: Обновляем propertyName на:`

### Если `propertyName` есть при рендере, но `undefined` в `handleValueChange`:
- Проблема в обновлении props элемента
- Возможно, `onUpdate` не сохраняет `propertyName`

### Если `propertyName` теряется между `useEffect` и `handleValueChange`:
- Проблема в жизненном цикле React компонента
- Возможно, элемент пересоздается без `propertyName`

## Следующие шаги
После получения логов из консоли, мы сможем точно определить, на каком этапе теряется `propertyName` и исправить проблему.

