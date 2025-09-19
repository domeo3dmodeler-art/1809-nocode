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

Экспорты: КП/Счёт (HTML→PDF), Заказ (XLSX).

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

+Экспорты (Doors) — v1
+
+Формируются на стороне API по `spec_kp_formulas.md` и возвращают готовый контент для открытия/скачивания.
+
+Примеры smoke-проверок (локально):
+
+## КП (HTML)
+cart='{"cart":[{"model":"PO Base 1/1","width":800,"height":2000,"color":"Белый","qty":1}]}'
+curl -fsSI -X POST -H 'Content-Type: application/json' \
+  -d "$cart" "$BASE_URL/api/cart/export/doors/kp" | grep -i 'text/html'
+curl -fsS -X POST -H 'Content-Type: application/json' \
+  -d "$cart" "$BASE_URL/api/cart/export/doors/kp" > /tmp/kp.html && echo "saved: /tmp/kp.html"
+
+## КП (PDF)
+curl -fsSI -X POST -H 'Content-Type: application/json' \
+  -d "$cart" "$BASE_URL/api/cart/export/doors/kp?format=pdf" | grep -i 'application/pdf'
+
+## Счёт (HTML)
+curl -fsSI -X POST -H 'Content-Type: application/json' \
+  -d "$cart" "$BASE_URL/api/cart/export/doors/invoice" | grep -i 'text/html'
+curl -fsS -X POST -H 'Content-Type: application/json' \
+  -d "$cart" "$BASE_URL/api/cart/export/doors/invoice" > /tmp/invoice.html && echo "saved: /tmp/invoice.html"
+
+## Счёт (PDF)
+curl -fsSI -X POST -H 'Content-Type: application/json' \
+  -d "$cart" "$BASE_URL/api/cart/export/doors/invoice?format=pdf" | grep -i 'application/pdf'
+
+## Заказ на фабрику (XLSX)
+curl -fsSI -X POST -H 'Content-Type: application/json' \
+  -d "$cart" "$BASE_URL/api/cart/export/doors/factory?format=xlsx" | grep -i 'spreadsheetml'