# 📊 Как посмотреть какая информация была загружена

## ✅ **Способы просмотра загруженной информации:**

### **1. Через API (JSON формат):**
```bash
curl "http://localhost:3000/api/admin/import/doors/products"
```

### **2. Через API (CSV формат):**
```bash
curl "http://localhost:3000/api/admin/import/doors/products?format=csv"
```

### **3. Через PowerShell:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/import/doors/products"
$data = $response.Content | ConvertFrom-Json
Write-Host "Всего товаров: $($data.total)"
```

### **4. Через интерфейс:**
- Откройте `http://localhost:3000/doors`
- Переключитесь на вкладку "Админ"
- В разделе "Импорт прайса" будет показана статистика

## 📋 **Что можно посмотреть:**

### **Общая статистика:**
- ✅ **Всего товаров**: 6
- ✅ **Общая стоимость**: 102,000 ₽
- ✅ **Дата импорта**: 2025-09-23T08:56:55.786Z
- ✅ **Файл импорта**: example_price.csv

### **Статистика по стилям:**
- 🎨 **Современная**: 2 товара
- 🎨 **Классика**: 2 товара  
- 🎨 **Неоклассика**: 1 товар
- 🎨 **Скрытая**: 1 товар

### **Статистика по ценам:**
- 💰 **до 16000**: 2 товара
- 💰 **16000-18000**: 1 товар
- 💰 **18000+**: 3 товара

### **Детальная информация о каждом товаре:**
- 📦 **Артикул поставщика** (уникальный ID)
- 📦 **Модель** (название товара)
- 📦 **Стиль** (категория)
- 📦 **Покрытие** (материал)
- 📦 **Цвет** (вариант цвета)
- 📦 **Размер** (ширина x высота в мм)
- 📦 **Цена РРЦ** (рекомендованная розничная цена)
- 📦 **Фото** (путь к изображению)
- 📦 **Дата импорта** (когда загружен)
- 📦 **Файл импорта** (откуда загружен)

## 🔍 **Примеры загруженных товаров:**

### **DOOR-MODERN-001:**
- Модель: Современная дверь
- Стиль: Современная
- Покрытие: Нанотекс
- Цвет: Белый
- Размер: 800 x 2000 мм
- Цена РРЦ: 15,000 ₽
- Фото: /assets/doors/door-modern-001.jpg

### **DOOR-CLASSIC-001:**
- Модель: Классическая дверь
- Стиль: Классика
- Покрытие: Эмаль
- Цвет: Дуб
- Размер: 800 x 2000 мм
- Цена РРЦ: 18,000 ₽
- Фото: /assets/doors/door-classic-001.jpg

### **DOOR-NEO-001:**
- Модель: Неоклассическая дверь
- Стиль: Неоклассика
- Покрытие: Эмаль
- Цвет: Слоновая кость
- Размер: 900 x 2000 мм
- Цена РРЦ: 20,000 ₽
- Фото: /assets/doors/door-neo-001.jpg

## 📁 **Экспорт данных:**

### **CSV файл:**
- Файл: `imported_products.csv`
- Содержит все данные в табличном формате
- Можно открыть в Excel или Google Sheets

### **JSON файл:**
- Структурированные данные
- Включает статистику и детали
- Подходит для программной обработки

## 🚀 **Готовые команды для быстрого просмотра:**

### **PowerShell (Windows):**
```powershell
# Общая статистика
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/import/doors/products"
$data = $response.Content | ConvertFrom-Json
Write-Host "Всего товаров: $($data.total), Общая стоимость: $($data.summary.total_value) ₽"

# Экспорт в CSV
Invoke-WebRequest -Uri "http://localhost:3000/api/admin/import/doors/products?format=csv" | Select-Object -ExpandProperty Content | Out-File "imported_products.csv" -Encoding UTF8
```

### **Bash (Linux/Mac):**
```bash
# Общая статистика
curl "http://localhost:3000/api/admin/import/doors/products" | jq '.total, .summary.total_value'

# Экспорт в CSV
curl "http://localhost:3000/api/admin/import/doors/products?format=csv" > imported_products.csv
```

## 🎯 **Итог:**

**Загружено 6 товаров общей стоимостью 102,000 ₽ из файла example_price.csv**

**Все данные доступны через API и могут быть экспортированы в различных форматах!** 🎉
