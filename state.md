State — Domeo No-Code Calculators (Doors pilot)

Источник истины. Дубли запрещены. Последнее обновление: 2025-09-14. MR: (TBD).

Готово

JWT guard для админ-API (middleware 401, матчер /api/admin/:path*)

OpenAPI guard (scripts/spec_guard.py) проходит по app/openapi.yaml

Smoke-тесты (API+UI) проходят: /api/health, /api/admin/ping (401/200), SSR-маркер /doors

CI v2: guard-openapi, remote-smoke (при наличии DEV_BASE_URL), prod-smoke (локальный билд+старт+smoke)

Импорт CSV /api/admin/import/doors работает (multipart/form-data, поле file)

Медиа upload /api/admin/media/upload реализован (multipart model + file[]), сохраняет в public/assets/doors/encodeURIComponent(model).ext; smoke OK

UI /doors: добавлена вкладка «Админ» (Login/Register), формы «Импорт CSV» и «Загрузка фото»; логика поиска фото: SKU → encodeURIComponent(model) → slug(model)

В работе

Сведение источников истины (этот MR)

Ближайшие задачи

Дописать data_import_guide_doors.md (формат CSV/валидации/пример ответа/IMPORT_TARGET_MODEL)

UI итерация: галерея, «Недавние конфигурации», обязательные поля

CI: smoke для экспортов; усиление prod-smoke (артефакты логов, таймауты)

Блокеры / Риски

Нет

Ссылки

master_spec.md

admin_guide.md

data_import_guide_doors.md

spec_kp_formulas.md

sync_guide.md

Экспорты Doors — состояние

Экспорты Doors: реализован v1 stub, эндпоинты /api/cart/export/doors/{kp,invoice,factory}.

Smoke: strict OK (проверка JSON ответа).

OpenAPI: обновлён (ExportRequest, ExportResponse).

Обновлено: 2025-09-16