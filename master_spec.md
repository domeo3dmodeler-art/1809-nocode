Title: Domeo — Master Spec (Doors Pilot)
Owner: @TechLead + @Product
Last updated (Europe/Paris): 2025-09-13
Related: [Roadmap](./roadmap.md), [State](./state.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md),
         [Sync Guide](./sync_guide.md)

# Domeo No-Code Calculators — Master Spec (Pilot: Doors)

**Версия:** 0.3 (2025-09-13)  
**Назначение:** единый источник истины (Business + Tech + Admin).  
**Платформы:** Yandex Cloud (prod), GitHub (код/CI), Replit (стенд/демо).  
**Доступность:** публичный сайт; админка за базовой авторизацией.

---

## 1. Цель и границы

**Цель:** многостраничный веб-сервис подбора дверей с формированием КП/счёта (HTML/PDF) и выгрузкой «заказа на фабрику» (CSV/XLSX).  
**Границы пилота:** категория *Doors* + No-Code админка для добавления/изменения категорий без кода.

**Включено:**
- Каталог → Конфигуратор → Корзина (онлайн-редактор позиции, мгновенный пересчёт, дельта к базовой цене).
- Документы: КП/Счёт (HTML/PDF), «Заказ на фабрику» (CSV/XLSX).
- Импорт прайсов (разные поставщики), интеграция с 1С (артикул, аванс), справочники (fixtures).
- Админка No-Code: категории, конфиги (JSON), прайсы, шаблоны экспорта, публикации/rollback, медиа.

**Не включено в пилот:** продвинутые роли/ACL, сложный биллинг, multitenancy.

---

## 2. Роли и доступ

- **Комплектатор:** подбор → корзина → КП/Счёт (HTML/PDF) + экспорт «заказа на фабрику».
- **Admin:** создание/редактирование категорий, импорт прайсов, публикация/rollback, медиа, fixtures.
- **Manager:** импорт прайсов, правка fixtures.
- **Viewer:** доступ «только чтение» в админке.
- **GPT (виртуальная команда):** единственный разработчик проекта, пишет весь код и ведёт «истины».

---

## 3. Пользовательские сценарии (Frontend)

### 3.1 Главная / «Стиль»
- 4 тайла стилей: Скрытая / Современная / Неоклассика / Классика → переход к моделям.

### 3.2 Модели стиля
- Сетка карточек (фото, название). Выбор модели → конфигуратор.

### 3.3 Конфигуратор модели
- Параметры: **finish, color, type, width, height** (width×height подтягиваются из БД по комбинации).
- Показ РРЦ двери; выбор **hardware_kit** и **handle**.
- «Добавить в корзину».

### 3.4 Корзина
- Изменение qty, дублирование, удаление.
- Онлайн-редактор позиции (finish/color/type/width/height); пересчёт + **дельта** к базовой цене.
- Цена строки = дверь + ручка + комплект фурнитуры.
- Кнопки: «КП», «Счёт» (HTML/PDF), «Заказ на фабрику» (CSV/XLSX).

---

## 4. No-Code Админка (Web Admin)

### 4.1 Экран и потоки
- **Dashboard:** список категорий, создать/дублировать, публиковать/rollback, статус.
- **Wizard «Новая категория»:** Основное → Attributes → UI Flow → Pricing DSL → Export Templates.
- **Импорт прайсов:** загрузка XLSX/CSV → маппинг → валидация → отчёт по конфликтам РРЦ → UPSERT.
- **Fixtures:** редактор справочников (комплекты, ручки и т.д.).
- **Медиа-менеджер:** загрузка изображений; выдача через `/media/:id` (+ `fit?w=&h=`).
- **Предпросмотр:** `/options`, `/price`, экспорт КП/CSV (smoke-тесты в UI).

### 4.2 Управление базой товаров (пилот Doors)
- **Начальный массив данных** загружается из XLSX/CSV (поставляется в проект).
- **Дальнейшее управление — только через админку:** импорт новых прайсов; редактирование fixtures; обновление медиа.
- **Версионирование:** конфиг категории хранится как draft/published; публикация создаёт снапшот; есть rollback.
- **Конфликты РРЦ:** при импорте группировка по ключу витрины; отчёт + выбор канонической РРЦ (по умолчанию — минимальная или заданная админом).

---

## Doors — Конфигуратор (MVP 2025-09)
**Страница:** `/doors` (client; app router)  
**Цели:** визуальный выбор параметров, автопрайсинг, корзина, экспорт КП/счёта/заказа.

### Сущности выбора (dependsOn)
- style → model → finish → color → type → width → height  
- accessories: hardware_kit (из `kits`), handle (из `handles`)

### API (Next API)
- GET `/api/catalog/doors/models?style=…` → `[ { model, style, photo } ]`
- GET `/api/catalog/doors/options[?style&model&finish&color&type&width&height]`  
  `domain: { style[], model[], finish[], color[], type[], width[], height[], kits[], handles[] }`
- POST `/api/price/doors`  
  `selection: { model, finish, color, type, width, height, hardware_kit?:{id}, handle?:{id} }`  
  `result: { ok, currency:"RUB", base, breakdown[], total, sku_1c }`  
  **Формула:** `total = base_rrc + kit.price_rrc + round(handle.price_opt * price_group_multiplier)`
- POST `/api/cart/export/doors/{kp|invoice}` → HTML  
- POST `/api/cart/export/doors/factory` → CSV

### Импорт в Админке
- UI вкладки категорий (`doors`, `generic`). Загрузка XLSX/CSV.
- `POST /api/admin/import/[category]`:
  - `doors`:
    - Лист «Основное» → `products` (ключ: model, finish, color, type, width, height)
    - Лист «КомплектыФурнитуры` → `kits`
    - Листы «КаталогРучек» + «ЦеныГруппРучек» → `handles` (handle.price_opt по группе)
    - При расхождении РРЦ — **409 + CSV конфликтов**. Параметр `?force=1` разрешает перезапись.
  - `generic`: первая таблица → `catalog_generic` (JSONB), сырые строки → `imports_raw`.

### БД (канон)
- `products` (+ VIEW `doors_catalog` для совместимости)
- `kits` / `handles`
- `catalog_generic` / `imports_raw`
- Триггеры `updated_at` присутствуют и исправны.

### UX-детали
- Автопрайсинг запускается при полноте выбора (все 7 полей).
- В корзине поддерживается правка параметров и пересчёт.
- Экспорт: КП/Счёт (HTML), Заказ на фабрику (CSV; ручки отдельными строками).

### Ограничения MVP
- Фильтрация `kits/handles` по модели опциональна (сейчас полный список).
- Аутентификация для админ-импорта пока отключена (добавим JWT/роль позже).

---

## 5. Бизнес-правила (Doors)
- **Ключ витрины (product key):** (model, finish, domeo_color/color, type, width, height) ↔ один артикул 1С.  
- **РРЦ единая на ключ.** Разные РРЦ от поставщиков → конфликт → отчёт + ручной выбор канона.  
- **Экспорт «Заказ на фабрику»:** дверь — основная строка; ручка — отдельной строкой после двери (qty = qty двери).  
- **Дельта в корзине:** (текущая цена после правки) − (базовая цена при добавлении).

---

## 6. Техническая архитектура и стек
**Frontend:** React + TypeScript (CSR), корзина в `localStorage`, `ui.flow` из конфигурации категории.  
**Backend:** Node.js (Next API for MVP).  
**БД:** Dev/Staging — SQLite (совместимые миграции); Prod — PostgreSQL.  
**Библиотеки:** xlsx, multer, pg, dotenv, helmet, morgan.  
**Развёртывание:** контейнер Node + Nginx; `.env`; бэкапы БД (ежедневно + PIT перед публикациями).

### 6.1 Структура репозитория (референс)

repo/
├─ app/ (Next.js 14 app router)
├─ prisma/ (schema + migrations)
├─ scripts/ {smoke.sh, spec_guard.py, verify_truths.sh}
├─ docs/ {master_spec.md, ...}
└─ config/doors/ {templates, mapping, fixtures}


---

## 7. Модель данных (канон + admin storage)

### 7.1 Публичный каталог/продажи
- `products` — UNIQUE(category, model, finish, color, type, width, height); `rrc_price` — каноническая.  
- `fixtures` — справочники (kits, handles) с `price`, `meta_json`.

### 7.2 No-Code конфигурация и версии
- `categories`, `category_configs` (draft/published, JSONB, версии/метки времени).  
- `category_templates` — шаблоны экспорта (HTML КП, CSV/XLSX заказ).  
- `category_import_mappings` — маппинги XLSX/CSV.  
- `media_files` — двоичные медиа + метаданные (`photo_id`).

---

## 8. Импорт данных и отчёты
**Mapping tolerant** к регистру/синонимам.

- Ключ витрины: `model, finish, domeo_color/color, type, width, height, rrc_price` — обязательны.  
- Поставщик: `factory, collection, supplier_item_name, supplier_color_finish, opt_price`.  
- Прочее: `photo_url`, `source_date`, `source_file`.

**Поведение при конфликтах РРЦ:**
- Группировка по ключу; CSV-отчёт в `/static/import_reports/*`.  
- В `products` записывается выбранная каноническая (по умолчанию — минимальная).

---

## 9. API (OpenAPI 3.1 — выжимка)
- `GET /catalog/{category}/options` — домены значений с учётом `dependsOn` и БД.  
- `POST /price/{category}` — расчёт `{ currency, base, breakdown[], total }`.  
- `POST /cart/export/{category}/{kp|invoice}` — HTML.  
- `POST /cart/export/{category}/factory` — CSV.  
- **Admin:** `/api/admin/import/{category}`, `/api/admin/media/upload` и др.

---

## 10. Алгоритмы

### 10.1 Options
- Топологическая сортировка по `dependsOn`.  
- Домен значений по предикату selection + фактические комбинации в БД.  
- Применение `constraints` (mustHave / forbid).

### 10.2 Pricing Engine
- `add, mul, min, max, round(to), ceil, floor, formula(expr)`; условия `when` (==, in, >=, <=, диапазоны, regex).  
- Источники: `fromAttr`, `constant`, `lookup(table,key,valField)`.

### 10.3 Экспорт
- КП — HTML (шаблон).  
- Заказ — CSV; ручка — отдельной строкой после двери.

---

## 11. UI/UX Flow (Doors)
- `flow`: `style` (tiles) → `model` (grid+media) → `options` (параметры+фурнитура) → `price` (card).  
- `cart`: `lineTitle` = `{model} — {type}`; колонки: `parameters, unitPrice, qty, sum, actions`.

---

## 12. Публикации, окружения, CI/CD
- **Dev/Staging:** SQLite, автосборка, предпросмотр.  
- **Prod:** PostgreSQL; контейнеры Node + Nginx; миграции при деплое.  
- **Backups:** ежедневные + PIT при публикациях админ-конфига.

---

## 13. Безопасность и соответствие
- Админ-разделы за авторизацией (JWT/Session).  
- Ограничение MIME/размера для импорта/медиа; защита от CSV-инъекций (`'` для `=,+,-`).  
- Логи импорта/экспорта; аудит публикаций.

---

## 14. Чеклисты приёмки (пилот)
- *Doors* работает через конфиги (UI/цены без правок в коде).  
- `/catalog/doors/options` учитывает `dependsOn` и данные БД.  
- `/price/doors` считает по формуле; unit-тесты проходят.  
- Экспорт КП/Заказа — из шаблонов; снапшоты совпадают.  
- Импорт по маппингу → отчёт + корректный UPSERT.  
- Добавление новой категории — только конфигами/импортом, без правок JS/TS.

---

## 15. Roadmap (ссылка)
См. [roadmap.md](./roadmap.md).

## 16. State (ссылка)
См. [state.md](./state.md).

## 17. Операционные регламенты
- Как обновить базу товаров (Doors): импорт XLSX в админке → сверка маппинга → отчёт → публикация.  
- Как откатить конфиг: Dashboard → «История» → выбрать версию → Rollback.  
- Как добавить новую категорию: Wizard (5 шагов) → smoke-тесты → публикация.  
- Как править цены без кода: прайс в XLSX и/или `pricing_rules` в админке → публикация.

---

## 18. Приложения
- Пример `config/doors/category.json` (атрибуты, constraints, pricing, ui).  
- Пример `config/doors/fixtures.json` (kits/handles).  
- Пример `config/doors/import.mapping.json`.  
- Шаблоны `templates/doors/kp.html`, `templates/doors/factory.csv`.  
- curl-смоук-тесты.

---

## Decision Log
- 2025-09-13: Обновлён раздел Doors (конфигуратор, API, импорт, UX, ограничения MVP).  
- 2025-09-11: Вынесены Roadmap и State в отдельные файлы.  
- 2025-09-11: Формулы/вывод КП описываются только в [Spec КП и формулы](./spec_kp_formulas.md).
