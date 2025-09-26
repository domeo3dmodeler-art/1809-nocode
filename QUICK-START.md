# 🚀 Быстрый старт - Domeo Production Ready

## ✅ Что готово

Проект полностью подготовлен к работе с реальными данными и развертыванию на Yandex Cloud:

### 🏗️ Архитектура
- ✅ **PostgreSQL** с оптимизацией для больших объемов данных
- ✅ **Redis** для кэширования и сессий
- ✅ **Yandex Object Storage** для файлов и изображений
- ✅ **Prometheus + Grafana** для мониторинга
- ✅ **Docker** контейнеризация для продакшена

### 📊 Производительность
- ✅ **Пагинация** для всех списков
- ✅ **Индексы БД** для быстрого поиска
- ✅ **Кэширование** с Redis
- ✅ **Оптимизация изображений** с Sharp
- ✅ **Метрики** для мониторинга производительности

### 🔒 Безопасность
- ✅ **JWT аутентификация**
- ✅ **Валидация данных** с Zod
- ✅ **Rate limiting** в Nginx
- ✅ **Хеширование паролей**
- ✅ **Защита от SQL injection**

### 📁 Файловая система
- ✅ **Загрузка файлов** в Yandex Object Storage
- ✅ **Автоматическая оптимизация** изображений
- ✅ **Генерация миниатюр**
- ✅ **Множественная загрузка**

## 🚀 Запуск в продакшене

### 1. Подготовка сервера

```bash
# Установите Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Клонируйте проект
git clone https://github.com/your-repo/domeo.git
cd domeo
```

### 2. Настройка переменных окружения

```bash
# Скопируйте пример конфигурации
cp env.example .env

# Отредактируйте .env файл
nano .env
```

**Обязательные переменные:**
```bash
# База данных
DATABASE_URL="postgresql://user:password@localhost:5432/domeo_db"
POSTGRES_DB="domeo_db"
POSTGRES_USER="domeo_user"
POSTGRES_PASSWORD="secure_password"

# Redis
REDIS_PASSWORD="redis_password"

# Yandex Object Storage
YANDEX_STORAGE_ACCESS_KEY_ID="your_access_key"
YANDEX_STORAGE_SECRET_ACCESS_KEY="your_secret_key"
YANDEX_STORAGE_BUCKET_NAME="your_bucket_name"

# Мониторинг
GRAFANA_PASSWORD="grafana_password"
```

### 3. Развертывание

```bash
# Сделайте скрипт исполняемым
chmod +x scripts/deploy-yandex.sh

# Запустите развертывание
./scripts/deploy-yandex.sh
```

### 4. Проверка работы

После развертывания будут доступны:
- **Приложение**: http://your-server:3000
- **Grafana**: http://your-server:3001
- **Prometheus**: http://your-server:9090

## 🔧 Управление

### Остановка сервисов
```bash
./scripts/deploy-yandex.sh stop
```

### Просмотр логов
```bash
./scripts/deploy-yandex.sh logs
./scripts/deploy-yandex.sh logs app
```

### Обновление приложения
```bash
./scripts/deploy-yandex.sh update
```

## 📊 Мониторинг

### Ключевые метрики
- **Время ответа API**: < 200ms
- **Использование памяти**: < 80%
- **Количество ошибок**: < 1%
- **Загрузка CPU**: < 70%

### Алерты настроены на:
- Высокий процент ошибок (>10%)
- Медленное время ответа (>1s)
- Высокое использование памяти Redis (>90%)
- Много соединений с БД (>180)

## 🗄️ База данных

### Автоматически создаются:
- **1000+ товаров** с изображениями
- **3 пользователя** (admin, complectator, executor)
- **20+ клиентов**
- **20 коммерческих предложений**
- **10 заказов**

### Оптимизации БД:
- Составные индексы для поиска
- Расширения pg_trgm, btree_gin
- Настройки производительности
- Мониторинг через pg_stat_statements

## 📁 Структура файлов

```
domeo/
├── app/                          # Next.js приложение
│   ├── lib/
│   │   ├── cache/               # Redis кэширование
│   │   ├── monitoring/          # Логирование и метрики
│   │   ├── repositories/        # Репозитории данных
│   │   ├── storage/             # Yandex Object Storage
│   │   └── types/               # TypeScript типы
│   └── prisma/                  # Схема БД и seed
├── docker-compose.production.yml # Docker Compose
├── Dockerfile.production         # Docker образ
├── nginx/                        # Конфигурация Nginx
├── monitoring/                   # Prometheus + Grafana
└── scripts/                      # Скрипты развертывания
```

## 🔍 Отладка

### Проверка здоровья системы
```bash
# Статус контейнеров
docker-compose ps

# Логи приложения
docker-compose logs app

# Метрики
curl http://localhost:3000/api/metrics

# Проверка БД
docker-compose exec postgres psql -U domeo_user -d domeo_db -c "SELECT COUNT(*) FROM products;"
```

### Частые проблемы

1. **Ошибки подключения к БД**
   - Проверьте DATABASE_URL
   - Убедитесь, что PostgreSQL запущен

2. **Проблемы с Redis**
   - Проверьте REDIS_PASSWORD
   - Убедитесь, что Redis доступен

3. **Ошибки загрузки файлов**
   - Проверьте настройки Yandex Storage
   - Убедитесь в правильности ключей доступа

4. **Медленная работа**
   - Проверьте индексы БД
   - Мониторьте использование кэша
   - Проверьте логи производительности

## 📈 Масштабирование

### Для больших нагрузок:
- Увеличьте количество воркеров Nginx
- Настройте репликацию PostgreSQL
- Добавьте Redis Cluster
- Используйте CDN для статических файлов

### Рекомендуемые характеристики:
- **CPU**: 4+ ядер
- **RAM**: 8GB+ (4GB приложение, 2GB PostgreSQL, 1GB Redis)
- **Диск**: SSD 100GB+
- **Сеть**: 1Gbps+

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте логи: `./scripts/deploy-yandex.sh logs`
2. Проверьте метрики в Grafana
3. Проверьте статус контейнеров: `docker-compose ps`
4. Обратитесь к документации в README-PRODUCTION.md

---

**🎉 Поздравляем! Ваша система готова к работе с реальными данными!**
