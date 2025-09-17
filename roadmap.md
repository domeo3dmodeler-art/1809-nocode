Title: Domeo — Roadmap (Doors Pilot)
Owner: @PM + @GPT
Last updated (Europe/Paris): 2025-09-13
Related: [Master Spec](./master_spec.md), [State](./state.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md), [Sync Guide](./sync_guide.md)

# Roadmap — Domeo No-Code Calculators (Pilot: Doors)

**Цель:** довести пилот *Doors* до релиза и отработать полный цикл (архитектура → импорт → расчёты → админка → экспорт).

---

## 0. Роли и ответственность
- **PM:** контроль сроков и DoD.  
- **GPT (виртуальная команда):** единственный разработчик проекта; код, CI/CD, синхронизация «истин».

---

## Milestones — Doors MVP (актуализировано 2025-09-13)

### М1: Базовый конфигуратор + прайс + экспорты — ✅ Готово
- /doors UI (dependsOn + автопрайсинг + корзина + экспорт)
- /api/catalog/doors/{models,options}
- /api/price/doors
- /api/cart/export/doors/{kp,invoice,factory}
- products + kits + handles (схемы и демо-данные)
- import doors/generic через админку

### М2: Импорт и качество данных — ⏳ В работе
- 409 CSV-конфликты + Force (реализовано)
- Документация Import Guide (обновлена)
- Расширение набора SKU (10–50 демонстрационных)

### М3: Защита/роль админа + OpenAPI + тесты — 🗓
- JWT/роль admin для `/api/admin/**`
- OpenAPI синхронизация `scripts/spec_guard.py`
- e2e smoke-скрипты, CI в PR

### М4: Новые категории (generic→адаптеры) — 🗓
- Проработка адаптера `windows` (или иная категория): схема БД, API, UI вкладка
- Документация по новой категории

---

## Критерии готовности (DoD)
- Категория *Doors* полностью работает на VM.  
- Импорт XLSX/CSV даёт корректный каталог; конфликты РРЦ разрешаются.  
- `/price` считает корректно; экспорты формируются.  
- «Истины» синхронизированы; smoke зелёный.

---

## Сроки (ориентир)
- **M1:** 2025-09-13 (готово).  
- **M2:** до 2025-09-20.  
- **M3:** до 2025-09-30.  
- **M4 (релиз):** до 2025-10-20.

---

## Зависимости
- Прайсы и фото Doors от поставщиков.  
- Шаблоны КП/Заказа.  
- CI/CD пайплайн (GitHub Actions).  
- PostgreSQL в Yandex Cloud.
