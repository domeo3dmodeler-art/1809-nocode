# Ручная настройка размера карточек

## Проблема

Пользователь сообщил: **"не работает нормально все равно"** и попросил **"сделай возможность указывать размер карточки вручную - всех сразу или по отдельности каждой"**.

## Решение

Добавлена полная система ручной настройки размера карточек с двумя уровнями контроля:

1. **Общий размер карточек** - настройка для всех карточек сразу
2. **Индивидуальный размер карточек** - настройка для каждой карточки отдельно

## Технические детали

### 🔧 **Обновлен интерфейс DisplaySettings:**

```typescript
interface DisplaySettings {
  // ... существующие настройки
  // Настройки размера карточек
  cardHeight: number; // Высота карточки в пикселях
  customCardHeight: boolean; // Использовать произвольную высоту
  individualCardHeights: { [key: string]: number }; // Индивидуальная высота для каждой карточки
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
  ...element.props.displaySettings
};
```

### 🔧 **Логика применения размера:**

#### **В PropertyFilter.tsx:**

**1. Grid контейнер использует общий размер:**
```typescript
<div 
  className="grid gap-3"
  style={{
    gridTemplateColumns: `repeat(${effectiveColumns}, 1fr)`,
    gridAutoRows: `${displaySettings.cardHeight}px` // Настраиваемая высота карточек
  }}
>
```

**2. Каждая карточка может иметь индивидуальный размер:**
```typescript
<div
  className="relative p-3 rounded-lg border cursor-pointer transition-all duration-200 w-full h-full flex flex-col"
  style={{
    height: displaySettings.individualCardHeights[option.value] 
      ? `${displaySettings.individualCardHeights[option.value]}px` 
      : `${displaySettings.cardHeight}px`
  }}
>
```

### 🔧 **UI для настройки размера:**

#### **В SimplifiedPropertyFilterPanel.tsx:**

**1. Общий размер карточек:**
```typescript
{/* Размер карточек */}
<div className="p-3 bg-gray-50 rounded-lg">
  <h5 className="text-sm font-medium text-gray-900 mb-3">Размер карточек</h5>
  
  {/* Переключатель произвольного размера */}
  <div className="flex items-center justify-between mb-3">
    <span className="text-sm text-gray-600">Произвольный размер</span>
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
```

**2. Индивидуальный размер карточек:**
```typescript
{/* Индивидуальная высота карточек */}
{element.props.propertyName && (
  <div className="p-3 bg-gray-50 rounded-lg">
    <h5 className="text-sm font-medium text-gray-900 mb-3">Индивидуальная высота карточек</h5>
    <p className="text-xs text-gray-500 mb-3">
      Настройте высоту для каждой опции свойства "{element.props.propertyName}"
    </p>
    
    <div className="space-y-3">
      {loading ? (
        <div className="text-center text-gray-500 py-4">
          <div className="text-sm">Загрузка опций свойства...</div>
        </div>
      ) : propertyOptions.length > 0 ? (
        <div className="space-y-3">
          {propertyOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
                {option.count !== undefined && (
                  <div className="text-xs text-gray-500">{option.count} товаров</div>
                )}
              </div>
              
              {/* Поле для высоты карточки */}
              <div className="flex items-center space-x-2">
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
                  className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">px</span>
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

### 🔄 **Приоритет размера карточек:**

1. **Индивидуальная высота** (высший приоритет)
   - Если для карточки задана индивидуальная высота в `individualCardHeights[option.value]`
   - Используется эта высота

2. **Общая высота** (низший приоритет)
   - Если индивидуальная высота не задана
   - Используется общая высота из `cardHeight`

### 🎯 **Режимы настройки:**

#### **1. Произвольный размер (customCardHeight: true):**
- Поле ввода для точного указания высоты в пикселях
- Диапазон: 80-300 пикселей
- Значение по умолчанию: 150px

#### **2. Предустановленные размеры (customCardHeight: false):**
- Кнопки с предустановленными размерами: 100px, 120px, 150px, 180px, 200px
- Быстрый выбор стандартных размеров

#### **3. Индивидуальные размеры:**
- Отдельное поле для каждой опции свойства
- Диапазон: 80-300 пикселей
- Переопределяет общий размер для конкретной карточки

## Преимущества решения

### ✅ **Для пользователей:**

1. **Полный контроль**: Можно настроить размер всех карточек или каждой отдельно
2. **Гибкость**: Выбор между произвольным размером и предустановленными значениями
3. **Индивидуальность**: Каждая карточка может иметь свой размер
4. **Простота**: Интуитивный интерфейс с понятными настройками

### ✅ **Для разработчиков:**

1. **Расширяемость**: Легко добавить новые режимы настройки
2. **Гибкость**: Поддержка как общих, так и индивидуальных настроек
3. **Надежность**: Проверка диапазонов и значений по умолчанию
4. **Поддержка**: Четкая логика приоритета размеров

## Результаты

### ✅ **Что добавлено:**

1. **✅ Общий размер карточек** - настройка для всех карточек сразу
2. **✅ Индивидуальный размер карточек** - настройка для каждой карточки отдельно
3. **✅ Произвольный размер** - поле ввода для точного указания высоты
4. **✅ Предустановленные размеры** - кнопки с стандартными размерами
5. **✅ Логика приоритета** - индивидуальный размер переопределяет общий

### 🎯 **Новое поведение:**

#### **1. Общий размер карточек:**
- ✅ Переключатель "Произвольный размер"
- ✅ Поле ввода для точного указания высоты (80-300px)
- ✅ Кнопки с предустановленными размерами (100px, 120px, 150px, 180px, 200px)
- ✅ Применяется ко всем карточкам по умолчанию

#### **2. Индивидуальный размер карточек:**
- ✅ Отдельное поле для каждой опции свойства
- ✅ Диапазон: 80-300 пикселей
- ✅ Переопределяет общий размер для конкретной карточки
- ✅ Загружается динамически после выбора свойства

#### **3. Логика приоритета:**
- ✅ Индивидуальная высота → Общая высота
- ✅ Четкая иерархия размеров
- ✅ Предсказуемое поведение

### 📱 **Пользовательский опыт:**

1. **Полный контроль**: Можно настроить размер всех карточек или каждой отдельно
2. **Гибкость**: Выбор между произвольным размером и предустановленными значениями
3. **Индивидуальность**: Каждая карточка может иметь свой размер
4. **Простота**: Интуитивный интерфейс с понятными настройками

## Использование

### 🔧 **Как настроить общий размер карточек:**

1. **Откройте настройки компонента** (правая панель)
2. **Перейдите на вкладку "Отображение"**
3. **Найдите секцию "Размер карточек"**
4. **Выберите режим:**
   - **Произвольный размер**: Введите точную высоту в пикселях
   - **Предустановленные размеры**: Выберите одну из кнопок (100px, 120px, 150px, 180px, 200px)

### 🔧 **Как настроить индивидуальный размер карточек:**

1. **Убедитесь, что выбрано свойство** (шаг 2)
2. **Найдите секцию "Индивидуальная высота карточек"**
3. **Для каждой опции свойства введите желаемую высоту**
4. **Индивидуальная высота переопределит общий размер**

### 🔧 **Логика приоритета:**

- **Если для карточки задана индивидуальная высота** → используется индивидуальная высота
- **Если индивидуальная высота не задана** → используется общий размер
- **Если общий размер не задан** → используется значение по умолчанию (150px)

## Заключение

Добавлена полная система ручной настройки размера карточек:

1. **✅ Общий размер карточек** - настройка для всех карточек сразу
2. **✅ Индивидуальный размер карточек** - настройка для каждой карточки отдельно
3. **✅ Произвольный размер** - поле ввода для точного указания высоты
4. **✅ Предустановленные размеры** - кнопки с стандартными размерами
5. **✅ Логика приоритета** - индивидуальный размер переопределяет общий

**Теперь пользователь имеет полный контроль над размером карточек!** 🚀

**Ключевые принципы решения:**
- **Гибкость**: Поддержка как общих, так и индивидуальных настроек
- **Контроль**: Полный контроль над размером каждой карточки
- **Простота**: Интуитивный интерфейс с понятными настройками
- **Приоритет**: Четкая логика приоритета размеров
- **Расширяемость**: Легко добавить новые режимы настройки
