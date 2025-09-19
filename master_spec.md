# Domeo No-Code Calculators • Doors — Master Spec (каноническая спецификация)

## Версия
- Документ: `master_spec.md`
- Статус: актуализировано на 2025-09-17
- Область: пилот «Doors» (импорт → расчёты → админка → экспорт)

## Цели пилота
1) Довести категорию Doors до релиза: импорт каталога и медиа, конфигуратор, формирование КП/Счёта/Заказа.  
2) Зафиксировать контракты API и UX, синхронизировать документацию и CI.

## Архитектура (обзор)
- **Next.js 14 (App Router)**, TypeScript strict.
- **БД**: PostgreSQL, Prisma.
- **API**:
  - Публичные: `GET /api/health`, каталог, цены, экспорт.
  - Админ: `POST /api/admin/import/doors`, `POST /api/admin/media/upload`, `GET /api/admin/ping` — под JWT guard.
- **UI**: `/doors` — 2 вкладки: «Конфигуратор» и «Админ».
- **Медиа**: публичная папка `app/public/assets/doors/` с предсказуемыми именами файлов.
- **CI**: GitHub Actions (`build-and-smoke`, `remote-smoke`).

## Доменная модель (минимум для Doors)
Таблица `products` (Prisma модель `products`):
- `id` (pk)
- `style` (строка)
- `model` (строка)
- `finish` (строка)
- `domeo_color` (строка) — в UI «Цвет»
- `type` (строка)
- `width` (число)
- `height` (число)
- `rrc_price` (число, RUB) — РРЦ
- Доп. атрибуты для экспорта/фабрики: `sku_1c`, `supplier`, `collection`, `supplier_item_name`, `supplier_color_finish`, `price_opt`
- **Уникальность** (импорт): `(model, finish, domeo_color, type, width, height)`

Индексы (см. `app/sql/create_products_index.sql`):
- По ключевым полям и композитный индекс по unique-ключу.

## Правила для изображений
- Папка: `app/public/assets/doors/`
- Имя файла: `encodeURIComponent(model).ext` (например, `"PO Base 1/1" → "PO%20Base%201%2F1.jpg"`).
- Логика поиска превью (приоритет): **`SKU` → `encodeURIComponent(model)` → `slug(model)`**.
- Допустимые расширения для UI: `.jpg`/`.png` (по умолчанию).

## Контракты API

### Health / Ping
- `GET /api/health` → `204 No Content`
- `GET /api/admin/ping` (JWT) → `200 OK` или `401`

### Админ — медиа (контракт зафиксирован)
- `POST /api/admin/media/upload`  
  Guard: JWT (`Authorization: Bearer <token>`)  
  **multipart/form-data**:
  - `model`: строка (обяз.)
  - `file`: один или несколько файлов (обяз.)
  **Поведение**:
  - Сохраняет в `public/assets/doors/` как `encodeURIComponent(model).ext`
  - Возвращает JSON:
    ```json
    { "files": [ { "filename": "PO%20Base%201%2F1.jpg", "url": "/assets/doors/PO%20Base%201%2F1.jpg" } ] }
    ```

### Админ — импорт Doors
- `POST /api/admin/import/doors` (JWT)  
  **multipart/form-data**:
  - `file`: CSV/XLSX
  - `mapping`: строка JSON (опц.):  
    ```json
    {
      "mapping": {
        "model": "Модель",
        "style": "Стиль",
        "finish": "Покрытие",
        "domeo_color": "Цвет",
        "type": "Тип",
        "width": "Ширина",
        "height": "Высота",
        "rrc_price": "РРЦ",
        "photo_url": "Фото"
      },
      "uniqueBy": ["model","finish","domeo_color","type","width","height"],
      "sheet": "Каталог",
      "startRow": 2
    }
    ```
  **Валидаторы**:
  - Наличие колонок по `mapping`.
  - Преобразование типов (`width/height` → number, `rrc_price` → number).
  - Уникальность по `uniqueBy`.
  **Ответы**:
  - `200 OK` → `{ ok: true, inserted: N, updated: M, skipped: K, report_csv?: "/static/import_reports/..." }`
  - `409 Conflict` при конфликте РРЦ → `{ ok: false, conflicts: [...], conflicts_report: "/static/import_reports/conflicts_*.csv" }`
  - Иные ошибки → `4xx/5xx` с `message`.

### Каталог / домены
- `GET /api/catalog/doors/options`  
  Query: `style?`, `model?`, `finish?`, `color?`, `type?`, `width?`, `height?`  
  Ответ: `{ ok: true, domain: { style[], model[], finish[], color[], type[], width[], height[], kits[], handles[] } }`
- `GET /api/catalog/doors/models?style=...`  
  Ответ: `[ { model, style } ]`
- `GET /api/categories`  
  Ответ: `{ ok: true, items: [ { type, count } ], total }`  
  (реализация: `products.groupBy('type')` с фолбэком на `distinct`).

### Цена
- `POST /api/price/doors`  
  Вход: `{ selection: { style, model, finish, color, type, width, height, hardware_kit?:{id}, handle?:{id} } }`  
  Расчёт v0: `total = rrc_price + kit.price_rrc + handle.price_rrc` (см. `spec_kp_formulas.md`)  
  Ответ: `{ ok: true, currency: "RUB", base, breakdown[], total, sku_1c }`

### Экспорты (v1)
- `POST /api/cart/export/doors/kp` → HTML-таблица по spec_kp_formulas.md
- `POST /api/cart/export/doors/invoice` → HTML-таблица по spec_kp_formulas.md
- `POST /api/cart/export/doors/factory` → CSV по spec_kp_formulas.md
- Реализованы в API; проходят smoke-тесты (curl, Replit).

## Безопасность
- Guard JWT на `/api/admin/**`. Для smoke допускается токен `smoke`.
- OpenAPI-guard — зелёный (проверка схем и контрактов; см. CI).

## UX • `/doors`
- Вкладки: «Конфигуратор», «Админ».
- Конфигуратор: выбор стиля → модели → покрытие/цвет/тип/ширина/высота → комплект/ручка → цена → корзина → экспорт.
- Админ: регистрация/вход, импорт (файл + mapping JSON), загрузка фото (model + файлы), статус по итогам действий.
- SSR-маркер для CI: `<div data-smoke="compat-active" hidden />`.

## Ограничения/риски (текущая итерация)
- Нужны реальные фото в `public/assets/doors/` по правилу имени.
- CI `remote-smoke` требует secrets `DEV_BASE_URL`, `SMOKE_TOKEN`.
