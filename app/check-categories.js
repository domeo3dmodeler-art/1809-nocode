const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('Checking categories in database...');
    
    const categories = await prisma.catalogCategory.findMany({
      where: { is_active: true },
      take: 10,
      orderBy: { name: 'asc' }
    });
    
    console.log('Found categories:', categories.length);
    
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ID: ${cat.id}`);
      console.log(`   Name: ${cat.name}`);
      console.log(`   Level: ${cat.level}`);
      console.log(`   Parent ID: ${cat.parent_id}`);
      console.log(`   Sort Order: ${cat.sort_order}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
