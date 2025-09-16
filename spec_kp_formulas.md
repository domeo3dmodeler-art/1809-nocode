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

## Экспорты Doors — контракт v1 (stub)

Эндпоинты (временные заглушки v1):

- POST /api/cart/export/doors/kp
- POST /api/cart/export/doors/invoice
- POST /api/cart/export/doors/factory

Запрос: application/json, поля произвольные (временно).
Ответ 200 (JSON):
    { "ok": true, "type": "kp|invoice|factory", "received": {} }

Примечания:
- Контракт зафиксирован в app/openapi.yaml (schemas: ExportRequest, ExportResponse).
- Цель v1 — стабильный маркер для интеграций и smoke (strict проверка ok==true и корректного type).
- Миграция без ломающего изменения: v1.1 — введём строгую схему ExportDoorsRequest/ExportDoorsResponse; v1.2 — генерация PDF/номер документа.

Обновлено: 2025-09-16
