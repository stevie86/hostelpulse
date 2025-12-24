import { createBooking, cancelBooking } from '@/app/actions/bookings';
import prisma from '@/lib/db';

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(() => Promise.resolve({ user: { email: 'test@example.com' } })),
}));

// Mock revalidatePath & redirect
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Booking Actions', () => {
  const propertyId = 'prop-test';
  const guestId = 'guest-test';
  const roomId = 'room-test';

  beforeEach(async () => {
    // Cleanup
    await prisma.bookingBed.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.property.deleteMany();
    await prisma.team.deleteMany();

    // Setup
    await prisma.team.create({
      data: { id: 'team-1', name: 'Team', slug: 'team' },
    });
    await prisma.property.create({
      data: { id: propertyId, teamId: 'team-1', name: 'Prop', city: 'City' },
    });
    await prisma.guest.create({
      data: { id: guestId, propertyId, firstName: 'John', lastName: 'Doe' },
    });
    await prisma.room.create({
      data: {
        id: roomId,
        propertyId,
        name: 'Dorm 1',
        type: 'dormitory',
        beds: 2, // Capacity 2
        pricePerNight: 1000,
      },
    });
  });

  it('should create a booking when capacity is available', async () => {
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('guestId', guestId);
    formData.append('checkIn', '2025-01-01');
    formData.append('checkOut', '2025-01-05');
    formData.append('status', 'confirmed');
    formData.append('bedLabel', '1');

    try {
      await createBooking(propertyId, {}, formData);
    } catch (e) {
      // Next.js redirect throws an error, which is expected here
    }

    const booking = await prisma.booking.findFirst();
    expect(booking).not.toBeNull();
    expect(booking?.status).toBe('confirmed');
  });

  it('should fail when room is full', async () => {
    // Fill the room (Capacity 2)
    // Create 2 existing bookings
    for (let i = 0; i < 2; i++) {
      const b = await prisma.booking.create({
        data: {
          propertyId,
          checkIn: new Date('2025-01-01'),
          checkOut: new Date('2025-01-05'),
          status: 'confirmed',
        },
      });
      await prisma.bookingBed.create({
        data: {
          bookingId: b.id,
          roomId,
          bedLabel: (i + 1).toString(),
          pricePerNight: 1000,
        },
      });
    }

    // Try to create 3rd booking
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('guestId', guestId);
    formData.append('checkIn', '2025-01-02'); // Overlapping dates
    formData.append('checkOut', '2025-01-04');
    formData.append('status', 'confirmed');
    formData.append('bedLabel', '1');

    const result = await createBooking(propertyId, {}, formData);

    expect(result.message).toBe('The selected bed is no longer available.');
  });

  it('should cancel a booking and free the bed', async () => {
    // Create a booking
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('guestId', guestId);
    formData.append('checkIn', '2025-01-01');
    formData.append('checkOut', '2025-01-05');
    formData.append('bedLabel', '1');

    try {
      await createBooking(propertyId, {}, formData);
    } catch (e) {
      // Redirect expected
    }

    const booking = await prisma.booking.findFirst();
    expect(booking).not.toBeNull();
    expect(booking?.status).toBe('confirmed');

    // Cancel the booking
    await cancelBooking(propertyId, booking!.id);

    // Verify booking is cancelled
    const cancelledBooking = await prisma.booking.findUnique({
      where: { id: booking!.id },
    });
    expect(cancelledBooking?.status).toBe('cancelled');

    // Verify bed is now available
    const availableBeds = await import('@/lib/availability').then((m) =>
      m.AvailabilityService.getAvailableBeds(roomId, {
        checkIn: new Date('2025-01-02'),
        checkOut: new Date('2025-01-04'),
      })
    );
    expect(availableBeds).toContain('1');
  });

  it('should handle date boundary overlaps correctly', async () => {
    // Create booking: Jan 1-3
    const formData1 = new FormData();
    formData1.append('roomId', roomId);
    formData1.append('guestId', guestId);
    formData1.append('checkIn', '2025-01-01');
    formData1.append('checkOut', '2025-01-03');
    formData1.append('bedLabel', '1');

    try {
      await createBooking(propertyId, {}, formData1);
    } catch (e) {}

    // Try booking: Jan 3-5 (checkout = checkin, should not overlap)
    const guestId2 = 'guest-test-2';
    await prisma.guest.create({
      data: { id: guestId2, propertyId, firstName: 'Jane', lastName: 'Doe' },
    });

    const formData2 = new FormData();
    formData2.append('roomId', roomId);
    formData2.append('guestId', guestId2);
    formData2.append('checkIn', '2025-01-03');
    formData2.append('checkOut', '2025-01-05');
    formData2.append('bedLabel', '1');

    try {
      await createBooking(propertyId, {}, formData2);
    } catch (e) {}

    const bookings = await prisma.booking.findMany();
    expect(bookings).toHaveLength(2); // Both should succeed
  });
});
