# Регулировка ширины карточек

## Проблема

Пользователь указал: **"это регулировка высоты, нужно добавить еще и регулировку ширины карточки"**.

Ранее была добавлена только регулировка высоты карточек, но отсутствовала возможность настройки ширины.

## Решение

Добавлена полная система регулировки ширины карточек с двумя уровнями контроля:

1. **Общая ширина карточек** - настройка для всех карточек сразу
2. **Индивидуальная ширина карточек** - настройка для каждой карточки отдельно

## Технические детали

### 🔧 **Обновлен интерфейс DisplaySettings:**

```typescript
interface DisplaySettings {
  // ... существующие настройки
  // Настройки размера карточек
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
  cardHeight: 150, // Высота карточки по умолчанию
  customCardHeight: true, // Использовать произвольную высоту по умолчанию
  individualCardHeights: {}, // Индивидуальная высота для каждой карточки
  cardWidth: 200, // Ширина карточки по умолчанию
  customCardWidth: true, // Использовать произвольную ширину по умолчанию
  individualCardWidths: {}, // Индивидуальная ширина для каждой карточки
  ...element.props.displaySettings
};
```

### 🔧 **Логика применения размеров:**

#### **В PropertyFilter.tsx:**

**1. Grid контейнер использует настраиваемые размеры:**
```typescript
<div 
  className="grid gap-3"
  style={{
    gridTemplateColumns: `repeat(${effectiveColumns}, ${displaySettings.cardWidth}px)`, // Настраиваемая ширина карточек
    gridAutoRows: `${displaySettings.cardHeight}px` // Настраиваемая высота карточек
  }}
>
```

**2. Каждая карточка может иметь индивидуальные размеры:**
```typescript
<div
  className="relative p-3 rounded-lg border cursor-pointer transition-all duration-200 w-full h-full flex flex-col"
  style={{
    height: displaySettings.individualCardHeights[option.value] 
      ? `${displaySettings.individualCardHeights[option.value]}px` 
      : `${displaySettings.cardHeight}px`,
    width: displaySettings.individualCardWidths[option.value] 
      ? `${displaySettings.individualCardWidths[option.value]}px` 
      : `${displaySettings.cardWidth}px`
  }}
>
```

### 🔧 **UI для настройки размеров:**

#### **В SimplifiedPropertyFilterPanel.tsx:**

**1. Обновленная секция "Размер карточек":**
```typescript
{/* Размер карточек */}
<div className="p-3 bg-gray-50 rounded-lg">
  <h5 className="text-sm font-medium text-gray-900 mb-3">Размер карточек</h5>
  
  {/* Высота карточек */}
  <div className="mb-4">
    <h6 className="text-sm font-medium text-gray-800 mb-2">Высота карточек</h6>
    
    {/* Переключатель произвольной высоты */}
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-600">Произвольная высота</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={displaySettings.customCardHeight}
          onChange={(e) => handleDisplaySettingsChange({ customCardHeight: e.target.checked })}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>

    {displaySettings.customCardHeight ? (
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="80"
          max="300"
          value={displaySettings.cardHeight}
          onChange={(e) => handleDisplaySettingsChange({ 
            cardHeight: parseInt(e.target.value) || 150
          })}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">пикселей</span>
      </div>
    ) : (
      <div className="flex space-x-2">
        {[100, 120, 150, 180, 200].map((height) => (
          <button
            key={height}
            onClick={() => handleDisplaySettingsChange({ cardHeight: height })}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              displaySettings.cardHeight === height
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {height}px
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Ширина карточек */}
  <div>
    <h6 className="text-sm font-medium text-gray-800 mb-2">Ширина карточек</h6>
    
    {/* Переключатель произвольной ширины */}
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-600">Произвольная ширина</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={displaySettings.customCardWidth}
          onChange={(e) => handleDisplaySettingsChange({ customCardWidth: e.target.checked })}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>

    {displaySettings.customCardWidth ? (
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="100"
          max="400"
          value={displaySettings.cardWidth}
          onChange={(e) => handleDisplaySettingsChange({ 
            cardWidth: parseInt(e.target.value) || 200
          })}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-600">пикселей</span>
      </div>
    ) : (
      <div className="flex space-x-2">
        {[150, 180, 200, 250, 300].map((width) => (
          <button
            key={width}
            onClick={() => handleDisplaySettingsChange({ cardWidth: width })}
            className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
              displaySettings.cardWidth === width
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {width}px
          </button>
        ))}
      </div>
    )}
  </div>
</div>
```

**2. Обновленная секция "Индивидуальные размеры карточек":**
```typescript
{/* Индивидуальные размеры карточек */}
{element.props.propertyName && (
  <div className="p-3 bg-gray-50 rounded-lg">
    <h5 className="text-sm font-medium text-gray-900 mb-3">Индивидуальные размеры карточек</h5>
    <p className="text-xs text-gray-500 mb-3">
      Настройте высоту и ширину для каждой опции свойства "{element.props.propertyName}"
    </p>
    
    <div className="space-y-3">
      {propertyOptions.length > 0 ? (
        <div className="space-y-3">
          {propertyOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
                {option.count !== undefined && (
                  <div className="text-xs text-gray-500">{option.count} товаров</div>
                )}
              </div>
              
              {/* Поля для размеров карточки */}
              <div className="flex items-center space-x-2">
                {/* Высота */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">В:</span>
                  <input
                    type="number"
                    min="80"
                    max="300"
                    placeholder="Высота"
                    value={displaySettings.individualCardHeights[option.value] || ''}
                    onChange={(e) => {
                      const newIndividualHeights = { ...displaySettings.individualCardHeights };
                      if (e.target.value) {
                        newIndividualHeights[option.value] = parseInt(e.target.value) || 150;
                      } else {
                        delete newIndividualHeights[option.value];
                      }
                      handleDisplaySettingsChange({ individualCardHeights: newIndividualHeights });
                    }}
                    className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                {/* Ширина */}
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Ш:</span>
                  <input
                    type="number"
                    min="100"
                    max="400"
                    placeholder="Ширина"
                    value={displaySettings.individualCardWidths[option.value] || ''}
                    onChange={(e) => {
                      const newIndividualWidths = { ...displaySettings.individualCardWidths };
                      if (e.target.value) {
                        newIndividualWidths[option.value] = parseInt(e.target.value) || 200;
                      } else {
                        delete newIndividualWidths[option.value];
                      }
                      handleDisplaySettingsChange({ individualCardWidths: newIndividualWidths });
                    }}
                    className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Опции свойства будут загружены после выбора свойства на шаге 2
          </p>
        </div>
      )}
    </div>
  </div>
)}
```

## Логика работы

### 🔄 **Приоритет размеров карточек:**

1. **Индивидуальные размеры** (высший приоритет)
   - Если для карточки заданы индивидуальные размеры в `individualCardHeights[option.value]` и `individualCardWidths[option.value]`
   - Используются эти размеры

2. **Общие размеры** (низший приоритет)
   - Если индивидуальные размеры не заданы
   - Используются общие размеры из `cardHeight` и `cardWidth`

### 🎯 **Режимы настройки:**

#### **1. Произвольные размеры:**
- **Высота**: Поле ввода для точного указания высоты (80-300px)
- **Ширина**: Поле ввода для точного указания ширины (100-400px)
- Значения по умолчанию: 150px (высота), 200px (ширина)

#### **2. Предустановленные размеры:**
- **Высота**: Кнопки с предустановленными размерами (100px, 120px, 150px, 180px, 200px)
- **Ширина**: Кнопки с предустановленными размерами (150px, 180px, 200px, 250px, 300px)
- Быстрый выбор стандартных размеров

#### **3. Индивидуальные размеры:**
- Отдельные поля для высоты и ширины каждой опции свойства
- Диапазон высоты: 80-300 пикселей
- Диапазон ширины: 100-400 пикселей
- Переопределяют общие размеры для конкретной карточки

## Преимущества решения

### ✅ **Для пользователей:**

1. **Полный контроль**: Можно настроить как высоту, так и ширину всех карточек или каждой отдельно
2. **Гибкость**: Выбор между произвольными размерами и предустановленными значениями
3. **Индивидуальность**: Каждая карточка может иметь свои размеры
4. **Простота**: Интуитивный интерфейс с понятными настройками

### ✅ **Для разработчиков:**

1. **Расширяемость**: Легко добавить новые режимы настройки
2. **Гибкость**: Поддержка как общих, так и индивидуальных настроек
3. **Надежность**: Проверка диапазонов и значений по умолчанию
4. **Поддержка**: Четкая логика приоритета размеров

## Результаты

### ✅ **Что добавлено:**

1. **✅ Общая ширина карточек** - настройка для всех карточек сразу
2. **✅ Индивидуальная ширина карточек** - настройка для каждой карточки отдельно
3. **✅ Произвольная ширина** - поле ввода для точного указания ширины
4. **✅ Предустановленные размеры ширины** - кнопки с стандартными размерами
5. **✅ Обновленный UI** - разделение на высоту и ширину

### 🎯 **Новое поведение:**

#### **1. Общие размеры карточек:**
- ✅ Отдельные настройки для высоты и ширины
- ✅ Переключатели "Произвольная высота" и "Произвольная ширина"
- ✅ Поля ввода для точного указания размеров (80-300px для высоты, 100-400px для ширины)
- ✅ Кнопки с предустановленными размерами
- ✅ Применяются ко всем карточкам по умолчанию

#### **2. Индивидуальные размеры карточек:**
- ✅ Отдельные поля для высоты и ширины каждой опции свойства
- ✅ Диапазон высоты: 80-300 пикселей
- ✅ Диапазон ширины: 100-400 пикселей
- ✅ Переопределяют общие размеры для конкретной карточки
- ✅ Загружается динамически после выбора свойства

#### **3. Логика приоритета:**
- ✅ Индивидуальные размеры → Общие размеры
- ✅ Четкая иерархия размеров
- ✅ Предсказуемое поведение

### 📱 **Пользовательский опыт:**

1. **Полный контроль**: Можно настроить как высоту, так и ширину всех карточек или каждой отдельно
2. **Гибкость**: Выбор между произвольными размерами и предустановленными значениями
3. **Индивидуальность**: Каждая карточка может иметь свои размеры
4. **Простота**: Интуитивный интерфейс с понятными настройками

## Использование

### 🔧 **Как настроить общие размеры карточек:**

1. **Откройте настройки компонента** (правая панель)
2. **Перейдите на вкладку "Отображение"**
3. **Найдите секцию "Размер карточек"**
4. **Настройте высоту:**
   - **Произвольная высота**: Введите точную высоту в пикселях (80-300px)
   - **Предустановленные размеры**: Выберите одну из кнопок (100px, 120px, 150px, 180px, 200px)
5. **Настройте ширину:**
   - **Произвольная ширина**: Введите точную ширину в пикселях (100-400px)
   - **Предустановленные размеры**: Выберите одну из кнопок (150px, 180px, 200px, 250px, 300px)

### 🔧 **Как настроить индивидуальные размеры карточек:**

1. **Убедитесь, что выбрано свойство** (шаг 2)
2. **Найдите секцию "Индивидуальные размеры карточек"**
3. **Для каждой опции свойства:**
   - **Введите желаемую высоту** в поле "В:" (80-300px)
   - **Введите желаемую ширину** в поле "Ш:" (100-400px)
4. **Индивидуальные размеры переопределят общие размеры**

### 🔧 **Логика приоритета:**

- **Если для карточки заданы индивидуальные размеры** → используются индивидуальные размеры
- **Если индивидуальные размеры не заданы** → используются общие размеры
- **Если общие размеры не заданы** → используются значения по умолчанию (150px высота, 200px ширина)

## Заключение

Добавлена полная система регулировки ширины карточек:

1. **✅ Общая ширина карточек** - настройка для всех карточек сразу
2. **✅ Индивидуальная ширина карточек** - настройка для каждой карточки отдельно
3. **✅ Произвольная ширина** - поле ввода для точного указания ширины
4. **✅ Предустановленные размеры ширины** - кнопки с стандартными размерами
5. **✅ Обновленный UI** - разделение на высоту и ширину

**Теперь пользователь имеет полный контроль над размерами карточек!** 🚀

**Ключевые принципы решения:**
- **Полнота**: Поддержка как высоты, так и ширины карточек
- **Гибкость**: Поддержка как общих, так и индивидуальных настроек
- **Контроль**: Полный контроль над размерами каждой карточки
- **Простота**: Интуитивный интерфейс с понятными настройками
- **Приоритет**: Четкая логика приоритета размеров
