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

## Экспорты (Doors)

Для проверки интеграции доступны заглушки v1:

    # КП
    curl -sS -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/cart/export/doors/kp" | jq .

    # Счёт
    curl -sS -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/cart/export/doors/invoice" | jq .

    # Заказ на фабрику
    curl -sS -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/cart/export/doors/factory" | jq .

Ожидаемый ответ:
    {"ok": true, "type": "kp|invoice|factory", "received": {}}
