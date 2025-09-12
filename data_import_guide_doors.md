# Руководство по импорту данных (Пилот: Doors)
Last updated (Europe/Paris): 2025-09-12

## 1) Подготовка файла
XLSX/CSV, UTF-8. Анти-CSV инъекции: поля, начинающиеся с `=,+,-`, экранировать `'`.

## 2) Маппинг (пример)
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
**Обязательные поля:** `model, finish, color|domeo_color, type, width, height, rrc_price`.

## 3) Ключ витрины и индекс
**Ключ:** `(model, finish, color|domeo_color, type, width, height)` — одна комбинация.  
**БД:** обязателен **UNIQUE INDEX** (детект конфликтов и корректный UPSERT).

## 4) Конфликты РРЦ и UPSERT
1) Импорт помечает конфликт (одинаковый ключ, разные РРЦ).  
2) Формируется **CSV-отчёт**: `/static/import_reports/doors/*.csv`.  
3) **Канон РРЦ:** по умолчанию — **минимальная**, можно вручную переопределить.  
4) **safe UPSERT** (INSERT ON CONFLICT … DO UPDATE).

## 5) Smoke-тесты
`GET /catalog/doors/options`, `POST /price/doors`, экспорт КП/Счёт/Заказ.

## Конфликты РРЦ (409)
Если в импорте для одинакового ключа (model, finish, color, type, width, height) встречаются разные rrc_price (или расходятся с ценой в БД),
эндпоинт возвращает 409 и CSV-отчёт со столбцами:
`model,finish,color,type,width,height,rrc_price_existing,rrc_price_import,resolution`.
Рекомендуемая стратегия `resolution`: выровнять цены и повторить импорт.
