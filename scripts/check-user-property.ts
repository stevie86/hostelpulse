
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for admin user property...');
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@hostelpulse.com' },
      include: {
        teamMembers: {
          include: {
            team: {
              include: {
                property: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.email);
    console.log('Team Memberships:', user.teamMembers.length);
    
    if (user.teamMembers.length > 0) {
      user.teamMembers.forEach((tm, i) => {
        console.log(`Team ${i + 1}:`, tm.team.name);
        console.log(`Property:`, tm.team.property ? tm.team.property.name : 'None');
      });
    } else {
      console.log('No team memberships found.');
    }

  } catch (e) {
    console.error('Error querying database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
