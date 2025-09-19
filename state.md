\# State — текущее состояние (Doors)

Обновлено: 2025-09-18



\## Репозиторий / ветки

\- Repo: `1209-nocode`

\- Рабочая ветка: `develop` (ранее `feature/doors-next-api`)



\## Сервер / локальный dev

\- Next 14 dev: `http://localhost:3000` — ОК

\- Health: `GET /api/health` → 204 — ОК

\- Admin ping: `GET /api/admin/ping` с токеном `smoke` → 200 — ОК



+## UI `/doors`
+
+- Вкладки: Конфигуратор/Админ — есть
+- Импорт: форма + Mapping JSON — есть
+- Загрузка медиа: форма (model + files[]) — есть
+- Кнопки экспорта: **КП/Счёт/Фабрика** — интегрированы (КП/Счёт: HTML/PDF; Фабрика: XLSX)
+- Маркер SSR для CI: есть



\## API

\- `/api/admin/media/upload` — \*\*реализовано\*\*, сохраняет файлы в `public/assets/doors/` (ОК)

\- `/api/admin/import/doors` — контракт зафиксирован; валидации/409 — \*\*описано\*\*, реализация в процессе стабилизации

\- `/api/catalog/doors/options` — работает

\- `/api/catalog/doors/models` — работает

\- `/api/categories` — работает (groupBy/или distinct)

+- `/api/price/doors` — v1 логика по спецификации — **готово**
+- Экспорты `/api/cart/export/doors/{kp,invoice,factory}` — **готово (v1)**:
+  - `kp`, `invoice`: HTML + `?format=pdf`
+  - `factory`: XLSX



\## Медиа

\- Контракт и поведение проверены curl (ОК)

\- Логика поиска превью: SKU → encodeURIComponent(model) → slug(model) (ОК)



\## CI

\- Workflow `CI` обновлён, лог сборки пишется; health-ожидание 120s; показ хвоста лога при падении — ОК

\- `remote-smoke` с guard по secrets — ОК (нужно задать `DEV\_BASE\_URL`, `SMOKE\_TOKEN`)



\## Блокеры / риски

\- Требуется реализовать экспорты в API (вместо стабов).

\- Нужны реальные изображения в `public/assets/doors/`.



+## To-Do (минимум)
+1) Завершить настройку `remote-smoke` (GitHub Secrets: `DEV_BASE_URL`, `SMOKE_TOKEN`).  
+2) Проверить импорт CSV/XLSX с реальными данными; убедиться в корректности экспортов.  
+3) Подготовить Replit окружение.