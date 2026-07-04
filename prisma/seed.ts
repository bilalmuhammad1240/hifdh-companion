import { PrismaClient } from '@prisma/client';
import { generateMushafPages } from '../src/infrastructure/data/generateMushafPages';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Hifdh Companion database...');

  // Mushaf data is static and loaded at runtime from the TypeScript module.
  // No DB seed needed for it — it's served directly from memory via the API.
  // This seed only creates essential lookup/config data.

  console.log('✅ Seed complete.');
  console.log(`   Mushaf: ${generateMushafPages().length} pages available in-memory (no DB seed needed)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
