#!/bin/bash
# scripts/start_dev.sh
# Скрипт для запуска dev сервера

echo "🚀 Запуск dev сервера для тестирования..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ package.json не найден. Запустите скрипт из корня проекта."
    exit 1
fi

# Устанавливаем переменные окружения
export PORT=${PORT:-3000}
export NODE_ENV=development

echo "📦 Установка зависимостей..."
npm install

echo "🔨 Сборка проекта..."
npm run build

echo "🚀 Запуск dev сервера на порту ${PORT}..."
echo "📱 Откройте браузер: http://localhost:${PORT}"
echo "🛑 Для остановки нажмите Ctrl+C"

npm run dev
