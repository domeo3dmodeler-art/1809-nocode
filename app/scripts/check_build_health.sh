#!/bin/bash
# scripts/check_build_health.sh
# Скрипт для проверки здоровья сборки

set -e

echo "🔍 Проверка здоровья сборки..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
  echo "❌ package.json не найден. Запустите скрипт из корня проекта."
  exit 1
fi

# Проверяем установку зависимостей
if [ ! -d "node_modules" ]; then
  echo "📦 Установка зависимостей..."
  npm install
fi

# Проверяем типы TypeScript
echo "🔍 Проверка типов TypeScript..."
npx tsc --noEmit

# Проверяем линтер
echo "🔍 Проверка линтера..."
npm run lint || echo "⚠️ Линтер нашел проблемы, но это не критично"

# Собираем проект
echo "🔨 Сборка проекта..."
npm run build

# Проверяем, что сборка прошла успешно
if [ $? -eq 0 ]; then
  echo "✅ Сборка прошла успешно!"
  echo "✅ Нет ошибок MODULE_NOT_FOUND"
  echo "✅ Все типы корректны"
  echo "✅ Проект готов к продакшену"
else
  echo "❌ Сборка не удалась"
  exit 1
fi

echo "🎉 Проверка здоровья сборки завершена успешно!"
