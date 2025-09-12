Title: Domeo — Master Spec (Doors Pilot)
Owner: @TechLead + @Product
Last updated (Europe/Paris): 2025-09-11
Related: [Roadmap](./roadmap.md), [State](./state.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md),
         [Sync Guide](./sync_guide.md)

# Domeo No-Code Calculators — Master Spec (Pilot: Doors)

**Версия:** 0.3 (2025-09-11)\
**Назначение:** единый источник истины (Business + Tech + Admin).\
**Платформы:** Yandex Cloud (prod), GitHub (код/CI), Replit (стенд/демо).\
**Доступность:** публичный сайт; админка за базовой авторизацией.

---

## 1. Цель и границы

**Цель:** многостраничный веб-сервис подбора дверей с формированием КП/счета (PDF) и выгрузкой «заказа на фабрику» (CSV/XLSX).\
**Границы пилота:** категория *Doors* + No-Code админка для добавления/изменения категорий без кода.

**Включено:**

- Каталог → Конфигуратор → Корзина (онлайн-редактор позиции, мгновенный пересчет, дельта к базовой цене).
- Документы: КП/Счет (PDF), «Заказ на фабрику» (CSV/XLSX).
- Импорт прайсов (разные поставщики), интеграция с 1С (артикул, аванс), справочники (fixtures).
- Админка No-Code: категории, конфиги (JSON), прайсы, шаблоны экспорта, публикации/rollback, медиа.

**Не включено в пилот:** продвинутые роли/ACL, сложный биллинг, multitenancy.

---

## 2. Роли и доступ

- **Комплектатор:** подбор → корзина → КП/Счет (PDF) + экспорт «заказа на фабрику».
- **Admin:** создание/редактирование категорий, импорт прайсов, публикация/rollback, медиа, fixtures.
- **Manager:** импорт прайсов, правка fixtures.
- **Viewer:** доступ «только чтение» в админке.
- **GPT (виртуальная команда):** единственный разработчик проекта, отвечает за написание всего кода, 
  ведение документации (`state.md`, `roadmap.md`, `master_spec.md` и др.), синхронизацию файлов-истин.

---

## 3. Пользовательские сценарии (Frontend)

### 3.1 Главная / «Стиль»

- 4 тайла стилей: Скрытая / Современная / Неоклассика / Классика → переход к моделям.

### 3.2 Модели стиля

- Сетка карточек (фото, название). Выбор модели → конфигуратор.

### 3.3 Конфигуратор модели

- Параметры: **finish, color, type, width, height** (width×height подтягиваются из БД по комбинации).
- Показ РРЦ двери; выбор **hardware_kit** и **handle** (по группе/товару).
- «Добавить в корзину».

### 3.4 Корзина

- Изменение qty, дублирование, удаление.
- Онлайн-редактор позиции (finish/color/type/width/height); пересчет + **дельта** к базовой цене.
- Цена строки = дверь + ручка + комплект фурнитуры.
- Кнопки: «КП», «Счет» (PDF), «Заказ на фабрику» (CSV/XLSX).

---

## 4. No-Code Админка (Web Admin)

### 4.1 Экран и потоки

- **Dashboard:** список категорий, создать/дублировать, публиковать/rollback, статус.
- **Wizard «Новая категория»:** Основное → Attributes → UI Flow → Pricing DSL → Export Templates.
- **Импорт прайсов:** загрузка XLSX/CSV → маппинг → валидация → отчёт по конфликтам РРЦ → UPSERT.
- **Fixtures:** редактор справочников (комплекты, ручки и т.д.).
- **Медиа-менеджер:** загрузка изображений; выдача через `/media/:id` (+ fit?w=&h=).
- **Предпросмотр:** /options, /price, экспорт КП/CSV (smoke-тесты в UI).

### 4.2 Управление базой товаров (пилот Doors)

- **Начальный массив данных** загружается из XLSX/CSV (поставляется в проект).
- **Дальнейшее управление — только через админку:** импорт новых прайсов; редактирование fixtures; обновление медиа.
- **Версионирование:** конфиг категории хранится как draft/published; публикация создаёт снапшот; есть rollback.
- **Конфликты РРЦ:** при импорте группировка по ключу витрины; обнаружение расхождений; отчёт + выбор канонической РРЦ (по умолчанию — минимальная или заданная админом).

---

## 5. Бизнес-правила (Doors)

- **Ключ витрины (product key):** (model, finish, domeo_color/color, type, width, height) ↔ один артикул 1С (одно название «Комплекта двери»).
- **РРЦ единая на ключ.** Разные РРЦ от поставщиков → конфликт → отчёт + ручной выбор канона.
- **Экспорт «Заказ на фабрику»:** для каждой позиции двери выгружаются все подходящие поставщики комбинации.\
  Если выбрана ручка — отдельной строкой после двери (qty = qty двери, цена из группы/товара).
- **Дельта в корзине:** (текущая цена после правки) − (базовая цена при добавлении).

---

## 6. Техническая архитектура и стек

**Frontend:** React + TypeScript (CSR), корзина в localStorage, UI рендерится по `ui.flow` из конфигурации категории.\
**Backend:** Node.js (Express).\
**БД:** Dev/Staging — SQLite (совместимые миграции); Prod — PostgreSQL (рекомендуется).\
**Библиотеки:** xlsx, multer, better-sqlite3 (dev) / pg (prod), dotenv, helmet, morgan.\
**Развёртывание:** контейнер Node + БД в Yandex Cloud; `.env`; бэкапы БД (ежедневно + hot-backup перед публикациями).

### 6.1 Структура репозитория (предложение)

repo/
├─ config/
│ ├─ _template/
│ │ └─ category.json
│ ├─ doors/
│ │ ├─ category.json
│ │ ├─ fixtures.json
│ │ └─ import.mapping.json
│ └─ windows/
│ ├─ category.json
│ └─ import.mapping.json
├─ static/
│ ├─ doors/ # медиа
│ └─ windows/
├─ server/
│ ├─ src/
│ │ ├─ index.ts
│ │ ├─ configRegistry.ts
│ │ ├─ dsl/engine.ts
│ │ ├─ services/{catalog,pricing}.ts
│ │ ├─ routes/{categories,catalog,price,admin}.ts
│ │ └─ db/sql/{001_init_sqlite.sql,101_init_postgres.sql}
│ └─ test/{options.spec.ts,pricing.spec.ts}
├─ frontend/
│ └─ src/{uiRenderer/,tabs/}
├─ docs/{STATE.md,OPENAPI.yaml}
└─ .env.example

---

## 7. Модель данных (канон + admin storage)

### 7.1 Публичный каталог/продажи

- `products` — витрина (UNIQUE(category, model, finish, color, type, width, height); rrc_price — каноническая).
- `sizes` — допустимые размеры (model, type, width, height).
- `fixtures` — справочники (kits, handles …) с `price`, `meta_json`.
- `pricing_rules` — JSON правил DSL по категории (версия актуальная).

### 7.2 No-Code конфигурация и версии

- `categories` — опубликованные категории (актуальные метаданные + shortcut на published конфиг).
- `category_configs` — конфиги категории (draft/published, JSONB, версии/метки времени).
- `category_templates` — шаблоны экспорта (HTML КП, CSV/XLSX заказ).
- `category_import_mappings` — маппинги XLSX/CSV.
- `media_files` — двоичные медиа + метаданные (photo_id), раздача через `/media/:id`.

---

## 8. Импорт данных и отчёты

**Mapping tolerant к регистру/синонимам.**

- Ключ витрины: `model, finish, domeo_color/color, type, width, height, rrc_price` — обязательны для записи в `products`.
- Поставщик: `factory, factory_name, factory_color, factory_type, opening_side, opt_price`.
- Прочее: `photo_url`, `source_date`, `source_file`.

**Поведение при конфликтах РРЦ:**

- Группировка по ключу; при различиях — сообщение «найдены группы с одинаковым ключом и разной РРЦ» + CSV-отчёт в `/static/import_reports/*` (ключ, список РРЦ, примеры строк).
- В `products` записывается выбранная каноническая (по умолчанию — минимальная); админ может вручную проставить среднюю/другую и перепубликовать.

---

## 9. API (OpenAPI 3.1 — выжимка)

- `GET /categories` — список категорий (для вкладок).
- `GET /catalog/{category}/options` — доступные значения атрибутов при текущем фильтре (`dependsOn`, БД, кеш 30–120с).\
  Альтернатива: `selection` как JSON-строка в query.
- `POST /price/{category}` — расчёт цены по DSL (base, breakdown[], total).
- `POST /cart/export/{category}/{kp|factory}` — экспорт документов (HTML/CSV/XLSX).
- **Admin:** `/admin/categories` (CRUD + publish/rollback), `/admin/templates/:key`, `/admin/import-mapping/:key`, `/admin/import/:key`, `/admin/fixtures/:key/:kind`, `/admin/media/upload`, `/media/:id`.

---

## 10. Алгоритмы

### 10.1 Options (`GET /catalog/{category}/options`)

- Топологическая сортировка по `dependsOn`.
- Базовый предикат из `selection`; для каждого атрибута — домен значений с учётом его `dependsOn` + фактических данных БД.
- Применение `constraints` (mustHave / forbid).
- Для `entity` — подмешивание `media/priceField`.

### 10.2 Pricing Engine (DSL)

- Операции: `add, mul, min, max, round(to), ceil, floor, formula(expr)`.
- Условия when: `==, in, >=, <=, диапазоны, regex`.
- Источники: `fromAttr`, `constant`, `lookup(table,key,valField)`.
- Результат: `{ currency, base, breakdown[], total }` (все суммы округлены до шага `to`).

### 10.3 Экспорт

- КП — HTML (Handlebars-шаблон).
- Заказ — CSV/XLSX; ручка — отдельной строкой после двери.

---

## 11. UI/UX Flow (Doors)

- `flow`: `style` (tiles) → `model` (grid + media) → `options` (параметры + фурнитура) → `price` (card).
- `cart`: `lineTitle` = `{model} — {type}`; колонки: `parameters, unitPrice, qty, sum, actions`.

---

## 12. Публикации, окружения, CI/CD

- **Dev/Staging:** SQLite, автосборка из GitHub, предпросмотр на Replit или YC Functions/VM.
- **Prod:** PostgreSQL в Yandex Cloud; контейнеры (Node + Nginx); миграции при деплое.
- **Backups:** ежедневные + Point-in-Time при публикациях админ-конфига.

---

## 13. Безопасность и соответствие

- Админ-разделы за базовой авторизацией (JWT/Session).
- Ограничение MIME/размера для импорта/медиа; защита от CSV-инъекций (префикс `'` для полей, начинающихся с `=,+,-`).
- Логи импорта/экспорта; аудит публикаций.

---

## 14. Чеклисты приёмки (пилот)

- Категория *Doors* работает через конфиги (UI/цены без правок в коде).
- `/catalog/doors/options` учитывает `dependsOn` и реальные данные БД.
- `/price/doors` считает по DSL; unit-тесты правил проходят.
- Экспорт КП и заказа — из шаблонов (ручная проверка + снапшоты).
- Импорт по маппингу → отчёт + корректный UPSERT.
- Добавление новой категории (демо *Windows*) — только конфигами/импортом, без правок JS/TS.

---

## 15. Roadmap (ссылка)

Полный план внедрения см. в отдельном файле: [roadmap.md](./roadmap.md).

---

## 16. State (ссылка)

Актуальный прогресс и блокеры ведутся в отдельном файле: [state.md](./state.md).

---

## 17. Операционные регламенты

- **Как обновить базу товаров (Doors):** Импорт XLSX в админке → сверка маппинга → отчёт → публикация.
- **Как откатить конфиг:** в Dashboard открыть категорию → «История» → выбрать версию → `Rollback`.
- **Как добавить новую категорию:** Wizard (5 шагов) → примеры config из `_template` → smoke-тесты → публикация.
- **Как править цены без кода:** правка прайса в XLSX и/или `pricing_rules` через админку → публикация.

---

## 18. Приложения

- Пример `config/doors/category.json` (атрибуты, constraints, pricing, ui).
- Пример `config/doors/fixtures.json` (kits/handles).
- Пример `config/doors/import.mapping.json`.
- Шаблоны `templates/doors/kp.html`, `templates/doors/factory.csv`.
- curl-смоук-тесты.

---

## Decision Log

- 2025-09-11: Вынесены Roadmap и State в отдельные файлы.  
- 2025-09-11: Подтверждено, что формулы/вывод КП описываются только в [Spec КП и формулы](./spec_kp_formulas.md).  
- 2025-09-11: Добавлена роль GPT как единственного разработчика проекта.
