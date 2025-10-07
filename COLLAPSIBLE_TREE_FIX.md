# Исправление отображения дерева в закрытом виде

## Проблема

Дерево категорий отображалось в полностью развернутом виде, что создавало проблемы:

- **Перегруженный интерфейс** - все категории и подкатегории отображались сразу
- **Сложная навигация** - пользователю было трудно найти нужную категорию
- **Неэффективное использование пространства** - дерево занимало слишком много места
- **Плохой UX** - отсутствовала возможность управления видимостью узлов

## Решение

### 1. Добавление состояния для отслеживания развернутых узлов

```typescript
const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
```

### 2. Функции управления состоянием

```typescript
// Функции для управления состоянием развернутых узлов
const toggleNode = (nodeId: string) => {
  setExpandedNodes(prev => {
    const newSet = new Set(prev);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
    }
    return newSet;
  });
};

const isNodeExpanded = (nodeId: string) => {
  return expandedNodes.has(nodeId);
};
```

### 3. Обновленный рендеринг дерева с иконками

```typescript
const renderCategoryTree = (categories: Category[], level: number = 0) => {
  return categories.map((category) => {
    // Определяем дочерние категории (может быть children или subcategories)
    const childCategories = category.children || category.subcategories || [];
    const hasChildren = childCategories.length > 0;
    const isExpanded = isNodeExpanded(category.id);
    
    return (
      <div key={category.id} className="mb-1">
        <div 
          className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
            element.props.categoryIds?.includes(category.id) ? 'bg-blue-50' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {/* Иконка сворачивания/разворачивания */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(category.id);
              }}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              {isExpanded ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ) : (
            <div className="w-4 h-4 flex-shrink-0"></div>
          )}
          
          {/* Чекбокс */}
          <div 
            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${
              element.props.categoryIds?.includes(category.id)
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleCategorySelect(category.id)}
          >
            {element.props.categoryIds?.includes(category.id) && (
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* Название категории */}
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => handleCategorySelect(category.id)}
          >
            <div className="text-sm font-medium text-gray-900 truncate">
              {category.name}
            </div>
            <div className="text-xs text-gray-500">
              {category.products_count} товаров
            </div>
          </div>
          
          {/* Индикатор наличия подкатегорий */}
          {hasChildren && (
            <div className="text-xs text-gray-400 flex-shrink-0">
              {childCategories.length} подкатегорий
            </div>
          )}
        </div>
        
        {/* Рекурсивно рендерим дочерние категории (только если узел развернут) */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {renderCategoryTree(childCategories, level + 1)}
          </div>
        )}
      </div>
    );
  });
};
```

### 4. Кнопки управления всем деревом

```typescript
<div className="flex items-center justify-between mb-3">
  <h4 className="text-md font-medium text-gray-900">
    Выберите категории товаров
  </h4>
  <div className="flex space-x-2">
    <button
      onClick={() => {
        // Разворачиваем все узлы
        const allNodeIds = new Set<string>();
        const collectAllIds = (cats: Category[]) => {
          cats.forEach(cat => {
            const childCategories = cat.children || cat.subcategories || [];
            if (childCategories.length > 0) {
              allNodeIds.add(cat.id);
              collectAllIds(childCategories);
            }
          });
        };
        collectAllIds(categories);
        setExpandedNodes(allNodeIds);
      }}
      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
    >
      Развернуть все
    </button>
    <button
      onClick={() => setExpandedNodes(new Set())}
      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
    >
      Свернуть все
    </button>
  </div>
</div>
```

## Результаты

### ✅ **Что было исправлено:**

1. **Сворачиваемое дерево** - узлы теперь можно сворачивать/разворачивать
2. **Иконки управления** - стрелки для сворачивания/разворачивания
3. **Кнопки массового управления** - "Развернуть все" и "Свернуть все"
4. **Улучшенный UX** - более интуитивное управление деревом
5. **Экономия пространства** - дерево занимает меньше места по умолчанию

### 🌳 **Новое поведение дерева:**

#### По умолчанию (свернуто):
```
▶ Бытовая техника (0 товаров) [2 подкатегорий]
▶ Двери (3785 товаров) [5 подкатегорий]
▶ Мебель (1200 товаров) [3 подкатегорий]
```

#### После разворачивания узла:
```
▼ Бытовая техника (0 товаров) [2 подкатегорий]
  ▶ Бытовая техника для кухни (0 товаров)
  ▶ Бытовая техника для дома (0 товаров)
▶ Двери (3785 товаров) [5 подкатегорий]
▶ Мебель (1200 товаров) [3 подкатегорий]
```

#### После полного разворачивания:
```
▼ Бытовая техника (0 товаров) [2 подкатегорий]
  ▼ Бытовая техника для кухни (0 товаров)
    ☐ Стиральные машины (150 товаров)
    ☐ Холодильники (200 товаров)
  ▼ Бытовая техника для дома (0 товаров)
    ☐ Пылесосы (80 товаров)
▼ Двери (3785 товаров) [5 подкатегорий]
  ☐ Межкомнатные двери (2000 товаров)
  ☐ Входные двери (1785 товаров)
```

### 🎯 **Преимущества:**

1. **Компактность** - дерево занимает меньше места по умолчанию
2. **Навигация** - легко найти нужную категорию
3. **Контроль** - пользователь сам решает, что разворачивать
4. **Производительность** - рендерятся только видимые узлы
5. **Интуитивность** - стандартное поведение дерева

### 📱 **Технические детали:**

#### Состояние:
- **`expandedNodes`**: `Set<string>` для отслеживания развернутых узлов
- **`toggleNode`**: Функция для переключения состояния узла
- **`isNodeExpanded`**: Проверка состояния узла

#### Иконки:
- **Свернуто**: `▶` (стрелка вправо)
- **Развернуто**: `▼` (стрелка вниз)
- **Размер**: `w-3 h-3` (12px)
- **Цвет**: `text-gray-400` с hover `text-gray-600`

#### Логика рендеринга:
- **Условный рендеринг**: `{hasChildren && isExpanded && ...}`
- **Рекурсивность**: Сохраняется для всех уровней
- **Производительность**: Не рендерятся скрытые узлы

#### Кнопки управления:
- **"Развернуть все"**: Собирает все ID узлов с детьми
- **"Свернуть все"**: Очищает Set развернутых узлов
- **Стиль**: `bg-gray-100` с hover `bg-gray-200`

## Заключение

Теперь дерево категорий отображается в закрытом виде по умолчанию, что значительно улучшает пользовательский опыт. Пользователи могут:

- Видеть общую структуру каталога
- Разворачивать только нужные разделы
- Использовать кнопки массового управления
- Эффективно навигировать по дереву

Ключевые принципы, которые были применены:
- **Прогрессивное раскрытие**: Показывать информацию по мере необходимости
- **Контроль пользователя**: Дать возможность управлять видимостью
- **Стандартное поведение**: Использовать привычные иконки и паттерны
- **Производительность**: Рендерить только видимые элементы
- **Доступность**: Четкие визуальные индикаторы состояния
