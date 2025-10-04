#!/bin/bash
# Скрипт развертывания на Yandex Cloud

set -e

echo "🚀 Развертывание на Yandex Cloud..."

# Проверка переменных окружения
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлен"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Ошибка: JWT_SECRET не установлен"
    exit 1
fi

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm ci --only=production

# Генерация Prisma клиента
echo "🗄️ Генерация Prisma клиента..."
npx prisma generate

# Применение миграций базы данных
echo "🔄 Применение миграций..."
npx prisma db push

# Сборка приложения
echo "🔨 Сборка приложения..."
npm run build

# Запуск приложения
echo "✅ Запуск приложения..."
npm start
