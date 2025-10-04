# 🏗️ Архитектура No-Code конструктора

## 📊 Схема работы конструктора

```
┌─────────────────────────────────────────────────────────────────┐
│                    ConstructorToolbar                           │
│  [Undo] [Redo] [Save] [Load] [Preview] [Desktop/Tablet/Mobile] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┬──────────────────────────┬─────────────────────────┐
│             │                          │                         │
│ Elements    │        CanvasArea        │   PropertiesPanel       │
│ Panel       │                          │                         │
│             │  ┌─────────────────────┐ │  ┌─────────────────────┐ │
│ 📦 Container│  │                     │ │  │   Element Props     │ │
│ 📝 Text     │  │   [Element 1]       │ │  │                     │ │
│ 🖼️ Image    │  │   [Element 2]       │ │  │ • Text: "Hello"     │ │
│ 🔘 Button   │  │   [Element 3]       │ │  │ • Font: 16px        │ │
│ 🏪 Products │  │                     │ │  │ • Color: #333       │ │
│ 🔍 Filter   │  │                     │ │  │                     │ │
│ 🛒 Cart     │  │                     │ │  │ [Size & Position]   │ │
│             │  │                     │ │  │ • Width: 100%       │ │
│             │  │                     │ │  │ • Height: auto      │ │
│             │  │                     │ │  │ • X: 100px          │ │
│             │  │                     │ │  │ • Y: 200px          │ │
│             │  └─────────────────────┘ │  │                     │ │
│             │                          │  │ [Animations]        │ │
│             │                          │  │ [Responsive]        │ │
│             │                          │  └─────────────────────┘ │
└─────────────┴──────────────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   SmartSuggestions (AI)                        │
│  🤖 "Для дверей добавьте: ProductGrid, Filter, Calculator"     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Поток данных

```
1. Пользователь перетаскивает элемент
   ↓
2. ElementsPanel → CanvasArea (drag & drop)
   ↓
3. ConstructorContext.addElement()
   ↓
4. Element добавляется в state.elements
   ↓
5. CanvasArea рендерит новый элемент
   ↓
6. Пользователь выбирает элемент
   ↓
7. PropertiesPanel получает selectedElement
   ↓
8. Изменение свойств → updateElement()
   ↓
9. Element обновляется в state
   ↓
10. CanvasArea перерендеривает элемент
```

## 🗂️ Структура состояния

```typescript
ConstructorState {
  elements: [
    {
      id: "element-1",
      type: "block",
      component: "TextBlock",
      props: {
        content: "Hello World",
        fontSize: "16px",
        color: "#333333"
      },
      position: { x: 100, y: 200 },
      size: { width: "auto", height: "auto" },
      responsive: {
        mobile: { fontSize: "14px" }
      },
      animations: [
        { type: "fade-in", duration: 300 }
      ]
    }
  ],
  selectedElementId: "element-1",
  history: [/* массив состояний для undo/redo */],
  historyPointer: 0
}
```

## 🧩 Типы элементов

### Базовые элементы (Basic Blocks):
- **Container** - контейнер с фоном
- **Text** - текстовый блок
- **Image** - изображение
- **Button** - кнопка
- **Spacer** - отступ
- **Divider** - разделитель

### Макетные элементы (Layout Blocks):
- **Row** - строка с колонками
- **Column** - отдельная колонка

### Специализированные модули (Specialized Modules):
- **ProductGrid** - сетка товаров
- **ProductFilter** - фильтр товаров
- **ProductCart** - корзина
- **PriceCalculator** - калькулятор

## 🎨 Система рендеринга

### ElementRenderer.tsx
```typescript
const renderComponent = () => {
  switch (element.component) {
    case 'TextBlock':
      return <div style={styles}>{content}</div>;
    case 'ImageBlock':
      return <img src={src} alt={alt} style={styles} />;
    case 'ProductGridBlock':
      return <div>Product Grid Preview</div>;
    // ... другие компоненты
  }
};
```

### Проблема: Превью vs Реальный рендеринг
- **Сейчас**: Элементы показываются как превью/заглушки
- **Нужно**: Создать реальные React компоненты
- **Результат**: Полноценные страницы вместо макетов

## 🔧 API интеграция

### Сохранение конфигурации:
```typescript
POST /api/admin/constructor/save
{
  categoryId: "doors",
  name: "Door Configurator Page",
  configuration: {
    elements: [...],
    settings: {...}
  }
}
```

### Загрузка конфигурации:
```typescript
GET /api/admin/constructor/load?categoryId=doors
Response: { elements: [...], settings: {...} }
```

## 🚀 Следующие этапы развития

### 1. Реальный рендеринг (Priority: HIGH)
- Создать полноценные React компоненты
- Генерация готовых страниц
- Интеграция с Next.js роутингом

### 2. Публикация страниц (Priority: HIGH)
- API для создания реальных страниц
- Управление опубликованными страницами
- SEO оптимизация

### 3. Расширение элементов (Priority: MEDIUM)
- Формы и инпуты
- Видео и медиа
- Слайдеры и карусели

### 4. Шаблоны (Priority: MEDIUM)
- Готовые макеты страниц
- Библиотека шаблонов
- Импорт/экспорт конфигураций

## 💡 Заключение

**Текущее состояние**: Прототип с базовой функциональностью
**Готовность**: ~40% для демо, ~20% для production
**Основная проблема**: Нет реального рендеринга страниц
**Следующий шаг**: Создание системы генерации реальных страниц




