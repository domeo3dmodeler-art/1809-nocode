Title: Domeo — Admin Guide (Doors Pilot)
Owner: @Analyst (админка)
Last updated (Europe/Paris): 2025-09-12
Related: Master Spec
, Roadmap
, State
,
     Data Import Guide Doors
, Spec КП и формулы

Domeo No-Code Admin — Руководство администратора
1) Роли: Admin / Manager / Viewer
2) Быстрый старт категории

Wizard → Attributes (с dependsOn) → UI Flow → Pricing DSL → Export Templates → Fixtures → Import → Preview → Publish.
Auto-pricing: предпросмотр мгновенно пересчитывает цену при изменении параметров.

3) Импорт прайсов (XLSX/CSV)

Загрузка файла → маппинг → валидация.

Просмотр CSV-отчёта конфликтов РРЦ (/static/import_reports/doors/*.csv).

Выбор канонической РРЦ (дефолт — минимальная) или ручной ввод.

Подтверждение safe UPSERT (под защитой уникального product key).

В журнале импорта сохраняется ссылка на CSV-отчёт.

4) Медиа-менеджер

Upload → media_id → выдача /media/:id и /media/:id/fit?w=&h=.

5) Предпросмотр и smoke-тесты

/catalog/doors/options — dependsOn-домены.

/price/doors — auto-pricing.

Экспорты: КП/Счёт (HTML→PDF), Заказ (CSV/XLSX).

6) Загрузка фото (Doors) — прямой аплоад

Эндпоинт: POST /api/admin/media/upload (JWT, Bearer).
Назначение: загрузка фото модели двери напрямую в публичное хранилище UI.

Формат:

Content-Type: multipart/form-data

Поля:

model — строка (отображаемая «Модель»).

file[] — один или несколько файлов изображений (jpeg/png/webp).

Правило имени и хранения:

Имя файла: encodeURIComponent(model).ext

Каталог: public/assets/doors/

Пример результата: PO Base 1/1 → public/assets/doors/PO%20Base%201%2F1.jpg

Пример smoke (локально):

curl -sS -H 'Authorization: Bearer smoke' \
  -F 'model=PO Base 1/1' \
  -F 'file=@/etc/hosts;filename=example.jpg;type=image/jpeg' \
  http://localhost:3000/api/admin/media/upload | jq .


Ожидаемый ответ (JSON):

{
  "files": [
    {
      "filename": "PO%20Base%201%2F1.jpg",
      "url": "/assets/doors/PO%20Base%201%2F1.jpg"
    }
  ]
}


Отображение в UI (/doors): поиск картинки по приоритету

SKU → 2) encodeURIComponent(model) → 3) slug(model).

Примечание: Раздел «Медиа-менеджер» продолжает работать для общего кейса (/media/:id), а данный эндпоинт — специализирован под Doors.

Экспорты (Doors)

Для проверки интеграции доступны заглушки v1:

# КП
curl -sS -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/cart/export/doors/kp" | jq .

# Счёт
curl -sS -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/cart/export/doors/invoice" | jq .

# Заказ на фабрику
curl -sS -X POST -H 'Content-Type: application/json' -d '{}' "$BASE_URL/api/cart/export/doors/factory" | jq .


Ожидаемый ответ:

{"ok": true, "type": "kp|invoice|factory", "received": {}}