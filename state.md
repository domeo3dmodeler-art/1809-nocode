Title: Domeo — State (Doors Pilot)
Owner: @Team Leads + @GPT
Last updated (Europe/Paris): 2025-09-12
Related: [Master Spec](./master_spec.md), [Roadmap](./roadmap.md), [Admin Guide](./admin_guide.md),
         [Data Import Guide Doors](./data_import_guide_doors.md), [Spec КП и формулы](./spec_kp_formulas.md)

# STATE — Live (2025-09-12)

## Готово ✅
- Backend: `GET /catalog/doors/options` с **dependsOn** доменами.  
- Admin Import: **CSV-отчёт конфликтов РРЦ** + **safe UPSERT**.  
- Front: **auto-pricing**; экспорты: КП/Счёт (HTML), Заказ (CSV) — прототипы работают.

## В работе 🛠
- Импорт пилота Doors (прайсы/свойства/фото) — завершаем загрузку медиа и smoke-тесты.

## Блокеры ⛔
- Подтверждённые прайсы RRC (финальный срез) и стартовый медиа-набор.

## Следующие шаги ▶
- Smoke-тесты `/options`, `/price`, экспортов.  
- Проверка UNIQUE INDEX по product key в БД.  
- Обновление шаблонов КП/Счёт/Заказ.
