Title: Domeo — Master Spec (Doors Pilot)
Owner: @TechLead + @Product
Last updated (Europe/Paris): 2025-09-12
Related: [Roadmap](./roadmap.md), [State](./state.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md),
         [Sync Guide](./sync_guide.md)

# Domeo No-Code Calculators — Master Spec (Pilot: Doors)

**Версия:** 0.4 (2025-09-12)
**Платформы:** Yandex Cloud (prod), GitHub (код/CI), Replit (стенд/демо).

## 1. Цель
Каталог → Конфигуратор → Корзина (онлайн-редактор, **auto-pricing**) → КП/Счёт (HTML→PDF) → «Заказ на фабрику» (CSV/XLSX).

## 2. Роли
Комплектатор, Admin, Manager, Viewer. GPT — единственный разработчик и владелец синхронизации «истин».

## 3. Пользовательские сценарии
- Конфигуратор: **finish, color, type, width, height**, выбор `hardware_kit` и `handle`.
- Корзина: редактирование строки, **дельта** к базовой цене; кнопки **КП / Счёт / Заказ**.

## 4. Админка No-Code
Wizard: Основное → Attributes (с `dependsOn`) → UI Flow → Pricing DSL → Export Templates → Fixtures → Import.

## 5. Бизнес-правила (Doors)
- **Product key (витрина):** `(model, finish, color|domeo_color, type, width, height)` ↔ одна комбинация.
  **БД:** обязателен **UNIQUE INDEX** `products(model,finish,color,type,width,height)` (для предотвращения дублей и корректного UPSERT).
- **РРЦ единая на ключ.** Разные РРЦ от поставщиков → конфликт → отчёт + выбор канона (по умолчанию **минимальная**).
- **Экспорт:**
  - **КП, Счёт** — HTML (печать/экспорт в PDF).
  - **Заказ на фабрику** — CSV/XLSX.
  - Если выбрана **ручка** — отдельная строка после двери (qty = qty двери).
- **Дельта в корзине:** `(текущая цена) − (базовая цена при добавлении)`.
- **Auto-pricing:** цена пересчитывается мгновенно при изменении любого параметра.

## 6. Импорт и конфликты РРЦ
Импорт XLSX/CSV → валидация → **CSV-отчёт конфликтов** `/static/import_reports/doors/*.csv` → выбор канона → **safe UPSERT**.

## 7. API (выжимка)
- `GET /catalog/doors/options` — **dependsOn** домены. Цепочка: `style → model → finish → color → type → width → height`.
  `kits`/`handles` подмешиваются из справочников.
- `POST /price/doors` — расчёт (используется auto-pricing).
- `POST /cart/export/doors/{kp|invoice}` — HTML (под печать PDF).
- `POST /cart/export/doors/factory` — CSV/XLSX.

## 8. Правило цен ручек (КП/Счёт)
Цена ручки = `handle.price_rrc`; если пусто → `round(handle.price_opt * handle.price_group_multiplier)`.

## 9. Чеклисты приёмки
Options учитывает dependsOn; `/price` считает корректно; экспорты формируются; импорт завершает UPSERT; уникальный индекс присутствует.

## API (Next /api/*)

GET /health
GET /catalog/doors/models
GET /catalog/doors/options
POST /price/doors
POST /cart/export/doors/kp
POST /cart/export/doors/invoice
POST /cart/export/doors/factory
POST /admin/import/doors
POST /admin/media/upload
POST /auth/register
POST /auth/login

### /api/catalog/doors/options — dependsOn
Фильтры принимаются через query: `?style=&model=&finish=&color=&type=&width=&height=`.
Каждый массив опций считается как DISTINCT по таблице `products` с учётом текущих выбранных значений.
Также возвращаются `kits[]` и `handles[]` (цены подтягиваются из соответствующих таблиц).
