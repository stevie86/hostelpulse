
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for admin user...');
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hostelpulse.com' },
    });
    console.log('User found:', user);
  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
