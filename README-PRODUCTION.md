# Domeo - Профессиональная система управления товарами

Профессиональная система управления товарами, оптимизированная для работы с большими объемами данных (десятки тысяч товаров и изображений) и развертывания на Yandex Cloud.

## 🚀 Особенности

- **Масштабируемость**: Оптимизирована для работы с десятками тысяч товаров
- **Производительность**: Кэширование с Redis, индексы БД, пагинация
- **Файловое хранилище**: Интеграция с Yandex Object Storage
- **Мониторинг**: Prometheus + Grafana для отслеживания метрик
- **Безопасность**: JWT аутентификация, валидация данных, rate limiting
- **Архитектура**: Repository Pattern, Service Layer, DTOs с Zod валидацией

## 🏗️ Архитектура

### Технологический стек

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: PostgreSQL с оптимизацией
- **Кэширование**: Redis
- **Файловое хранилище**: Yandex Object Storage (S3-совместимое)
- **Мониторинг**: Prometheus, Grafana
- **Контейнеризация**: Docker, Docker Compose
- **Веб-сервер**: Nginx

### Роли пользователей

- **Admin**: Полный доступ к системе
- **Complectator**: Создание заказов, печать КП и счетов
- **Executor**: Работа с поставщиками, выполнение заказов

## 📋 Требования

- Node.js 18+
- Docker и Docker Compose
- PostgreSQL 15+
- Redis 7+
- Yandex Cloud аккаунт (для Object Storage)

## 🛠️ Установка и настройка

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-repo/domeo.git
cd domeo
```

### 2. Настройка переменных окружения

```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Развертывание с Docker

```bash
# Сделайте скрипт исполняемым
chmod +x scripts/deploy-yandex.sh

# Установите переменные окружения
export POSTGRES_DB="domeo_db"
export POSTGRES_USER="domeo_user"
export POSTGRES_PASSWORD="your_secure_password"
export REDIS_PASSWORD="your_redis_password"
export YANDEX_STORAGE_ACCESS_KEY_ID="your_access_key"
export YANDEX_STORAGE_SECRET_ACCESS_KEY="your_secret_key"
export YANDEX_STORAGE_BUCKET_NAME="your_bucket_name"
export GRAFANA_PASSWORD="your_grafana_password"

# Запустите развертывание
./scripts/deploy-yandex.sh
```

### 4. Ручная установка (для разработки)

```bash
# Установка зависимостей
cd app
npm install

# Настройка базы данных
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed

# Запуск в режиме разработки
npm run dev
```

## 🔧 Конфигурация

### База данных PostgreSQL

Система автоматически настроит PostgreSQL с оптимальными параметрами:

- Максимум соединений: 200
- Shared buffers: 256MB
- Effective cache size: 1GB
- Work memory: 4MB
- Расширения: pg_trgm, btree_gin, pg_stat_statements

### Redis кэширование

- Максимальная память: 512MB
- Политика вытеснения: allkeys-lru
- Таймауты: 5 секунд

### Yandex Object Storage

- Автоматическая оптимизация изображений
- Генерация миниатюр
- Кэширование с длительным TTL
- Поддержка множественной загрузки

## 📊 Мониторинг

### Доступные сервисы

- **Приложение**: http://localhost:3000
- **Grafana**: http://localhost:3001 (admin / ваш_пароль)
- **Prometheus**: http://localhost:9090
- **Метрики API**: http://localhost:3000/api/metrics

### Ключевые метрики

- Время ответа API
- Количество ошибок
- Использование памяти Redis
- Количество соединений с БД
- Загрузка файлов
- Поисковые запросы

## 🔒 Безопасность

### Аутентификация

- JWT токены с истечением срока действия
- Хеширование паролей с bcrypt
- Rate limiting для API endpoints
- Защита от CSRF атак

### Валидация данных

- Zod схемы для всех входных данных
- Санитизация пользовательского ввода
- Проверка типов файлов и размеров
- SQL injection защита через Prisma

## 📁 Структура проекта

```
domeo/
├── app/                          # Next.js приложение
│   ├── api/                      # API endpoints
│   ├── components/               # React компоненты
│   ├── lib/                      # Утилиты и сервисы
│   │   ├── cache/               # Redis кэширование
│   │   ├── monitoring/          # Логирование и метрики
│   │   ├── repositories/        # Репозитории данных
│   │   ├── storage/             # Файловое хранилище
│   │   └── types/               # TypeScript типы
│   └── prisma/                  # Схема БД и миграции
├── docker-compose.production.yml # Docker Compose для продакшена
├── Dockerfile.production         # Docker образ
├── nginx/                        # Конфигурация Nginx
├── monitoring/                   # Конфигурация мониторинга
├── scripts/                      # Скрипты развертывания
└── env.example                   # Пример переменных окружения
```

## 🚀 Развертывание на Yandex Cloud

### 1. Подготовка инфраструктуры

Создайте в Yandex Cloud:
- Виртуальную машину (минимум 4 CPU, 8GB RAM)
- PostgreSQL кластер
- Redis кластер
- Object Storage bucket

### 2. Настройка сети

```bash
# Откройте порты в Security Groups
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (App)
- 3001 (Grafana)
- 9090 (Prometheus)
```

### 3. Запуск развертывания

```bash
# На виртуальной машине
git clone https://github.com/your-repo/domeo.git
cd domeo
./scripts/deploy-yandex.sh
```

## 📈 Производительность

### Оптимизации для больших объемов данных

- **Индексы БД**: Составные индексы для частых запросов
- **Пагинация**: Эффективная пагинация с LIMIT/OFFSET
- **Кэширование**: Многоуровневое кэширование
- **Параллельная обработка**: Асинхронные операции
- **Сжатие**: Gzip для статических ресурсов

### Рекомендуемые характеристики сервера

- **CPU**: 4+ ядер
- **RAM**: 8GB+ (4GB для приложения, 2GB для PostgreSQL, 1GB для Redis)
- **Диск**: SSD 100GB+
- **Сеть**: 1Gbps+

## 🔧 Обслуживание

### Резервное копирование

```bash
# Создание резервной копии БД
docker-compose exec postgres pg_dump -U domeo_user domeo_db > backup.sql

# Восстановление из резервной копии
docker-compose exec -T postgres psql -U domeo_user domeo_db < backup.sql
```

### Обновление приложения

```bash
# Обновление только приложения
./scripts/deploy-yandex.sh update

# Полное обновление
./scripts/deploy-yandex.sh stop
git pull
./scripts/deploy-yandex.sh deploy
```

### Просмотр логов

```bash
# Все сервисы
./scripts/deploy-yandex.sh logs

# Конкретный сервис
./scripts/deploy-yandex.sh logs app
./scripts/deploy-yandex.sh logs postgres
```

## 🐛 Отладка

### Проверка здоровья системы

```bash
# Проверка статуса контейнеров
docker-compose ps

# Проверка логов
docker-compose logs app

# Проверка метрик
curl http://localhost:3000/api/metrics
```

### Частые проблемы

1. **Ошибки подключения к БД**: Проверьте DATABASE_URL
2. **Проблемы с Redis**: Проверьте REDIS_PASSWORD
3. **Ошибки загрузки файлов**: Проверьте настройки Yandex Storage
4. **Медленная работа**: Проверьте индексы БД и кэш

## 📞 Поддержка

- **Документация**: [Wiki](https://github.com/your-repo/domeo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/domeo/issues)
- **Email**: support@domeo.ru

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE)

---

**Domeo** - Профессиональная система управления товарами для современного бизнеса.
