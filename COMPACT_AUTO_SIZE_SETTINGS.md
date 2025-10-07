# Компактный блок настроек размеров с автоматическим расчетом

## Проблема

Пользователь указал: **"нужно сделать этот блок более компактным и добавить кнопку авто"**.

Также было требование: **"Если авто включено - размеры карточек устанавливаются автоматически исходя из размеров компонента - компонент меняется - карточки меняются - размер. Если авто выкл, то размеры настраиваются вручную"**.

## Решение

Добавлена компактная система настроек размеров карточек с автоматическим расчетом:

1. **Компактный интерфейс** - высота и ширина в одной строке
2. **Кнопка "Авто"** - переключение между автоматическим и ручным режимом
3. **Автоматический расчет** - размеры карточек рассчитываются на основе размеров компонента
4. **Реактивность** - при изменении размера компонента карточки автоматически адаптируются

## Технические детали

### 🔧 **Обновлен интерфейс DisplaySettings:**

```typescript
interface DisplaySettings {
  // ... существующие настройки
  // Настройки размера карточек
  autoSize: boolean; // Автоматический расчет размеров
  cardHeight: number; // Высота карточки в пикселях
  customCardHeight: boolean; // Использовать произвольную высоту
  individualCardHeights: { [key: string]: number }; // Индивидуальная высота для каждой карточки
  cardWidth: number; // Ширина карточки в пикселях
  customCardWidth: boolean; // Использовать произвольную ширину
  individualCardWidths: { [key: string]: number }; // Индивидуальная ширина для каждой карточки
}
```

### 🔧 **Значения по умолчанию:**

```typescript
const displaySettings: DisplaySettings = {
  // ... существующие настройки
  // Настройки размера карточек
  autoSize: true, // Автоматический расчет размеров по умолчанию
  cardHeight: 150, // Высота карточки по умолчанию
  customCardHeight: true, // Использовать произвольную высоту по умолчанию
  individualCardHeights: {}, // Индивидуальная высота для каждой карточки
  cardWidth: 200, // Ширина карточки по умолчанию
  customCardWidth: true, // Использовать произвольную ширину по умолчанию
  individualCardWidths: {}, // Индивидуальная ширина для каждой карточки
  ...element.props.displaySettings
};
```

### 🔧 **Автоматический расчет размеров:**

#### **В PropertyFilter.tsx:**

**1. Функция расчета оптимальных размеров:**
```typescript
// Автоматический расчет размеров карточек на основе размера компонента
const calculateOptimalCardSize = () => {
  const componentWidth = element.props.width || 400;
  const componentHeight = element.props.height || 300;
  
  // Рассчитываем оптимальную ширину карточки
  const gap = 12; // gap-3 = 12px
  const padding = 24; // p-3 = 12px с каждой стороны
  const availableWidth = componentWidth - padding;
  const cardWidth = Math.max(100, Math.min(300, Math.floor((availableWidth - (effectiveColumns - 1) * gap) / effectiveColumns)));
  
  // Рассчитываем оптимальную высоту карточки
  const availableHeight = componentHeight - 100; // Оставляем место для заголовка и других элементов
  const cardHeight = Math.max(80, Math.min(250, Math.floor(availableHeight / Math.ceil(options.length / effectiveColumns))));
  
  return { cardWidth, cardHeight };
};
```

**2. Определение эффективных размеров:**
```typescript
// Определяем эффективные размеры карточек
const effectiveCardSize = displaySettings.autoSize ? calculateOptimalCardSize() : { 
  cardWidth: displaySettings.cardWidth, 
  cardHeight: displaySettings.cardHeight 
};
```

**3. Применение эффективных размеров:**
```typescript
// Grid контейнер использует эффективные размеры
<div 
  className="grid gap-3"
  style={{
    gridTemplateColumns: `repeat(${effectiveColumns}, ${effectiveCardSize.cardWidth}px)`, // Эффективная ширина карточек
    gridAutoRows: `${effectiveCardSize.cardHeight}px` // Эффективная высота карточек
  }}
>

// Каждая карточка использует эффективные размеры
<div
  className="relative p-3 rounded-lg border cursor-pointer transition-all duration-200 w-full h-full flex flex-col"
  style={{
    height: displaySettings.individualCardHeights[option.value] 
      ? `${displaySettings.individualCardHeights[option.value]}px` 
      : `${effectiveCardSize.cardHeight}px`,
    width: displaySettings.individualCardWidths[option.value] 
      ? `${displaySettings.individualCardWidths[option.value]}px` 
      : `${effectiveCardSize.cardWidth}px`
  }}
>
```

### 🔧 **Компактный UI:**

#### **В SimplifiedPropertyFilterPanel.tsx:**

**1. Компактная секция "Размер карточек":**
```typescript
{/* Размер карточек */}
<div className="p-3 bg-gray-50 rounded-lg">
  <div className="flex items-center justify-between mb-3">
    <h5 className="text-sm font-medium text-gray-900">Размер карточек</h5>
    
    {/* Кнопка Авто */}
    <button
      onClick={() => handleDisplaySettingsChange({ autoSize: !displaySettings.autoSize })}
      className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
        displaySettings.autoSize
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
      }`}
    >
      {displaySettings.autoSize ? 'Авто' : 'Ручной'}
    </button>
  </div>
  
  {!displaySettings.autoSize && (
    <div className="space-y-3">
      {/* Высота и ширина в одной строке */}
      <div className="flex items-center space-x-3">
        {/* Высота */}
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-1 block">Высота</label>
          {displaySettings.customCardHeight ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="80"
                max="300"
                value={displaySettings.cardHeight}
                onChange={(e) => handleDisplaySettingsChange({ 
                  cardHeight: parseInt(e.target.value) || 150
                })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          ) : (
            <div className="flex space-x-1">
              {[100, 120, 150, 180, 200].map((height) => (
                <button
                  key={height}
                  onClick={() => handleDisplaySettingsChange({ cardHeight: height })}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    displaySettings.cardHeight === height
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {height}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Ширина */}
        <div className="flex-1">
          <label className="text-xs text-gray-600 mb-1 block">Ширина</label>
          {displaySettings.customCardWidth ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="100"
                max="400"
                value={displaySettings.cardWidth}
                onChange={(e) => handleDisplaySettingsChange({ 
                  cardWidth: parseInt(e.target.value) || 200
                })}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          ) : (
            <div className="flex space-x-1">
              {[150, 180, 200, 250, 300].map((width) => (
                <button
                  key={width}
                  onClick={() => handleDisplaySettingsChange({ cardWidth: width })}
                  className={`px-2 py-1 text-xs rounded border transition-colors ${
                    displaySettings.cardWidth === width
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {width}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Переключатели произвольных размеров */}
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={displaySettings.customCardHeight}
            onChange={(e) => handleDisplaySettingsChange({ customCardHeight: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-gray-600">Произвольная высота</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={displaySettings.customCardWidth}
            onChange={(e) => handleDisplaySettingsChange({ customCardWidth: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-gray-600">Произвольная ширина</span>
        </label>
      </div>
    </div>
  )}
  
  {displaySettings.autoSize && (
    <div className="text-xs text-gray-500 text-center py-2">
      Размеры карточек рассчитываются автоматически на основе размера компонента
    </div>
  )}
</div>
```

## Логика работы

### 🔄 **Режимы работы:**

#### **1. Автоматический режим (autoSize: true):**
- Размеры карточек рассчитываются автоматически на основе размеров компонента
- При изменении размера компонента карточки автоматически адаптируются
- Показывается информационное сообщение: "Размеры карточек рассчитываются автоматически на основе размера компонента"

#### **2. Ручной режим (autoSize: false):**
- Размеры карточек настраиваются вручную
- Доступны все настройки: произвольные размеры, предустановленные значения
- Показывается компактный интерфейс с настройками высоты и ширины

### 🎯 **Алгоритм автоматического расчета:**

#### **Расчет ширины карточки:**
1. Получаем ширину компонента (`element.props.width`)
2. Вычитаем отступы (`padding = 24px`)
3. Вычитаем промежутки между карточками (`gap = 12px * (количество колонок - 1)`)
4. Делим доступную ширину на количество колонок
5. Ограничиваем диапазоном 100-300px

#### **Расчет высоты карточки:**
1. Получаем высоту компонента (`element.props.height`)
2. Вычитаем место для заголовка и других элементов (`100px`)
3. Делим доступную высоту на количество строк
4. Ограничиваем диапазоном 80-250px

### 🔄 **Приоритет размеров:**

1. **Индивидуальные размеры** (высший приоритет)
   - Если для карточки заданы индивидуальные размеры в `individualCardHeights[option.value]` и `individualCardWidths[option.value]`
   - Используются эти размеры

2. **Эффективные размеры** (низший приоритет)
   - Если индивидуальные размеры не заданы
   - Используются эффективные размеры (автоматические или ручные)

## Преимущества решения

### ✅ **Для пользователей:**

1. **Компактность**: Высота и ширина настраиваются в одной строке
2. **Автоматизация**: Размеры карточек адаптируются к размеру компонента
3. **Гибкость**: Легкое переключение между автоматическим и ручным режимом
4. **Простота**: Интуитивный интерфейс с понятными настройками

### ✅ **Для разработчиков:**

1. **Реактивность**: Автоматическое обновление при изменении размеров компонента
2. **Оптимизация**: Умный расчет размеров с учетом отступов и промежутков
3. **Надежность**: Проверка диапазонов и значений по умолчанию
4. **Поддержка**: Четкая логика приоритета размеров

## Результаты

### ✅ **Что добавлено:**

1. **✅ Компактный интерфейс** - высота и ширина в одной строке
2. **✅ Кнопка "Авто"** - переключение между автоматическим и ручным режимом
3. **✅ Автоматический расчет** - размеры карточек рассчитываются на основе размеров компонента
4. **✅ Реактивность** - при изменении размера компонента карточки автоматически адаптируются

### 🎯 **Новое поведение:**

#### **1. Компактный интерфейс:**
- ✅ Высота и ширина настраиваются в одной строке
- ✅ Уменьшенные поля ввода (w-16 вместо w-20)
- ✅ Компактные кнопки предустановленных размеров
- ✅ Переключатели произвольных размеров в одной строке

#### **2. Кнопка "Авто":**
- ✅ Переключение между "Авто" и "Ручной" режимом
- ✅ Визуальная индикация активного режима
- ✅ Скрытие ручных настроек в автоматическом режиме
- ✅ Информационное сообщение в автоматическом режиме

#### **3. Автоматический расчет:**
- ✅ Расчет ширины карточки на основе ширины компонента
- ✅ Расчет высоты карточки на основе высоты компонента
- ✅ Учет отступов и промежутков между карточками
- ✅ Ограничение диапазонов (100-300px для ширины, 80-250px для высоты)

#### **4. Реактивность:**
- ✅ Автоматическое обновление при изменении размера компонента
- ✅ Пересчет размеров карточек в реальном времени
- ✅ Сохранение индивидуальных настроек при автоматическом режиме

### 📱 **Пользовательский опыт:**

1. **Компактность**: Высота и ширина настраиваются в одной строке
2. **Автоматизация**: Размеры карточек адаптируются к размеру компонента
3. **Гибкость**: Легкое переключение между автоматическим и ручным режимом
4. **Простота**: Интуитивный интерфейс с понятными настройками

## Использование

### 🔧 **Как использовать автоматический режим:**

1. **Откройте настройки компонента** (правая панель)
2. **Перейдите на вкладку "Отображение"**
3. **Найдите секцию "Размер карточек"**
4. **Нажмите кнопку "Авто"** (должна стать синей)
5. **Размеры карточек будут рассчитываться автоматически**

### 🔧 **Как использовать ручной режим:**

1. **Нажмите кнопку "Ручной"** в секции "Размер карточек"
2. **Настройте высоту и ширину** в одной строке
3. **Выберите режим настройки:**
   - **Произвольные размеры**: Введите точные значения в пикселях
   - **Предустановленные размеры**: Выберите из кнопок
4. **Используйте переключатели** для выбора режима настройки

### 🔧 **Логика приоритета:**

- **Если включен автоматический режим** → используются автоматически рассчитанные размеры
- **Если включен ручной режим** → используются настройки пользователя
- **Индивидуальные размеры** всегда переопределяют общие настройки

## Заключение

Добавлена компактная система настроек размеров карточек с автоматическим расчетом:

1. **✅ Компактный интерфейс** - высота и ширина в одной строке
2. **✅ Кнопка "Авто"** - переключение между автоматическим и ручным режимом
3. **✅ Автоматический расчет** - размеры карточек рассчитываются на основе размеров компонента
4. **✅ Реактивность** - при изменении размера компонента карточки автоматически адаптируются

**Теперь пользователь имеет компактный и умный интерфейс для настройки размеров карточек!** 🚀

**Ключевые принципы решения:**
- **Компактность**: Высота и ширина в одной строке
- **Автоматизация**: Умный расчет размеров на основе компонента
- **Реактивность**: Автоматическое обновление при изменении размеров
- **Гибкость**: Легкое переключение между режимами
- **Простота**: Интуитивный интерфейс с понятными настройками
