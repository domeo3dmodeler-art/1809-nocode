# Domeo No-Code Calculators — Master Spec (Doors)

Owner: @Product + @TechLead  
Last updated: 2025-09-20  
Related: [Admin Guide](./admin_guide.md), [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП Formulas](./spec_kp_formulas.md), [Roadmap](./roadmap.md), [State](./state.md), [Sync Guide](./sync_guide.md)

---

## Архитектура
- Next.js 14.2.5, App Router.
- Prisma ORM (PostgreSQL).
- Хранилище: `public/assets/doors/` (фото).
- PDF: `puppeteer-core` + `@sparticuz/chromium`.
- CI: GitHub Actions (`ci.yml`, `remote-smoke.yml`).

---

## Бизнес-область: Doors

### Сущности
- **Каталог**: поставщики, коллекции, модели, цвета, отделки.
- **Корзина**: позиции (модель + размеры + цвет + qty + опции).
- **КП/Invoice**: таблицы с подсчётами по правилам (`spec_kp_formulas.md`).
- **Фабрика**: заказ в CSV/XLSX.

---

## API контракты

### Health / Admin
- `GET /api/health` → `204 No Content`.
- `GET /api/admin/ping` (JWT Bearer) → `200 OK`.

### Media
- `POST /api/admin/media/upload` → загружает в `public/assets/doors/`.

### Import
- `POST /api/admin/import/doors` → см. [Data Import Guide Doors](./data_import_guide_doors.md).

### Catalog
- `GET /api/catalog/doors/options` → стили/фильтры.
- `GET /api/catalog/doors/models?style=…`.
- `GET /api/categories` → distinct по type.

### Pricing
- `POST /api/price/doors`  
  Body: `{ model, width, height, color, qty, options }`  
  Response: `{ unitPrice, total }`.

---

## Экспорты Doors (v1)

### Контракт корзины
`cart: { items: CartItem[] }`

`CartItem`:
- `model: string`
- `width: number`
- `height: number`
- `color?: string`
- `qty: number`
- `unitPrice?: number`
- Дополнительно: `type?`, `finish?`, `hardwareKitId?`, `handleId?`, `edge?`, `edge_note?`, `sku_1c?`

---

### KP
`POST /api/cart/export/doors/kp?format=pdf`  
Body: `{ "cart": { "items": [...] } }`  
Response: `application/pdf`

### Invoice
`POST /api/cart/export/doors/invoice?format=pdf`  
Body: аналогично KP.  
Response: `application/pdf`

### Factory (v1)
`POST /api/cart/export/doors/factory`  
Response: `text/csv; charset=utf-8` (XLSX в M7)

---

## Админка
Сценарии UI описаны в [Admin Guide](./admin_guide.md).

---

## UX
- Страницы:
  - `/doors` — конфигуратор.
  - `/admin` — импорт + медиа.
- Флоу:
  1. Импорт прайса.
  2. Настройка моделей.
  3. Конфигуратор → корзина.
  4. Экспорт КП/Invoice (PDF).
  5. Экспорт заказа на фабрику (CSV/XLSX).

---

## Версионирование
- v1.3 (2025-09-20): убран HTML-экспорт (оставлен только PDF/XLSX).
- v1.2 (2025-09-18): добавлен Invoice.
- v1.1 (2025-09-15): Factory CSV.
- v1.0 (2025-09-10): базовый контракт.
