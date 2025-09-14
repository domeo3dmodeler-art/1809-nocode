# Roadmap — Domeo No-Code Calculators (Doors pilot)

> Источник истины. Дубли запрещены. Последнее обновление: 2025-09-14. MR: (TBD).

## Milestones (Doors pilot)
- [x] CI smoke v2 (guard-openapi, remote-smoke, prod-smoke)
- [x] Admin API JWT guard (middleware 401)
- [x] CSV import endpoint `/api/admin/import/doors`
- [ ] Consolidate sources of truth (этот MR)
- [ ] Import Guide: формат CSV, валидации, пример ответа, `IMPORT_TARGET_MODEL`
- [ ] UI iteration: галерея/плашки по `model`/`sku_1c`, «Недавние конфигурации», обязательные поля
- [ ] CI: smoke экспортов `/api/cart/export/doors/{kp,invoice,factory}`
- [ ] Prod-Smoke усиление: артефакты логов, таймауты

## DoD / Acceptance
Для каждого milestone определены измеримые критерии. Все изменения фиксируются в соответствующих .md в том же MR, согласно `sync_guide.md`.

### DoD: Consolidate sources of truth
- Дубли `app/roadmap.md`, `app/state.md` удалены
- Корневые `roadmap.md`, `state.md` содержат актуальные статусы/вехи
- `sync_guide.md` обновлён разделом про истину Roadmap/State
- Репозиторий не содержит ссылок на `app/roadmap.md`/`app/state.md`

### DoD: Import Guide расширен
- `data_import_guide_doors.md` описывает минимальный/расширенный CSV, допустимые значения, валидации, пример ответа
- Описан `IMPORT_TARGET_MODEL` и соответствие Prisma-модели; примеры импорта и ошибок

### DoD: UI iteration
- На `/doors` отображаются превью из импортированных данных (связка `model`/`sku_1c`)
- Реализованы «Недавние конфигурации»
- Обязательные поля подсвечиваются; не даём оформить заказ, если не заполнены

### DoD: CI — экспорт
- В CI есть smoke на `/api/cart/export/doors/{kp,invoice,factory}`: 200 + базовая валидация содержимого

### DoD: Prod-Smoke усиление
- В workflow есть выгрузка логов как артефакт, настроены таймауты

## Dependencies & Sync
- Любые изменения логики/формул → `master_spec.md` + профильные гайды.
- План/сроки/статусы → `roadmap.md`, `state.md` (в том же MR). См. `sync_guide.md`.
