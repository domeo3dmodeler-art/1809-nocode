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


<-- Доп. демо-SKU для витрины Doors ( идемпотентно merged from app/roadmap.md (CI Smoke v2) -->
## CI Smoke v2
- ✅ Token-200 check on /api/admin/ping
- ✅ Prod-smoke (next build & start) in GitHub Actions

