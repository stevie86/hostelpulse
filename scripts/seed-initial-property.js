// scripts/seed-initial-property.js
// This script ensures the default admin user has at least one property associated with their team.

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@hostelpulse.com';
  const propertyName = 'Admin Hostel';
  const propertyCity = 'Lisbon';

  console.log(`Ensuring admin user (${adminEmail}) has a property...`);

  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        teamMembers: {
          include: {
            team: true,
          },
        },
      },
    });

    if (!adminUser) {
      console.error(`Admin user with email ${adminEmail} not found. Please ensure seed data is run.`);
      return;
    }

    // Assuming the admin user is part of at least one team
    const adminTeam = adminUser.teamMembers[0]?.team;

    if (!adminTeam) {
      console.error(`Admin user ${adminEmail} is not associated with any team.`);
      return;
    }

    // Check if the team already has a property
    let existingProperty = await prisma.property.findUnique({
      where: { teamId: adminTeam.id },
    });

    if (existingProperty) {
      console.log(`Team '${adminTeam.name}' (ID: ${adminTeam.id}) already has property: '${existingProperty.name}' (ID: ${existingProperty.id}). No new property created.`);
    } else {
      // Create a new property for the admin's team
      const newProperty = await prisma.property.create({
        data: {
          teamId: adminTeam.id,
          name: propertyName,
          city: propertyCity,
          country: 'Portugal',
          timezone: 'Europe/Lisbon',
          currency: 'EUR',
          checkInTime: '15:00',
          checkOutTime: '11:00',
          // Add default rooms and beds
          rooms: {
            create: [
              { name: 'Dorm 1', type: 'dormitory', beds: 8, pricePerNight: 2000, maxOccupancy: 8 },
              { name: 'Private Room', type: 'private', beds: 2, pricePerNight: 5000, maxOccupancy: 2 },
            ],
          },
        },
      });
      console.log(`Created new property '${newProperty.name}' (ID: ${newProperty.id}) for team '${adminTeam.name}'.`);
    }

  } catch (error) {
    console.error('Error seeding initial property:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
