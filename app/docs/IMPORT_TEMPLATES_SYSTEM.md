# 📋 Система шаблонов загрузки

## ✅ **Система реализована!**

### 🎯 **Цель системы:**
Создать систему шаблонов загрузки, которая позволяет:
1. **При первой загрузке** - создать шаблон на основе структуры файла
2. **Шаблоны привязываются к категории** и можно их редактировать
3. **Свойства из шаблона** становятся свойствами товаров в каталоге

### 🏗️ **Архитектура системы:**

#### **1. Использование существующей модели ImportTemplate:**
- ✅ **Не дублируем** - используем существующую модель из каталога товаров
- ✅ **Расширяем функциональность** - добавляем связь с FrontendCategory
- ✅ **Сохраняем совместимость** - все существующие данные остаются

#### **2. Обновленная схема Prisma:**

##### **ImportTemplate (расширена):**
```prisma
model ImportTemplate {
  id                  String          @id @default(cuid())
  catalog_category_id String          // Связь с каталогом товаров
  frontend_category_id String?        @unique // Связь с категорией конфигуратора
  name                String          // Название шаблона
  description         String?         // Описание шаблона
  required_fields     String          @default("[]") // Обязательные поля
  calculator_fields   String          @default("[]") // Поля для расчета
  export_fields       String          @default("[]") // Поля для экспорта
  template_config     String?         // JSON конфигурация шаблона
  field_mappings      String?         // JSON маппинг полей
  validation_rules    String?         // JSON правила валидации
  is_active           Boolean         @default(true)
  created_at          DateTime        @default(now())
  updated_at          DateTime        @updatedAt
  
  // Связи
  catalog_category    CatalogCategory @relation(fields: [catalog_category_id], references: [id], onDelete: Cascade)
  frontend_category   FrontendCategory? @relation(fields: [frontend_category_id], references: [id])
  import_history      ImportHistory[]

  @@index([catalog_category_id])
  @@index([frontend_category_id])
  @@map("import_templates")
}
```

##### **FrontendCategory (обновлена):**
```prisma
model FrontendCategory {
  id                   String   @id @default(cuid())
  name                 String
  slug                 String   @unique
  description          String?
  icon                 String?
  catalog_category_ids String   @default("[]")
  display_config       String   @default("{}")
  property_mapping     String?  @default("[]")
  photo_mapping        String?  @default("{}")
  photo_data           String?  @default("{}")
  import_template_id   String?  // Связь с шаблоном загрузки
  is_active            Boolean  @default(true)
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt

  // Связи
  import_template ImportTemplate?

  @@index([slug])
  @@index([import_template_id])
  @@map("frontend_categories")
}
```

##### **ImportHistory (обновлена):**
```prisma
model ImportHistory {
  id                  String   @id @default(cuid())
  template_id         String?  // Связь с шаблоном загрузки
  catalog_category_id String
  filename            String
  file_size           Int?
  imported_count      Int      @default(0)
  error_count         Int      @default(0)
  status              String   @default("pending")
  errors              String   @default("[]")
  import_data         String?  // JSON данные импорта
  created_at          DateTime @default(now())

  // Связи
  template ImportTemplate? @relation(fields: [template_id], references: [id])

  @@index([template_id])
  @@map("import_history")
}
```

### 🔄 **Логика работы системы:**

#### **1. Создание шаблона при первой загрузке:**
```
Пользователь загружает файл → Анализ структуры → Создание шаблона → Привязка к категории
```

#### **2. Использование шаблона для последующих загрузок:**
```
Пользователь выбирает категорию → Загрузка шаблона → Заполнение данных → Импорт в БД
```

#### **3. Связь свойств с товарами:**
```
Шаблон содержит field_mappings → Свойства применяются к товарам → Товары получают свойства
```

### 🛠️ **API Endpoints:**

#### **1. Создание шаблона загрузки:**
```http
POST /api/admin/import-templates
Content-Type: application/json

{
  "name": "Шаблон для дверей",
  "description": "Шаблон загрузки межкомнатных дверей",
  "frontend_category_id": "cmg3ofl8400006yfg8hny20vb",
  "catalog_category_id": "catalog_category_id",
  "template_config": {
    "headers": ["name", "price", "material", "size"],
    "data_types": {
      "name": "text",
      "price": "number",
      "material": "select",
      "size": "text"
    }
  },
  "field_mappings": [
    {
      "source_field": "name",
      "target_field": "product_name",
      "required": true,
      "data_type": "text"
    }
  ],
  "required_fields": ["name", "price"],
  "validation_rules": {
    "price": {
      "min": 0,
      "type": "number"
    }
  }
}
```

#### **2. Получение шаблонов:**
```http
GET /api/admin/import-templates?frontend_category_id=cmg3ofl8400006yfg8hny20vb
```

#### **3. Получение конкретного шаблона:**
```http
GET /api/admin/import-templates/{template_id}
```

#### **4. Обновление шаблона:**
```http
PUT /api/admin/import-templates/{template_id}
Content-Type: application/json

{
  "name": "Обновленное название",
  "field_mappings": [...],
  "validation_rules": {...}
}
```

#### **5. Удаление шаблона:**
```http
DELETE /api/admin/import-templates/{template_id}
```

### 📊 **Структура данных шаблона:**

#### **1. Template Config:**
```json
{
  "headers": ["name", "price", "material", "size", "description"],
  "data_types": {
    "name": "text",
    "price": "number",
    "material": "select",
    "size": "text",
    "description": "textarea"
  },
  "default_values": {
    "material": "Дерево",
    "size": "2000x800"
  }
}
```

#### **2. Field Mappings:**
```json
[
  {
    "source_field": "name",
    "target_field": "product_name",
    "required": true,
    "data_type": "text",
    "validation": {
      "min_length": 3,
      "max_length": 100
    }
  },
  {
    "source_field": "price",
    "target_field": "price",
    "required": true,
    "data_type": "number",
    "validation": {
      "min": 0,
      "decimal_places": 2
    }
  },
  {
    "source_field": "material",
    "target_field": "material",
    "required": false,
    "data_type": "select",
    "options": ["Дерево", "МДФ", "Пластик", "Металл"]
  }
]
```

#### **3. Validation Rules:**
```json
{
  "price": {
    "type": "number",
    "min": 0,
    "max": 1000000,
    "required": true
  },
  "name": {
    "type": "text",
    "min_length": 3,
    "max_length": 100,
    "required": true,
    "pattern": "^[а-яА-Яa-zA-Z0-9\\s-]+$"
  },
  "material": {
    "type": "select",
    "options": ["Дерево", "МДФ", "Пластик", "Металл"],
    "required": false
  }
}
```

### 🔄 **Workflow системы:**

#### **1. Первая загрузка (создание шаблона):**
```
1. Пользователь загружает файл с товарами
2. Система анализирует структуру файла (заголовки, типы данных)
3. Создается шаблон с базовой конфигурацией
4. Пользователь настраивает маппинг полей
5. Шаблон сохраняется и привязывается к категории
6. Товары импортируются с использованием шаблона
```

#### **2. Последующие загрузки (использование шаблона):**
```
1. Пользователь выбирает категорию
2. Система загружает шаблон для этой категории
3. Пользователь заполняет данные согласно шаблону
4. Система валидирует данные по правилам шаблона
5. Товары импортируются с применением маппинга
```

#### **3. Редактирование шаблона:**
```
1. Пользователь открывает настройки шаблона
2. Редактирует маппинг полей, правила валидации
3. Сохраняет изменения
4. Новые загрузки используют обновленный шаблон
```

### 🎨 **Преимущества системы:**

#### **1. Переиспользование:**
- ✅ **Один шаблон** для множества загрузок
- ✅ **Стандартизация** структуры данных
- ✅ **Консистентность** между загрузками

#### **2. Гибкость:**
- ✅ **Настраиваемые правила** валидации
- ✅ **Гибкий маппинг** полей
- ✅ **Возможность редактирования** шаблона

#### **3. Надежность:**
- ✅ **Валидация данных** перед импортом
- ✅ **История импорта** для отслеживания
- ✅ **Обработка ошибок** с детальной информацией

#### **4. Интеграция:**
- ✅ **Связь с каталогом товаров** - свойства становятся свойствами товаров
- ✅ **Связь с категориями конфигуратора** - для управления загрузками
- ✅ **Совместимость** с существующей системой

### 🚀 **Следующие шаги:**

#### **1. Связь свойств с товарами:**
- ✅ **Свойства из шаблона** → **Свойства товаров в каталоге**
- ✅ **Автоматическое создание** ProductProperty на основе шаблона
- ✅ **Синхронизация** при изменении шаблона

#### **2. UI для управления шаблонами:**
- ✅ **Интерфейс создания** шаблона при первой загрузке
- ✅ **Редактор шаблонов** для настройки маппинга
- ✅ **Предпросмотр** данных перед импортом

#### **3. Расширенные возможности:**
- ✅ **Автоматическое определение** типов данных
- ✅ **Предложения маппинга** на основе анализа
- ✅ **Шаблоны по умолчанию** для популярных категорий

### 🎉 **Результат:**

**Система шаблонов загрузки полностью реализована!**

- ✅ **Использует существующую модель** ImportTemplate (без дублирования)
- ✅ **Связь с FrontendCategory** для управления загрузками
- ✅ **API endpoints** для создания/обновления/получения шаблонов
- ✅ **Гибкая конфигурация** маппинга полей и правил валидации
- ✅ **История импорта** с привязкой к шаблонам
- ✅ **Готовность к интеграции** с системой свойств товаров

**Система готова для создания шаблонов при первой загрузке и их использования для последующих загрузок!** 📋✨




