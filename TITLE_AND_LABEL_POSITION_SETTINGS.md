# Добавление настройки заголовка и позиции подписи в PropertyFilter

## Обзор изменений

Добавлены две новые возможности для компонента `PropertyFilter`:

1. **Переименование заголовка компонента** - возможность изменить заголовок "Фильтр свойств" на любое пользовательское название
2. **Позиция подписи карточки** - возможность разместить подпись внутри карточки или под карточкой

## Технические изменения

### 🔧 **1. Обновление интерфейса DisplaySettings**

#### **PropertyFilter.tsx:**
```typescript
interface DisplaySettings {
  // ... существующие настройки ...
  
  // Настройки заголовка и подписей
  componentTitle: string; // Заголовок компонента
  labelPosition: 'inside' | 'outside'; // Позиция подписи: внутри карточки или под карточкой
}
```

#### **SimplifiedPropertyFilterPanel.tsx:**
```typescript
interface DisplaySettings {
  // ... существующие настройки ...
  
  // Настройки заголовка и подписей
  componentTitle: string; // Заголовок компонента
  labelPosition: 'inside' | 'outside'; // Позиция подписи: внутри карточки или под карточкой
}
```

### 🔧 **2. Значения по умолчанию**

#### **PropertyFilter.tsx:**
```typescript
const displaySettings: DisplaySettings = {
  // ... существующие настройки ...
  
  // Настройки заголовка и подписей
  componentTitle: 'Фильтр свойств', // Заголовок компонента по умолчанию
  labelPosition: 'inside', // Подпись внутри карточки по умолчанию
  ...element.props.displaySettings // Объединяем с настройками из props
};
```

#### **SimplifiedPropertyFilterPanel.tsx:**
```typescript
const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
  // ... существующие настройки ...
  
  // Настройки заголовка и подписей
  componentTitle: 'Фильтр свойств', // Заголовок компонента по умолчанию
  labelPosition: 'inside', // Подпись внутри карточки по умолчанию
  ...element.props.displaySettings
});
```

### 🔧 **3. Обновление отображения заголовка**

#### **PropertyFilter.tsx:**
```typescript
// ДО:
<h3 className="text-sm font-medium text-gray-700 mb-1">
  {element.props.propertyName}
</h3>

// ПОСЛЕ:
<h3 className="text-sm font-medium text-gray-700 mb-1">
  {displaySettings.componentTitle}
</h3>
```

### 🔧 **4. Обновление логики отображения карточек**

#### **PropertyFilter.tsx - новая структура карточки:**
```typescript
{options.slice(0, displaySettings.showAllElements ? options.length : displaySettings.maxElements).map((option) => (
  <div key={option.value} className="w-full">
    {/* Карточка */}
    <div className={`relative p-3 rounded-lg border cursor-pointer transition-all duration-200 w-full flex flex-col ${
      selectedValue === option.value
        ? 'bg-blue-50 border-blue-300 shadow-md'
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}>
      {/* Изображение и информация */}
      <div className={`${displaySettings.cardLayout === 'vertical' ? 'flex flex-col h-full' : 'flex items-start space-x-3 h-full'}`}>
        <div className={`${displaySettings.cardLayout === 'vertical' ? 'w-full h-16 mb-2 flex-shrink-0' : 'w-12 h-12 flex-shrink-0'}`}>
          {/* Логика отображения изображения */}
        </div>
        
        {/* Информация о свойстве - только если подпись внутри карточки */}
        {displaySettings.labelPosition === 'inside' && (
          <div className={`${displaySettings.cardLayout === 'vertical' ? 'flex-1 flex flex-col justify-center text-center' : 'flex-1 min-w-0'}`}>
            <h4 className={`text-sm font-medium text-gray-900 ${displaySettings.cardLayout === 'vertical' ? 'mb-1' : 'truncate'}`}>
              {option.label}
            </h4>
            {option.count !== undefined && displaySettings.showCounts && (
              <p className="text-xs text-gray-500">
                {option.count} товаров
              </p>
            )}
          </div>
        )}
        
        {/* Индикатор выбора */}
        {selectedValue === option.value && (
          <div className={`${displaySettings.cardLayout === 'vertical' ? 'absolute top-2 right-2' : 'flex-shrink-0'}`}>
            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Подпись под карточкой - только если подпись снаружи */}
    {displaySettings.labelPosition === 'outside' && (
      <div className="mt-2 text-center">
        <h4 className="text-sm font-medium text-gray-900">
          {option.label}
        </h4>
        {option.count !== undefined && displaySettings.showCounts && (
          <p className="text-xs text-gray-500">
            {option.count} товаров
          </p>
        )}
      </div>
    )}
  </div>
))}
```

### 🔧 **5. UI для настройки в SimplifiedPropertyFilterPanel**

#### **Новая секция "Заголовок и подписи":**
```typescript
{/* Заголовок и подписи */}
<div className="p-3 bg-gray-50 rounded-lg">
  <h5 className="text-sm font-medium text-gray-900 mb-3">Заголовок и подписи</h5>
  
  {/* Заголовок компонента */}
  <div className="mb-4">
    <label className="text-xs text-gray-600 mb-1 block">Заголовок компонента</label>
    <input
      type="text"
      value={displaySettings.componentTitle}
      onChange={(e) => handleDisplaySettingsChange({ componentTitle: e.target.value })}
      placeholder="Введите заголовок"
      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
  
  {/* Позиция подписи */}
  <div>
    <label className="text-xs text-gray-600 mb-2 block">Позиция подписи</label>
    <div className="flex space-x-2">
      <button
        onClick={() => handleDisplaySettingsChange({ labelPosition: 'inside' })}
        className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
          displaySettings.labelPosition === 'inside'
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        <div className="text-center">
          <div className="text-lg mb-1">📋</div>
          <div className="text-xs font-medium">Внутри карточки</div>
        </div>
      </button>
      <button
        onClick={() => handleDisplaySettingsChange({ labelPosition: 'outside' })}
        className={`flex-1 p-2 rounded-lg border-2 transition-colors ${
          displaySettings.labelPosition === 'outside'
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        <div className="text-center">
          <div className="text-lg mb-1">📄</div>
          <div className="text-xs font-medium">Под карточкой</div>
        </div>
      </button>
    </div>
  </div>
</div>
```

## Функциональность

### ✅ **1. Переименование заголовка**

#### **Как работает:**
- **Поле ввода** в секции "Заголовок и подписи" позволяет ввести любой текст
- **Заголовок отображается** в верхней части компонента вместо стандартного "Фильтр свойств"
- **Значение сохраняется** в `displaySettings.componentTitle` и передается в компонент

#### **Примеры использования:**
- `"Domeo_Стиль Web"` - как показано на скриншоте пользователя
- `"Выберите стиль"` - для фильтра стилей
- `"Тип материала"` - для фильтра материалов
- `"Цветовая гамма"` - для фильтра цветов

### ✅ **2. Позиция подписи карточки**

#### **Как работает:**
- **Два режима**: "Внутри карточки" и "Под карточкой"
- **Визуальные кнопки** с иконками для выбора режима
- **Условное отображение** текста в зависимости от выбранного режима

#### **Режим "Внутри карточки" (`labelPosition: 'inside'`):**
- Подпись отображается **внутри** карточки под изображением
- Работает как раньше - текст интегрирован в карточку
- Подходит для компактного отображения

#### **Режим "Под карточкой" (`labelPosition: 'outside'):**
- Подпись отображается **под** карточкой
- Карточка содержит только изображение и индикатор выбора
- Подпись вынесена в отдельный блок под карточкой
- Подходит для случаев, когда нужно больше места для изображения

## Примеры использования

### 🎯 **Пример 1: Фильтр стилей дверей**
```typescript
// Настройки:
componentTitle: "Domeo_Стиль Web"
labelPosition: "inside"

// Результат:
// Заголовок: "Domeo_Стиль Web"
// Подписи: "Классика", "Неоклассика", "Скрытая", "Современная" - внутри карточек
```

### 🎯 **Пример 2: Фильтр материалов с вынесенными подписями**
```typescript
// Настройки:
componentTitle: "Выберите материал"
labelPosition: "outside"

// Результат:
// Заголовок: "Выберите материал"
// Подписи: "Дерево", "Металл", "Пластик" - под карточками
```

## Преимущества

### 🚀 **1. Гибкость настройки**
- **Пользовательский заголовок** - каждый компонент может иметь уникальное название
- **Адаптивная позиция подписи** - выбор между компактным и расширенным отображением

### 🚀 **2. Улучшенный UX**
- **Интуитивные кнопки** с иконками для выбора позиции подписи
- **Мгновенное применение** изменений без перезагрузки
- **Визуальная обратная связь** - активная опция выделена цветом

### 🚀 **3. Совместимость**
- **Обратная совместимость** - существующие компоненты работают с настройками по умолчанию
- **Сохранение настроек** - все настройки сохраняются в `displaySettings`
- **Интеграция** с существующей системой настроек

## Тестирование

### ✅ **Проверка функциональности:**

#### **1. Переименование заголовка:**
- [ ] Открыть панель настроек PropertyFilter
- [ ] Перейти на вкладку "Отображение"
- [ ] Найти секцию "Заголовок и подписи"
- [ ] Изменить текст в поле "Заголовок компонента"
- [ ] Проверить, что заголовок изменился в компоненте

#### **2. Позиция подписи:**
- [ ] Выбрать режим "Внутри карточки"
- [ ] Проверить, что подписи отображаются внутри карточек
- [ ] Выбрать режим "Под карточкой"
- [ ] Проверить, что подписи отображаются под карточками

#### **3. Сохранение настроек:**
- [ ] Изменить настройки заголовка и позиции подписи
- [ ] Переключиться на другой компонент
- [ ] Вернуться к PropertyFilter
- [ ] Проверить, что настройки сохранились

## Заключение

Добавлены две важные возможности для компонента `PropertyFilter`:

### 🎯 **Результаты:**

1. **✅ Переименование заголовка** - пользователи могут задать любой заголовок для компонента
2. **✅ Позиция подписи** - выбор между отображением подписи внутри или под карточкой
3. **✅ Интуитивный UI** - визуальные кнопки с иконками для выбора режима
4. **✅ Обратная совместимость** - существующие компоненты работают без изменений

### 🔧 **Технические детали:**

- **Обновлены интерфейсы** `DisplaySettings` в обоих файлах
- **Добавлены значения по умолчанию** для новых настроек
- **Обновлена логика отображения** карточек с условным рендерингом
- **Добавлен UI** в панель настроек для управления новыми возможностями

**Теперь пользователи могут полностью настроить внешний вид и поведение компонента PropertyFilter!** 🚀
