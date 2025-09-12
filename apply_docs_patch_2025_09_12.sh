#!/usr/bin/env bash
set -euo pipefail

# ---------- master_spec.md ----------
cat > master_spec.md <<'EOF'
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
EOF

# ---------- admin_guide.md ----------
cat > admin_guide.md <<'EOF'
Title: Domeo — Admin Guide (Doors Pilot)
Owner: @Analyst (админка)
Last updated (Europe/Paris): 2025-09-12
Related: [Master Spec](./master_spec.md), [Roadmap](./roadmap.md), [State](./state.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md)

# Domeo No-Code Admin — Руководство администратора

## 1) Роли: Admin / Manager / Viewer

## 2) Быстрый старт категории
Wizard → Attributes (с `dependsOn`) → UI Flow → **Pricing DSL** → Export Templates → Fixtures → Import → **Preview** → Publish.  
**Auto-pricing:** предпросмотр мгновенно пересчитывает цену при изменении параметров.

## 3) Импорт прайсов (XLSX/CSV)
1) Загрузка файла → маппинг → валидация.  
2) Просмотр **CSV-отчёта конфликтов РРЦ** (`/static/import_reports/doors/*.csv`).  
3) Выбор **канонической РРЦ** (дефолт — минимальная) или ручной ввод.  
4) Подтверждение **safe UPSERT** (под защитой уникального product key).  
5) В журнале импорта сохраняется ссылка на CSV-отчёт.

## 4) Медиа-менеджер
Upload → `media_id` → выдача `/media/:id` и `/media/:id/fit?w=&h=`.

## 5) Предпросмотр и smoke-тесты
- **/catalog/doors/options** — dependsOn-домены.  
- **/price/doors** — **auto-pricing**.  
- **Экспорты:** КП/Счёт (HTML→PDF), Заказ (CSV/XLSX).
EOF

# ---------- data_import_guide_doors.md ----------
cat > data_import_guide_doors.md <<'EOF'
# Руководство по импорту данных (Пилот: Doors)
Last updated (Europe/Paris): 2025-09-12

## 1) Подготовка файла
XLSX/CSV, UTF-8. Анти-CSV инъекции: поля, начинающиеся с `=,+,-`, экранировать `'`.

## 2) Маппинг (пример)
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
**Обязательные поля:** `model, finish, color|domeo_color, type, width, height, rrc_price`.

## 3) Ключ витрины и индекс
**Ключ:** `(model, finish, color|domeo_color, type, width, height)` — одна комбинация.  
**БД:** обязателен **UNIQUE INDEX** (детект конфликтов и корректный UPSERT).

## 4) Конфликты РРЦ и UPSERT
1) Импорт помечает конфликт (одинаковый ключ, разные РРЦ).  
2) Формируется **CSV-отчёт**: `/static/import_reports/doors/*.csv`.  
3) **Канон РРЦ:** по умолчанию — **минимальная**, можно вручную переопределить.  
4) **safe UPSERT** (INSERT ON CONFLICT … DO UPDATE).

## 5) Smoke-тесты
`GET /catalog/doors/options`, `POST /price/doors`, экспорт КП/Счёт/Заказ.
EOF

# ---------- spec_kp_formulas.md ----------
cat > spec_kp_formulas.md <<'EOF'
Title: Domeo — Spec КП (вывод и формулы)
Owner: @Analyst + @TechLead
Last updated (Europe/Paris): 2025-09-12
Related: [Master Spec](./master_spec.md), [Admin Guide](./admin_guide.md), [Data Import Guide Doors](./data_import_guide_doors.md),
         [Roadmap](./roadmap.md), [State](./state.md), [Sync Guide](./sync_guide.md)

# Коммерческое предложение (КП)
1) № — сквозная нумерация дверей.  
2) Наименование — `{{Модель}} ({{Ш×В}}, {{Цвет}}{,{ Кромка: {{Если кромка да}}}})` по условиям.  
3) **Цена РРЦ** — из витрины.  
4) Количество — из корзины.  
5) Сумма — `Цена × Кол-во`.

## Подстрока для ручки
- Цена ручки = `handle.price_rrc`; **если пусто** → `round(handle.price_opt * handle.price_group_multiplier)`.  
- Кол-во = qty двери.  
- Формат: `Ручка: {{handle.name}} — {{handle.price_rrc_or_fallback}} × {{qty}} = {{total}}`.

# Заказ на фабрику
**Основная строка (дверь):** поля поставщика, размеры, `price_opt`; **Розничная** = `rrc_price + (hardware_kit?.price_rrc || 0)`, qty, суммы.  
**Доп. строка (ручка):** Наименование, опт/розн. цена, qty (= qty двери), суммы.

# Счёт (invoice)
Как в КП; ручка — как выше.

# Общие правила
Округление денежных; строки ручек не увеличивают счётчик «№». Экспорт: КП/Счёт — HTML (печать PDF), Заказ — CSV/XLSX.
EOF

# ---------- state.md ----------
cat > state.md <<'EOF'
Title: Domeo — State (Doors Pilot)
Owner: @Team Leads + @GPT
Last updated (Europe/Paris): 2025-09-12
Related: [Master Spec](./master_spec.md), [Roadmap](./roadmap.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md)

# STATE — Live (2025-09-12)

## Готово ✅
- Backend: `GET /catalog/doors/options` с **dependsOn** доменами.  
- Admin Import: **CSV-отчёт конфликтов РРЦ** + **safe UPSERT**.  
- Front: **auto-pricing**; экспорты: КП/Счёт (HTML), Заказ (CSV) — прототипы работают.

## В работе 🛠
- Импорт пилота Doors (прайсы/свойства/фото) — завершаем загрузку медиа и smoke-тесты.

## Блокеры ⛔
- Подтверждённые прайсы RRC (финальный срез) и стартовый медиа-набор.

## Следующие шаги ▶
- Smoke-тесты `/options`, `/price`, экспортов.  
- Проверка UNIQUE INDEX по product key в БД.  
- Обновление шаблонов КП/Счёт/Заказ.
EOF

# ---------- roadmap.md ----------
cat > roadmap.md <<'EOF'
Title: Domeo — Roadmap (Doors Pilot)
Owner: @PM + @GPT
Last updated (Europe/Paris): 2025-09-12
Related: [Master Spec](./master_spec.md), [State](./state.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md), [Sync Guide](./sync_guide.md)

# Roadmap — Domeo No-Code Calculators (Pilot: Doors)

## Milestones
**M1 — Импорт Doors (DoD)**  
- Прайс (RRC) и фото → импорт (валидация, отчёты), **разрешение конфликтов РРЦ**, **UPSERT**, smoke-тесты `/options`, `/price` (**auto-pricing**), экспорт **КП/Счёт/Заказ** → фиксация в `state.md`.

**M2 — CRUD калькуляторов + Pricing DSL**  
Admin CRUD категорий/правил; Pricing v1 подключён; тесты проходят.

**M3 — Корзина + экспорты**  
UI корзины + сохранение расчёта; КП/Счёт (PDF), Заказ (CSV/XLSX).

**M4 — Релиз**  
CI/CD; systemd; PIT-бэкапы; демо «новая категория без кода».

## Сроки (ориентир)
- **M1:** до 2025-09-20 (эндпоинт `/options` + импорт/конфликты готовы; остаются медиа и финальный прайс).  
- **M2:** до 2025-09-30.  
- **M3:** до 2025-10-10.  
- **M4:** до 2025-10-20.
EOF

echo "OK: files updated."
