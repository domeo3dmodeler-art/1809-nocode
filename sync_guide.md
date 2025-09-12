# Sync Guide (Domeo No-Code Calculators)

Единый источник истины по синхронизации артефактов проекта.

## Принципы
- По каждой области — один источник истины в корне репозитория:
  - master_spec.md, admin_guide.md, data_import_guide_doors.md, spec_kp_formulas.md, state.md, roadmap.md, sync_guide.md.
- Дублей в `app/` быть не должно.
- Любые изменения логики фиксируются в master_spec.md и профильных гайдах тем же коммитом (см. DoD).
- Изменения сроков/вех отражаются синхронно в roadmap.md и state.md.

## Процесс
- Ежедневно: актуализируем state.md.
- Еженедельно: обновляем roadmap.md, сверяем admin_guide.md.
- По событию: меняем master_spec.md + связанный файл(ы) (Admin/Import/Spec КП).
- PR/Commit должен проходить проверки: `scripts/verify_truths.sh` и `scripts/spec_guard.py`.

## Таблица связей (фрагмент)
- master_spec.md ↔ admin_guide.md / data_import_guide_doors.md / spec_kp_formulas.md (логика/формулы/UX)
- roadmap.md ↔ state.md (сроки ↔ фактический статус)

