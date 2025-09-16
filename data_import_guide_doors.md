Руководство по импорту данных (Пилот: Doors)

Last updated (Europe/Paris): 2025-09-12

1) Подготовка файла

XLSX/CSV, UTF-8. Анти-CSV инъекции: поля, начинающиеся с =,+,-, экранировать '.

2) Маппинг (пример)
{
  "mapping": {
    "model": "Модель",
    "style": "Стиль",
    "finish": "Покрытие",
    "domeo_color": "Цвет",
    "type": "Тип",
    "width": "Ширина",
    "height": "Высота",
    "rrc_price": "РРЦ",
    "photo_url": "Фото"
  },
  "uniqueBy": ["model","finish","domeo_color","type","width","height"],
  "sheet": "Каталог",
  "startRow": 2
}


Обязательные поля: model, finish, color|domeo_color, type, width, height, rrc_price.

3) Ключ витрины и индекс

Ключ: (model, finish, color|domeo_color, type, width, height) — одна комбинация.
БД: обязателен UNIQUE INDEX (детект конфликтов и корректный UPSERT).

4) Конфликты РРЦ и UPSERT

Импорт помечает конфликт (одинаковый ключ, разные РРЦ).

Формируется CSV-отчёт: /static/import_reports/doors/*.csv.

Канон РРЦ: по умолчанию — минимальная, можно вручную переопределить.

safe UPSERT (INSERT ON CONFLICT … DO UPDATE).

5) Smoke-тесты

GET /catalog/doors/options, POST /price/doors, экспорт КП/Счёт/Заказ.

Конфликты РРЦ (409)

Если в импорте для одинакового ключа (model, finish, color, type, width, height) встречаются разные rrc_price (или расходятся с ценой в БД),
эндпоинт возвращает 409 и CSV-отчёт со столбцами:
model,finish,color,type,width,height,rrc_price_existing,rrc_price_import,resolution.
Рекомендуемая стратегия resolution: выровнять цены и повторить импорт.

6) Фото (Doors) — правила именования и хранения

Назначение: обеспечить предсказуемую подстановку превью на странице /doors.

Правила:

Имя файла: encodeURIComponent(model).ext
Пример: PO Base 1/1 → PO%20Base%201%2F1.jpg

Каталог хранения: public/assets/doors/

Поддерживаемые форматы: jpg, png, webp (рекомендовано: jpg или webp).

Регистр и пробелы: используйте точное значение model; пробелы/слэши/спецсимволы кодируются encodeURIComponent.

Поиск изображения в UI (приоритет):

по SKU (если задан),

по encodeURIComponent(model),

по slug(model).

Проверка:

После загрузки фото убедитесь, что файл доступен по пути /assets/doors/{encodeURIComponent(model)}.ext.

Для быстрой валидации можно выполнить листинг каталога проекта:
ls -l ~/domeo-mvp/app/public/assets/doors/ | head

Примечание: Логика приоритета отображения согласована с UI /doors и зафиксирована как часть контракта категории Doors.