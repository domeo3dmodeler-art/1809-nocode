// prisma/seed.ts
// Seed файл для создания реальных пользователей

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Создаем реальных пользователей...');

    // Создаем администратора
    console.log('👑 Создаем администратора...');
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@domeo.ru' },
      update: {},
      create: {
        email: 'admin@domeo.ru',
        password_hash: adminPasswordHash,
        first_name: 'Петр',
        last_name: 'Иванов',
        middle_name: 'Владимирович',
        role: 'ADMIN',
        is_active: true
      }
    });

    console.log('✅ Администратор создан:', admin.email);

    // Создаем комплектатора
    console.log('📋 Создаем комплектатора...');
    const complectatorPasswordHash = await bcrypt.hash('complectator123', 12);
    
    const complectator = await prisma.user.upsert({
      where: { email: 'complectator@domeo.ru' },
      update: {},
      create: {
        email: 'complectator@domeo.ru',
        password_hash: complectatorPasswordHash,
        first_name: 'Иван',
        last_name: 'Петров',
        middle_name: 'Сергеевич',
        role: 'COMPLECTATOR',
        is_active: true
      }
    });

    console.log('✅ Комплектатор создан:', complectator.email);

    // Создаем исполнителя
    console.log('⚙️ Создаем исполнителя...');
    const executorPasswordHash = await bcrypt.hash('executor123', 12);
    
    const executor = await prisma.user.upsert({
      where: { email: 'executor@domeo.ru' },
      update: {},
      create: {
        email: 'executor@domeo.ru',
        password_hash: executorPasswordHash,
        first_name: 'Алексей',
        last_name: 'Сидоров',
        middle_name: 'Михайлович',
        role: 'EXECUTOR',
        is_active: true
      }
    });

    console.log('✅ Исполнитель создан:', executor.email);

    // Создаем базовые категории с NoCode конфигурацией
    console.log('📦 Создаем категории...');
    
    const doorsCategory = await prisma.category.upsert({
      where: { slug: 'doors' },
      update: {},
      create: {
        id: 'doors',
        name: 'Двери',
        slug: 'doors',
        description: 'Межкомнатные и входные двери',
        icon: '🚪',
        level: 0,
        sort_order: 1,
        is_active: true,
        configurator_config: JSON.stringify({
          components: ['style-selector', 'model-selector', 'parameters-form', 'preview-panel'],
          layout: { type: 'grid', columns: 3, gap: 8 }
        }),
        page_template: 'doors-template',
        properties: JSON.stringify([
          { key: 'style', name: 'Стиль', type: 'select', required: true, options: ['Скрытая', 'Современная', 'Неоклассика', 'Классика'] },
          { key: 'model', name: 'Модель', type: 'select', required: true },
          { key: 'finish', name: 'Покрытие', type: 'select', required: true, options: ['Ламинат', 'ПВХ', 'Шпон'] },
          { key: 'color', name: 'Цвет', type: 'select', required: true, options: ['Белый', 'Дуб', 'Орех'] },
          { key: 'width', name: 'Ширина', type: 'number', required: true, min: 600, max: 1000, unit: 'мм' },
          { key: 'height', name: 'Высота', type: 'number', required: true, min: 1900, max: 2200, unit: 'мм' }
        ]),
        import_mapping: JSON.stringify({
          'Артикул': 'sku',
          'Название': 'name',
          'Цена': 'base_price',
          'Стиль': 'style',
          'Модель': 'model',
          'Покрытие': 'finish',
          'Цвет': 'color',
          'Ширина': 'width',
          'Высота': 'height'
        })
      }
    });

    const windowsCategory = await prisma.category.upsert({
      where: { slug: 'windows' },
      update: {},
      create: {
        id: 'windows',
        name: 'Окна',
        slug: 'windows',
        description: 'Пластиковые и деревянные окна',
        icon: '🪟',
        level: 0,
        sort_order: 2,
        is_active: true,
        configurator_config: JSON.stringify({
          components: ['material-selector', 'size-form', 'preview-panel'],
          layout: { type: 'grid', columns: 2, gap: 6 }
        }),
        page_template: 'windows-template',
        properties: JSON.stringify([
          { key: 'material', name: 'Материал', type: 'select', required: true, options: ['ПВХ', 'Дерево', 'Алюминий'] },
          { key: 'width', name: 'Ширина', type: 'number', required: true, min: 400, max: 2000, unit: 'мм' },
          { key: 'height', name: 'Высота', type: 'number', required: true, min: 400, max: 2000, unit: 'мм' },
          { key: 'color', name: 'Цвет', type: 'select', required: true, options: ['Белый', 'Коричневый', 'Серый'] }
        ]),
        import_mapping: JSON.stringify({
          'Артикул': 'sku',
          'Название': 'name',
          'Цена': 'base_price',
          'Материал': 'material',
          'Ширина': 'width',
          'Высота': 'height',
          'Цвет': 'color'
        })
      }
    });

    const furnitureCategory = await prisma.category.upsert({
      where: { slug: 'furniture' },
      update: {},
      create: {
        id: 'furniture',
        name: 'Мебель',
        slug: 'furniture',
        description: 'Корпусная и мягкая мебель',
        icon: '🪑',
        level: 0,
        sort_order: 3,
        is_active: true,
        configurator_config: JSON.stringify({
          components: ['category-selector', 'style-selector', 'preview-panel', 'cart-panel'],
          layout: { type: 'grid', columns: 2, gap: 6 }
        }),
        page_template: 'furniture-template',
        properties: JSON.stringify([
          { key: 'category', name: 'Категория', type: 'select', required: true, options: ['Корпусная', 'Мягкая', 'Офисная'] },
          { key: 'style', name: 'Стиль', type: 'select', required: true, options: ['Современный', 'Классический', 'Минимализм'] },
          { key: 'material', name: 'Материал', type: 'select', required: true, options: ['Дерево', 'МДФ', 'Стекло'] },
          { key: 'width', name: 'Ширина', type: 'number', required: true, min: 300, max: 3000, unit: 'мм' },
          { key: 'depth', name: 'Глубина', type: 'number', required: true, min: 300, max: 1000, unit: 'мм' },
          { key: 'height', name: 'Высота', type: 'number', required: true, min: 400, max: 2500, unit: 'мм' }
        ]),
        import_mapping: JSON.stringify({
          'Артикул': 'sku',
          'Название': 'name',
          'Цена': 'base_price',
          'Категория': 'category',
          'Стиль': 'style',
          'Материал': 'material',
          'Ширина': 'width',
          'Глубина': 'depth',
          'Высота': 'height'
        })
      }
    });

    console.log('✅ Категории созданы:', doorsCategory.name, windowsCategory.name, furnitureCategory.name);

    console.log('🎉 Пользователи успешно созданы!');
    console.log('');
    console.log('📋 Данные для входа:');
    console.log('👑 Администратор: admin@domeo.ru / admin123');
    console.log('📋 Комплектатор: complectator@domeo.ru / complectator123');
    console.log('⚙️ Исполнитель: executor@domeo.ru / executor123');

  } catch (error) {
    console.error('❌ Ошибка при создании пользователей:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });