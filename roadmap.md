
---

# roadmap.md

```md
# Roadmap — Domeo No-Code Calculators (Doors)

Обновлено: 2025-09-18

## Milestones

### M1 — Базовые контракты и медиахранилище ✅
- Admin JWT guard
- `POST /api/admin/media/upload` реализован и задокументирован
- UI: вкладка «Админ» с формой загрузки медиа
- **DoD**: файл сохраняется в `public/assets/doors/` как `encodeURIComponent(model).ext`; smoke проходит

### M2 — Импорт каталога (v1) ⏳
- Контракт импорта зафиксирован (mapping/uniqueBy/sheet/startRow)
- Валидации и отчёты (200/409) описаны
- **DoD**: успешный импорт CSV на стенде + UI статус «База загружена» и ссылка на отчёт

### M3 — Каталог/домены/модели ✅/⏳
- `GET /api/catalog/doors/options` — фильтры/домены
- `GET /api/catalog/doors/models?style=...`
- `GET /api/categories` (groupBy type / distinct fallback)
- **DoD**: UI строит домены и список моделей по стилю

### M4 — Конфигуратор и расчёт цены v1 ✅
- Формулы (`spec_kp_formulas.md`)
- UI референсная реализация
- **DoD**: `POST /api/price/doors` возвращает корректный расчет

#M5 — Экспорты (КП/Счёт/Фабрика) ⏳
+# M5 — Экспорты (КП/Счёт/Фабрика) ⏳
+- Реализовать шаблоны в API согласно `spec_kp_formulas.md`
+- **DoD**: CI remote-smoke проверяет `Content-Type` и непустое тело для:
+  - КП: HTML **и** PDF
+  - Счёт: HTML **и** PDF
+  - Фабрика: **XLSX**
+  Открытие/скачивание из UI работает.

### M6 — Фото/превью ✅/⏳
- Правило имени и приоритет поиска в UI
- **DoD**: реальная фотобаза подгружается в UI

### M7 — CI/CD и окружения ⏳
- `build-and-smoke` (локально) — ✅
- `remote-smoke` с `DEV_BASE_URL`/`SMOKE_TOKEN` — настроить
- **DoD**: зелёные прогоны на push + ручной запуск (workflow_dispatch)

### M8 — Replit окружение ⏳
- Docker/Procfile/Secrets
- **DoD**: сборка и запуск на Replit; smoke минимум: health/admin ping

## Ближайшие задачи (Next)
1) Доделать экспорт v1 в API (по спецификации).  
2) Настроить GitHub Secrets: `DEV_BASE_URL`, `SMOKE_TOKEN`; включить `remote-smoke`.  
3) Положить реальные фото в `public/assets/doors/` по правилам имени.  
4) Завести реплику окружения в Replit.

