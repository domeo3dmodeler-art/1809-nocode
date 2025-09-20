\# State — текущее состояние (Doors)

Обновлено: 2025-09-19



\## Репозиторий / ветки

\- Repo: `1209-nocode`

\- Рабочая ветка: `develop` (ранее `feature/doors-next-api`)



\## Сервер / локальный dev

\- Next 14 dev: `http://localhost:3000` — ОК

\- Health: `GET /api/health` → 204 — ОК

\- Admin ping: `GET /api/admin/ping` с токеном `smoke` → 200 — ОК



- UI `/doors`: вкладки «Конфигуратор» и «Админ».
- Экспорты Doors: ✅ v1 готово и проверено (Replit + YC):
  - `/api/cart/export/doors/kp` → HTML/PDF
  - `/api/cart/export/doors/invoice` → HTML/PDF
  - `/api/cart/export/doors/factory` → CSV (XLSX в M7)
- PDF-рендер: `puppeteer-core` + `@sparticuz/chromium`, runtime nodejs.
- Build: зелёный (Next.js 14.2.5). Typecheck OK.
- Админ: импорт прайса (CSV/XLSX) + загрузка медиа (сохр. в `public/assets/doors/`).
- Health (YC 130.193.40.35): `GET /api/health` → **200 OK** через nginx.



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


### Блокеры / To-Do
- [ ] GitHub Secrets для remote-smoke: `DEV_BASE_URL`, `SMOKE_TOKEN`.
- [ ] Наполнить `public/assets/doors/` реальными изображениями.
- [ ] Автодеплой из GitHub на YC (workflow) или скрипт `deploy_yc.sh`.
## Сборка / Prisma (2025-09-19)
- Health на YC возвращает 204 (устранён 500): фикс route.ts (force-dynamic, runtime=nodejs).
- Build чистый: Prisma не выполняется на SSG; добавлены client-маркировки на страницах админ/конфигуратор.
- API routes каталога/категорий принудительно динамические (runtime).

- Health на YC: 204 (фикс подтверждён 2025-09-20)
