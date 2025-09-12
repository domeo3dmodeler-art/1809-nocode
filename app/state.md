Title: Domeo — State (Doors Pilot)
Owner: @Team Leads + @GPT
Last updated (Europe/Paris): 2025-09-11
Related: [Master Spec](./master_spec.md), [Roadmap](./roadmap.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md)

# STATE — Live (2025-09-11)

---

## Роли
- **GPT (виртуальная команда):** единственный разработчик проекта. Ведёт код (backend, frontend, CI/CD), синхронизирует документацию (`master_spec.md`, `roadmap.md`, `state.md`, `admin_guide.md`, `data_import_guide_doors.md`, `spec_kp_formulas.md`, `sync_guide.md`).

---

## Готово ✅
- ВМ в Yandex Cloud подготовлена (SSH, sudo).
- Node 20, Docker, Postgres (Docker) развёрнуты.
- Приложение Next.js собрано (prod) и запущено.
- Nginx сконфигурирован как reverse proxy на :80 → :3000.
- Prisma миграции применены (`init`), БД синхронизирована.
- Базовая админка доступна по /admin (JWT-сид админа).
- API /api/auth/login и /api/categories работают.

---

## В работе 🛠
- Админ: CRUD калькуляторов (schemaJson, rulesJson).
- UI рендер форм по JSON-схеме + предпросмотр.
- Мини-движок правил (Pricing v1) — подключение к калькулятору.
- Импорт пилота Doors (прайсы/свойства/фото) в БД.

---

## Блокеры ⛔
- Подтверждённые прайсы RRC для Doors.
- Медиа каталога (стартовый набор, пути/алиасы) — не загружены.

---

## Следующие шаги ▶
- Добавить раздел «Калькуляторы» в админке (CRUD + JSON-редакторы).
- Включить движок правил ценообразования (PriceRule.rulesJson).
- Импортировать исходные CSV/XLSX Doors и проверить выборки.
- Корзина + сохранение расчёта (Quote) + экспорт КП (PDF/Excel).
- Обернуть запуск в systemd-unit (`domeo.service`) для автостарта.

---

## DoD — Импорт Doors ✅
- [ ] Собран стартовый прайс (RRC) и фото.  
- [ ] Загружен в админку, проверен маппинг.  
- [ ] Пройдена валидация, ошибки устранены.  
- [ ] Конфликты РРЦ разрешены, выбран канон.  
- [ ] Выполнен UPSERT в БД.  
- [ ] Smoke-тесты `/options`, `/price`, экспорт КП/Заказ прошли.  
- [ ] В `state.md` зафиксирован итог (ссылка на отчёт, added/updated/skipped).  
