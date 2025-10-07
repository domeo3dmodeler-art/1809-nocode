# 🚀 Domeo Doors - No-Code Система Управления Товарами

Универсальная система для управления любыми группами товаров без программирования.

## ⚡ Быстрый старт

### 1. Клонирование репозитория
```bash
git clone <your-repo-url>
cd domeo-doors/app
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
```bash
cp env.yandex.example .env.local
# Отредактируйте .env.local с вашими данными
```

### 4. Запуск локально
```bash
npm run dev
```

## 🌐 Развертывание на Yandex Cloud

### Автоматическое развертывание через GitHub Actions

1. **Настройте GitHub Secrets** (см. [docs/github-secrets-setup.md](docs/github-secrets-setup.md))
2. **Push в main ветку** - автоматическое развертывание
3. **Manual deploy** - через GitHub Actions → "Quick Deploy to Yandex Cloud"

### Ручное развертывание

1. **Создайте Compute Instance в Yandex Cloud**
2. **Настройте сервер**:
   ```bash
   # На сервере
   curl -fsSL https://raw.githubusercontent.com/your-repo/main/app/scripts/setup-server.sh | bash
   ```
3. **Клонируйте и запустите**:
   ```bash
   git clone <your-repo-url> /opt/domeo-doors
   cd /opt/domeo-doors/app
   cp env.yandex.example .env.local
   # Настройте .env.local
   sudo systemctl start domeo-doors
   ```

## 📊 Возможности

### ✅ Универсальные категории товаров
- **Двери** 🚪 - межкомнатные и входные двери
- **Окна** 🪟 - пластиковые и деревянные окна  
- **Мебель** 🪑 - корпусная и мягкая мебель
- **+ Любые новые** - добавляются без программирования

### ✅ No-Code интерфейс
- Создание категорий через веб-интерфейс
- Настройка свойств товаров
- Гибкий маппинг импорта

### ✅ Реальная обработка файлов
- Парсинг Excel (.xlsx, .xls) и CSV
- Валидация обязательных полей
- Сохранение в PostgreSQL

### ✅ Автоматическое развертывание
- GitHub Actions → Yandex Cloud
- Docker контейнеризация
- Автоматические обновления

## 🎯 Использование

### 1. Создание категории товаров
```bash
POST /api/categories
{
  "name": "Сантехника",
  "description": "Ванны, раковины, унитазы",
  "icon": "🚿",
  "properties": [...],
  "import_mapping": {...}
}
```

### 2. Импорт прайса
```bash
POST /api/admin/import/universal
# Загрузите Excel/CSV файл с товарами
```

### 3. Загрузка фото
```bash
POST /api/admin/media/universal
# Загрузите фото товаров
```

## 🔧 Технический стек

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: PostgreSQL (Yandex Managed PostgreSQL)
- **Контейнеризация**: Docker
- **CI/CD**: GitHub Actions
- **Облако**: Yandex Cloud

## 📁 Структура проекта

```
app/
├── .github/workflows/     # GitHub Actions
├── api/                   # API endpoints
├── app/                   # Next.js app router
├── components/            # React компоненты
├── docs/                  # Документация
├── prisma/               # Prisma схема
├── scripts/              # Скрипты развертывания
├── sql/                  # SQL схемы
└── ...
```

## 🚀 API Endpoints

### Категории
- `GET /api/categories` - Получить все категории
- `POST /api/categories` - Создать категорию

### Импорт
- `POST /api/admin/import/universal` - Универсальный импорт

### Медиа
- `POST /api/admin/media/universal` - Загрузка фото
- `GET /api/catalog/universal/photo` - Получение фото

## 📚 Документация

- [Руководство по развертыванию](docs/yandex_cloud_deployment.md)
- [Настройка GitHub Secrets](docs/github-secrets-setup.md)
- [Универсальная система](docs/universal_system_guide.md)

## 🎉 Готово к использованию!

После развертывания:
1. Откройте `https://your-domain.com`
2. Перейдите в админку: `https://your-domain.com/admin`
3. Создайте категории товаров
4. Загрузите прайсы и фото
5. Начните работу!

---

**🎯 Система готова к работе с любыми группами товаров без программирования!**