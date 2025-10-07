# АУДИТ PropertyFilter компонента для создания страниц в стиле скриншота

## Анализ требований по скриншоту

### 🎯 **Что нужно для создания страниц как на скриншоте:**

1. **Фильтр стилей** (левая панель):
   - 4 иконки дверей в виде простых контуров
   - Горизонтальное расположение
   - Выделение выбранного элемента синим цветом
   - Подписи под иконками
   - Компактные размеры карточек

2. **Карточка модели** (секция "Модели"):
   - Изображение сверху (плейсхолдер)
   - Два уровня текста снизу
   - Синее выделение выбранной карточки
   - Вертикальное расположение

3. **Общий стиль**:
   - Чистый минималистичный дизайн
   - Синие акценты для выбранных элементов
   - Белый фон с серыми границами
   - Компактные размеры

## Текущее состояние PropertyFilter

### ✅ **ЧТО УЖЕ ЕСТЬ И РАБОТАЕТ:**

#### **1. Настройки изображений:**
- ✅ `propertyCardImage` - общее изображение для всех карточек
- ✅ `individualImages` - индивидуальные изображения для каждой опции
- ✅ Поддержка SVG, PNG, JPG
- ✅ Приоритет: индивидуальные → общие → из базы данных

#### **2. Настройки размеров:**
- ✅ `cardWidth` и `cardHeight` - размеры карточек
- ✅ `autoSize` - автоматический расчет размеров
- ✅ `individualCardWidths` и `individualCardHeights` - индивидуальные размеры
- ✅ `customCardWidth` и `customCardHeight` - ручная настройка

#### **3. Настройки расположения:**
- ✅ `cardLayout: 'horizontal' | 'vertical'` - ориентация карточек
- ✅ `columns` - количество колонок
- ✅ `labelPosition: 'inside' | 'outside'` - позиция подписи

#### **4. Настройки отображения:**
- ✅ `componentTitle` - настраиваемый заголовок
- ✅ `showImages` - показ/скрытие изображений
- ✅ `showCounts` - показ количества товаров
- ✅ `maxElements` - ограничение количества элементов

#### **5. Система выделения:**
- ✅ Выделение выбранного элемента синим цветом
- ✅ Индикатор выбора (галочка)
- ✅ Hover эффекты

### ❌ **ЧТО ОТСУТСТВУЕТ И НУЖНО ДОБАВИТЬ:**

#### **1. Стилизация карточек:**
- ❌ **Отсутствует**: Настройка стиля границ карточек
- ❌ **Отсутствует**: Настройка скругления углов
- ❌ **Отсутствует**: Настройка теней
- ❌ **Отсутствует**: Настройка цветов фона

#### **2. Стилизация изображений:**
- ❌ **Отсутствует**: Настройка стиля изображений (контуры, заливка)
- ❌ **Отсутствует**: Фильтры для изображений
- ❌ **Отсутствует**: Настройка соотношения сторон изображений

#### **3. Стилизация текста:**
- ❌ **Отсутствует**: Настройка размера шрифта
- ❌ **Отсутствует**: Настройка цвета текста
- ❌ **Отсутствует**: Настройка жирности шрифта
- ❌ **Отсутствует**: Настройка выравнивания текста

#### **4. Стилизация выделения:**
- ❌ **Отсутствует**: Настройка цвета выделения
- ❌ **Отсутствует**: Настройка стиля выделения (рамка, фон, тень)
- ❌ **Отсутствует**: Настройка анимации выделения

#### **5. Компактность:**
- ❌ **Отсутствует**: Режим "компактный" для маленьких карточек
- ❌ **Отсутствует**: Настройка отступов между карточками
- ❌ **Отсутствует**: Настройка внутренних отступов карточек

## Детальный план доработки

### 🔧 **ЭТАП 1: Расширение DisplaySettings**

#### **Добавить в интерфейс DisplaySettings:**
```typescript
interface DisplaySettings {
  // ... существующие настройки ...
  
  // Стилизация карточек
  cardStyle: {
    borderColor: string;        // Цвет границы
    borderWidth: number;        // Толщина границы
    borderRadius: number;       // Скругление углов
    backgroundColor: string;     // Цвет фона
    shadowColor: string;        // Цвет тени
    shadowBlur: number;         // Размытие тени
    shadowOffset: number;        // Смещение тени
  };
  
  // Стилизация изображений
  imageStyle: {
    imageType: 'photo' | 'icon' | 'outline'; // Тип изображения
    imageFilter: string;        // CSS фильтр для изображений
    aspectRatio: string;        // Соотношение сторон
    objectFit: 'cover' | 'contain' | 'fill'; // Как изображение заполняет контейнер
  };
  
  // Стилизация текста
  textStyle: {
    fontSize: number;           // Размер шрифта
    fontWeight: 'normal' | 'bold' | 'light'; // Жирность
    textColor: string;         // Цвет текста
    textAlign: 'left' | 'center' | 'right'; // Выравнивание
  };
  
  // Стилизация выделения
  selectionStyle: {
    selectionColor: string;     // Цвет выделения
    selectionType: 'border' | 'background' | 'both'; // Тип выделения
    selectionAnimation: boolean; // Анимация выделения
  };
  
  // Компактность
  compactMode: boolean;        // Компактный режим
  cardSpacing: number;         // Отступы между карточками
  cardPadding: number;         // Внутренние отступы карточек
}
```

### 🔧 **ЭТАП 2: Обновление значений по умолчанию**

#### **Для стиля скриншота:**
```typescript
const defaultDisplaySettings: DisplaySettings = {
  // ... существующие настройки ...
  
  // Стилизация карточек (как на скриншоте)
  cardStyle: {
    borderColor: '#E5E7EB',     // Серая граница
    borderWidth: 1,              // Тонкая граница
    borderRadius: 8,            // Скругленные углы
    backgroundColor: '#FFFFFF',  // Белый фон
    shadowColor: 'transparent',  // Без тени
    shadowBlur: 0,
    shadowOffset: 0
  },
  
  // Стилизация изображений (контуры как на скриншоте)
  imageStyle: {
    imageType: 'outline',        // Контурный стиль
    imageFilter: 'none',         // Без фильтров
    aspectRatio: '1:1',         // Квадратные изображения
    objectFit: 'contain'        // Содержать в контейнере
  },
  
  // Стилизация текста (как на скриншоте)
  textStyle: {
    fontSize: 14,               // Средний размер
    fontWeight: 'normal',       // Обычный шрифт
    textColor: '#111827',       // Темно-серый текст
    textAlign: 'center'         // По центру
  },
  
  // Стилизация выделения (синий как на скриншоте)
  selectionStyle: {
    selectionColor: '#3B82F6',  // Синий цвет
    selectionType: 'both',       // Рамка и фон
    selectionAnimation: false    // Без анимации
  },
  
  // Компактность (как на скриншоте)
  compactMode: true,            // Компактный режим
  cardSpacing: 12,              // Отступы между карточками
  cardPadding: 8                // Внутренние отступы
};
```

### 🔧 **ЭТАП 3: Обновление рендеринга карточек**

#### **Новая структура карточки:**
```typescript
<div
  className={`relative cursor-pointer transition-all duration-200 ${
    selectedValue === option.value
      ? 'ring-2 ring-blue-500 bg-blue-50'  // Синее выделение
      : 'hover:shadow-sm'                   // Hover эффект
  }`}
  style={{
    // Размеры
    width: `${effectiveCardSize.cardWidth}px`,
    height: `${effectiveCardSize.cardHeight}px`,
    
    // Стилизация карточки
    borderColor: displaySettings.cardStyle.borderColor,
    borderWidth: `${displaySettings.cardStyle.borderWidth}px`,
    borderRadius: `${displaySettings.cardStyle.borderRadius}px`,
    backgroundColor: displaySettings.cardStyle.backgroundColor,
    boxShadow: displaySettings.cardStyle.shadowColor !== 'transparent' 
      ? `${displaySettings.cardStyle.shadowOffset}px ${displaySettings.cardStyle.shadowOffset}px ${displaySettings.cardStyle.shadowBlur}px ${displaySettings.cardStyle.shadowColor}`
      : 'none',
    
    // Отступы
    padding: `${displaySettings.cardPadding}px`,
    margin: `${displaySettings.cardSpacing / 2}px`,
    
    // Компактность
    ...(displaySettings.compactMode && {
      padding: `${displaySettings.cardPadding / 2}px`,
      margin: `${displaySettings.cardSpacing / 4}px`
    })
  }}
>
  {/* Изображение с настройками стиля */}
  <div className="image-container">
    <img
      src={imageSrc}
      alt={option.label}
      style={{
        width: '100%',
        height: '100%',
        objectFit: displaySettings.imageStyle.objectFit,
        aspectRatio: displaySettings.imageStyle.aspectRatio,
        filter: displaySettings.imageStyle.imageFilter
      }}
      className={`${
        displaySettings.imageStyle.imageType === 'outline' 
          ? 'outline-style' 
          : 'photo-style'
      }`}
    />
  </div>
  
  {/* Текст с настройками стиля */}
  <div
    className="text-container"
    style={{
      fontSize: `${displaySettings.textStyle.fontSize}px`,
      fontWeight: displaySettings.textStyle.fontWeight,
      color: displaySettings.textStyle.textColor,
      textAlign: displaySettings.textStyle.textAlign
    }}
  >
    {option.label}
  </div>
</div>
```

### 🔧 **ЭТАП 4: Обновление UI панели настроек**

#### **Новые секции в SimplifiedPropertyFilterPanel:**

1. **Стилизация карточек**
2. **Стилизация изображений**
3. **Стилизация текста**
4. **Стилизация выделения**
5. **Компактность**

## Приоритеты доработки

### 🚀 **ВЫСОКИЙ ПРИОРИТЕТ (для скриншота):**

1. **Стилизация выделения** - синий цвет как на скриншоте
2. **Компактный режим** - маленькие карточки как на скриншоте
3. **Стилизация изображений** - контурный стиль как на скриншоте
4. **Настройка отступов** - точные размеры как на скриншоте

### 🔧 **СРЕДНИЙ ПРИОРИТЕТ:**

1. **Стилизация карточек** - границы и скругления
2. **Стилизация текста** - размер и цвет шрифта
3. **Предустановки стилей** - быстрая настройка "как на скриншоте"

### 📋 **НИЗКИЙ ПРИОРИТЕТ:**

1. **Анимации** - плавные переходы
2. **Расширенные фильтры** - для изображений
3. **Темы** - готовые цветовые схемы

## Заключение

### 🎯 **Текущее состояние:**
- **PropertyFilter на 70% готов** для создания страниц как на скриншоте
- **Основная функциональность есть** - изображения, размеры, расположение
- **Нужны стилистические доработки** - цвета, отступы, компактность

### 🚀 **План действий:**
1. **Добавить стилистические настройки** в DisplaySettings
2. **Обновить рендеринг карточек** с новыми стилями
3. **Создать предустановку "Скриншот"** для быстрой настройки
4. **Протестировать на реальных данных**

**Готовы начать с высокоприоритетных доработок?**
