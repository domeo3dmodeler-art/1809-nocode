# 📋 Отображение шаблонов загрузки на странице каталога

## ✅ **Функциональность добавлена!**

### 🎯 **Задача:**
Добавить отображение шаблонов загрузки на страницу каталога товаров (`http://localhost:3000/admin/catalog`), чтобы у каждой категории был виден свой шаблон.

### 🛠️ **Что было реализовано:**

#### **1. Добавлены новые состояния:**
```typescript
const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
const [templateLoading, setTemplateLoading] = useState(false);
```

#### **2. Создана функция загрузки шаблона:**
```typescript
const loadTemplate = async (categoryId: string) => {
  try {
    setTemplateLoading(true);
    const response = await fetch(`/api/admin/import-templates?catalog_category_id=${categoryId}`);
    const data = await response.json();
    
    if (data.success && data.templates && data.templates.length > 0) {
      setSelectedTemplate(data.templates[0]); // Берем первый шаблон для категории
    } else {
      setSelectedTemplate(null);
    }
  } catch (error) {
    console.error('Error loading template:', error);
    setSelectedTemplate(null);
  } finally {
    setTemplateLoading(false);
  }
};
```

#### **3. Обновлена функция выбора категории:**
```typescript
const handleCategorySelect = (category: CatalogCategory) => {
  setSelectedCategory(category);
  setSelectedTemplate(null); // Сбрасываем шаблон
  if (category.id) {
    loadTemplate(category.id);
  }
};
```

#### **4. Добавлен UI блок для отображения шаблона:**
```typescript
{/* Шаблон загрузки для выбранной категории */}
{selectedCategory && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-green-600" />
        <h3 className="font-medium text-green-900">Шаблон загрузки</h3>
      </div>
      {templateLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
      )}
    </div>
    
    {/* Контент шаблона */}
  </div>
)}
```

### 🎨 **Дизайн отображения шаблона:**

#### **1. Цветовая схема:**
- ✅ **Зеленый фон** (`bg-green-50`) для блока шаблона
- ✅ **Зеленая рамка** (`border-green-200`) для контраста
- ✅ **Зеленые иконки** (`text-green-600`) для акцентов
- ✅ **Зеленый текст** (`text-green-900`, `text-green-700`) для информации

#### **2. Структура блока:**
```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ Шаблон загрузки                    [Загрузка...] │
├─────────────────────────────────────────────────────────┤
│  Название шаблона                          [Активен] │
│  Описание шаблона (если есть)                          │
│                                                         │
│  Обязательные поля: [поле1] [поле2] [поле3]            │
│  Поля маппинга: 5 полей                                │
│                                                         │
│  ──────────────────────────────────────────────────────│
│  [Редактировать] [Скачать шаблон]                      │
└─────────────────────────────────────────────────────────┘
```

#### **3. Состояния отображения:**

##### **Загрузка шаблона:**
```typescript
{templateLoading ? (
  <div className="text-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
    <p className="text-sm text-green-700">Загрузка шаблона...</p>
  </div>
) : /* остальные состояния */}
```

##### **Шаблон найден:**
```typescript
selectedTemplate ? (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-medium text-green-900">{selectedTemplate.name}</h4>
        {selectedTemplate.description && (
          <p className="text-sm text-green-700 mt-1">{selectedTemplate.description}</p>
        )}
      </div>
      <Badge variant="outline" className="text-green-600 border-green-300">
        Активен
      </Badge>
    </div>
    
    {/* Информация о полях и маппинге */}
    
    {/* Кнопки действий */}
  </div>
) : /* шаблон не найден */}
```

##### **Шаблон не найден:**
```typescript
: (
  <div className="text-center py-4">
    <Package className="h-8 w-8 text-green-300 mx-auto mb-2" />
    <p className="text-sm text-green-700 mb-3">Шаблон загрузки не настроен</p>
    <Button
      variant="outline"
      size="sm"
      className="text-green-600 border-green-300 hover:bg-green-100"
    >
      <Plus className="h-3 w-3 mr-1" />
      Создать шаблон
    </Button>
  </div>
)
```

### 📊 **Информация о шаблоне:**

#### **1. Основная информация:**
- ✅ **Название шаблона** - отображается крупным шрифтом
- ✅ **Описание** - отображается под названием (если есть)
- ✅ **Статус** - "Активен" в виде badge

#### **2. Техническая информация:**
- ✅ **Обязательные поля** - отображаются как badges
- ✅ **Количество полей маппинга** - показывает сколько полей настроено
- ✅ **Валидация данных** - правила валидации (можно расширить)

#### **3. Действия:**
- ✅ **Редактировать** - кнопка для редактирования шаблона
- ✅ **Скачать шаблон** - кнопка для скачивания шаблона Excel
- ✅ **Создать шаблон** - кнопка для создания нового шаблона

### 🔄 **Логика работы:**

#### **1. Выбор категории:**
```
Пользователь кликает на категорию → Загрузка шаблона → Отображение информации
```

#### **2. Загрузка шаблона:**
```
API запрос → Получение шаблонов для категории → Отображение первого шаблона
```

#### **3. Отображение состояний:**
```
Загрузка → Спиннер + "Загрузка шаблона..."
Шаблон найден → Информация о шаблоне + кнопки действий
Шаблон не найден → "Не настроен" + кнопка "Создать шаблон"
```

### 🚀 **URL для тестирования:**
```
http://localhost:3000/admin/catalog
```

### 📋 **Как протестировать:**

#### **Тест 1: Отображение шаблона**
1. **Откройте** страницу каталога
2. **Выберите любую категорию** из дерева
3. **Результат**: 
   - ✅ Отображается блок "Шаблон загрузки"
   - ✅ Показывается индикатор загрузки
   - ✅ После загрузки отображается информация о шаблоне

#### **Тест 2: Категория без шаблона**
1. **Выберите категорию** без настроенного шаблона
2. **Результат**:
   - ✅ Отображается "Шаблон загрузки не настроен"
   - ✅ Есть кнопка "Создать шаблон"
   - ✅ Иконка Package для визуального акцента

#### **Тест 3: Категория с шаблоном**
1. **Выберите категорию** с настроенным шаблоном
2. **Результат**:
   - ✅ Отображается название шаблона
   - ✅ Показываются обязательные поля как badges
   - ✅ Указывается количество полей маппинга
   - ✅ Есть кнопки "Редактировать" и "Скачать шаблон"

#### **Тест 4: Переключение между категориями**
1. **Выберите одну категорию**, дождитесь загрузки шаблона
2. **Выберите другую категорию**
3. **Результат**:
   - ✅ Шаблон первой категории сбрасывается
   - ✅ Начинается загрузка шаблона второй категории
   - ✅ Отображается новый шаблон

### 🔧 **Технические детали:**

#### **1. API интеграция:**
```typescript
// Запрос шаблонов для конкретной категории
GET /api/admin/import-templates?catalog_category_id=${categoryId}

// Ответ API
{
  "success": true,
  "templates": [
    {
      "id": "template_id",
      "name": "Название шаблона",
      "description": "Описание шаблона",
      "requiredFields": ["поле1", "поле2"],
      "fieldMappings": [...],
      "isActive": true
    }
  ],
  "count": 1
}
```

#### **2. Состояния компонента:**
```typescript
// Состояния для управления шаблоном
const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
const [templateLoading, setTemplateLoading] = useState(false);

// Связь с выбранной категорией
const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | null>(null);
```

#### **3. Обработка ошибок:**
```typescript
try {
  // Загрузка шаблона
  const response = await fetch(`/api/admin/import-templates?catalog_category_id=${categoryId}`);
  const data = await response.json();
  
  if (data.success && data.templates && data.templates.length > 0) {
    setSelectedTemplate(data.templates[0]);
  } else {
    setSelectedTemplate(null);
  }
} catch (error) {
  console.error('Error loading template:', error);
  setSelectedTemplate(null);
} finally {
  setTemplateLoading(false);
}
```

### 🎉 **Результат:**

**Отображение шаблонов загрузки на странице каталога полностью реализовано!**

- ✅ **Автоматическая загрузка** шаблона при выборе категории
- ✅ **Красивый UI** с зеленой цветовой схемой
- ✅ **Информативное отображение** - название, поля, маппинг
- ✅ **Состояния загрузки** - спиннер и сообщения
- ✅ **Кнопки действий** - редактировать, скачать, создать
- ✅ **Обработка ошибок** - graceful degradation
- ✅ **Реактивность** - обновление при смене категории

**Теперь на странице каталога у каждой категории отображается свой шаблон загрузки!** 📋✨




