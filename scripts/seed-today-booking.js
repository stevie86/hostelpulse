const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findFirst();
  if (!property) throw new Error("No property found");

  const room = await prisma.room.findFirst({ where: { propertyId: property.id } });
  if (!room) throw new Error("No room found");

  const guest = await prisma.guest.findFirst();
  if (!guest) throw new Error("No guest found");

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Clean up existing bookings for today
  await prisma.booking.deleteMany({
    where: {
      propertyId: property.id,
      guestId: guest.id,
      checkIn: today
    }
  });

  const booking = await prisma.booking.create({
    data: {
      propertyId: property.id,
      guestId: guest.id,
      checkIn: today,
      checkOut: tomorrow,
      status: 'confirmed',
      amountPaid: 0,
      totalAmount: 5000,
      beds: {
        create: [{ roomId: room.id, bedLabel: "Bed A" }]
      }
    }
  });

  console.log(`Created booking: ${booking.id} for Guest: ${guest.firstName} ${guest.lastName}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
