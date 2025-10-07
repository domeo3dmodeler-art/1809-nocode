# Настройки отображения свойств в PropertyFilter

## Обзор

Добавлены расширенные настройки отображения для компонента PropertyFilter, включая возможность отображения вертикальных карточек товаров и гибкую настройку макета.

## Новые возможности

### 🎨 **Настройки отображения**

#### 1. **Показывать изображения**
- **Опция**: Включить/выключить отображение изображений товаров
- **По умолчанию**: Включено
- **Применение**: Влияет на карточки фильтра и карточки товаров

#### 2. **Показывать количество**
- **Опция**: Отображать количество товаров в каждой категории
- **По умолчанию**: Включено
- **Применение**: Показывает количество товаров для каждого значения фильтра

#### 3. **Макет карточек**
- **Вертикальные карточки** 📱: Карточки товаров в вертикальном формате
- **Горизонтальные карточки** 📄: Карточки товаров в горизонтальном формате
- **По умолчанию**: Вертикальные

#### 4. **Количество колонок**
- **Опции**: 1, 2, 3, 4 колонки
- **По умолчанию**: 3 колонки
- **Применение**: Определяет количество колонок в сетке товаров

#### 5. **Показывать карточки товаров**
- **Опция**: Включить/выключить отображение карточек товаров под фильтром
- **По умолчанию**: Включено
- **Применение**: Показывает товары, соответствующие выбранному фильтру

#### 6. **Максимальное количество товаров**
- **Опции**: 6, 12, 24, 48 товаров
- **По умолчанию**: 12 товаров
- **Применение**: Ограничивает количество отображаемых товаров

## Техническая реализация

### 📁 **Измененные файлы:**

#### 1. `SimplifiedPropertyFilterPanel.tsx`
- **Добавлен новый шаг**: "Отображение" (шаг 3)
- **Новый интерфейс**: `DisplaySettings`
- **Функция**: `handleDisplaySettingsChange`

```typescript
interface DisplaySettings {
  showImages: boolean;
  showCounts: boolean;
  cardLayout: 'horizontal' | 'vertical';
  columns: number;
  showProductCards: boolean;
  maxProducts: number;
}
```

#### 2. `PropertyFilter.tsx`
- **Добавлено состояние**: `products` для хранения товаров
- **Новая функция**: `loadProducts` для загрузки товаров
- **Обновлен рендер**: Добавлено отображение карточек товаров

### 🔧 **Новые функции:**

#### `loadProducts(propertyName, propertyValue)`
```typescript
const loadProducts = async (propertyName: string, propertyValue: string) => {
  if (!displaySettings.showProductCards) return;
  
  try {
    const response = await fetch('/api/catalog/products/filtered', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryIds: element.props.categoryIds,
        filters: { [propertyName]: propertyValue },
        limit: displaySettings.maxProducts
      }),
    });

    if (response.ok) {
      const data = await response.json();
      setProducts(data.products || []);
    }
  } catch (error) {
    console.error('PropertyFilter: Ошибка загрузки товаров:', error);
    setProducts([]);
  }
};
```

#### `handleDisplaySettingsChange(settings)`
```typescript
const handleDisplaySettingsChange = (settings: Partial<DisplaySettings>) => {
  const newSettings = { ...displaySettings, ...settings };
  setDisplaySettings(newSettings);
  onUpdateElement(element.id, {
    props: { 
      ...element.props, 
      displaySettings: newSettings
    }
  });
};
```

## Пользовательский интерфейс

### 🎯 **Процесс настройки:**

1. **Шаг 1**: Выбор категорий товаров
2. **Шаг 2**: Выбор свойства для фильтрации
3. **Шаг 3**: **Настройка отображения** (новый шаг)
4. **Шаг 4**: Предварительный просмотр

### 🎨 **Интерфейс настроек отображения:**

#### Переключатели (Toggle):
- **Показывать изображения**: Слайдер для включения/выключения
- **Показывать количество**: Слайдер для включения/выключения
- **Показывать карточки товаров**: Слайдер для включения/выключения

#### Выбор макета:
- **Вертикальные карточки**: Кнопка с иконкой 📱
- **Горизонтальные карточки**: Кнопка с иконкой 📄

#### Количество колонок:
- **Кнопки**: 1, 2, 3, 4 колонки
- **Визуальный выбор**: Активная кнопка выделена синим цветом

#### Максимальное количество товаров:
- **Кнопки**: 6, 12, 24, 48 товаров
- **Условное отображение**: Показывается только если включены карточки товаров

## Отображение товаров

### 📱 **Вертикальные карточки:**
```typescript
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
  {/* Изображение товара */}
  <div className="aspect-square">
    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
  </div>
  
  {/* Информация о товаре */}
  <div className="p-3 flex-1">
    <h5 className="text-sm font-medium text-gray-900 truncate mb-1">
      {product.name}
    </h5>
    {product.description && (
      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
        {product.description}
      </p>
    )}
    {product.price && (
      <div className="text-sm font-semibold text-blue-600">
        {product.price} ₽
      </div>
    )}
  </div>
</div>
```

### 📄 **Горизонтальные карточки:**
```typescript
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex">
  {/* Изображение товара */}
  <div className="w-24 h-24 flex-shrink-0">
    <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-l-lg" />
  </div>
  
  {/* Информация о товаре */}
  <div className="p-3 flex-1">
    <h5 className="text-sm font-medium text-gray-900 truncate mb-1">
      {product.name}
    </h5>
    {product.description && (
      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
        {product.description}
      </p>
    )}
    {product.price && (
      <div className="text-sm font-semibold text-blue-600">
        {product.price} ₽
      </div>
    )}
  </div>
</div>
```

### 🎯 **Сетка товаров:**
```typescript
<div className={`grid gap-4 ${
  displaySettings.columns === 1 ? 'grid-cols-1' :
  displaySettings.columns === 2 ? 'grid-cols-2' :
  displaySettings.columns === 3 ? 'grid-cols-3' :
  'grid-cols-4'
}`}>
  {/* Карточки товаров */}
</div>
```

## API интеграция

### 📡 **Загрузка товаров:**
- **Endpoint**: `/api/catalog/products/filtered`
- **Method**: POST
- **Body**: 
  ```json
  {
    "categoryIds": ["category1", "category2"],
    "filters": {
      "propertyName": "propertyValue"
    },
    "limit": 12
  }
  ```

### 🔄 **Автоматическая загрузка:**
- Товары загружаются автоматически при выборе значения фильтра
- Количество товаров ограничивается настройкой `maxProducts`
- Загрузка происходит только если включена опция `showProductCards`

## Состояние и данные

### 📊 **Структура данных:**
```typescript
// Настройки отображения
const displaySettings: DisplaySettings = {
  showImages: true,           // Показывать изображения
  showCounts: true,          // Показывать количество
  cardLayout: 'vertical',    // Макет карточек
  columns: 3,                // Количество колонок
  showProductCards: true,    // Показывать карточки товаров
  maxProducts: 12,           // Максимальное количество товаров
  ...element.props.displaySettings
};

// Состояние товаров
const [products, setProducts] = useState<any[]>([]);
```

### 💾 **Сохранение настроек:**
- Настройки сохраняются в `element.props.displaySettings`
- Применяются автоматически при изменении
- Сохраняются между сессиями

## Преимущества

### ✅ **Для пользователей:**
1. **Гибкость**: Полный контроль над отображением
2. **Удобство**: Интуитивный интерфейс настройки
3. **Производительность**: Ограничение количества товаров
4. **Адаптивность**: Различные макеты для разных устройств

### ✅ **Для разработчиков:**
1. **Модульность**: Четкое разделение логики
2. **Расширяемость**: Легко добавить новые настройки
3. **Производительность**: Оптимизированная загрузка данных
4. **Поддержка**: Хорошо документированный код

## Примеры использования

### 🎨 **Настройка для мобильных устройств:**
- **Макет**: Вертикальные карточки
- **Колонки**: 1-2 колонки
- **Товары**: 6-12 товаров
- **Изображения**: Включены

### 🖥️ **Настройка для десктопа:**
- **Макет**: Вертикальные карточки
- **Колонки**: 3-4 колонки
- **Товары**: 24-48 товаров
- **Изображения**: Включены

### 📊 **Настройка для каталога:**
- **Макет**: Горизонтальные карточки
- **Колонки**: 1 колонка
- **Товары**: 12-24 товара
- **Изображения**: Включены

## Заключение

Добавлены мощные настройки отображения для PropertyFilter компонента, которые позволяют:

1. **Настраивать внешний вид** карточек товаров
2. **Контролировать количество** отображаемых товаров
3. **Выбирать макет** (вертикальный/горизонтальный)
4. **Настраивать сетку** (1-4 колонки)
5. **Включать/выключать** различные элементы

Эти настройки делают PropertyFilter более гибким и подходящим для различных сценариев использования, от мобильных устройств до полноценных каталогов товаров.

**Ключевые принципы:**
- **Гибкость**: Полный контроль над отображением
- **Производительность**: Ограничение количества товаров
- **Удобство**: Интуитивный интерфейс настройки
- **Адаптивность**: Различные макеты для разных устройств
