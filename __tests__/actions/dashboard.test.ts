import { getDashboardStats } from "@/app/actions/dashboard";
import prisma from "@/lib/db";
import { endOfDay, startOfDay } from "date-fns";

// Mock auth
jest.mock("@/auth", () => ({
  auth: jest.fn(() => Promise.resolve({ user: { id: "test-user", email: "test@example.com" } })),
}));

// Mock auth-utils
jest.mock('@/lib/auth-utils', () => ({
  verifyPropertyAccess: jest.fn().mockResolvedValue({ userId: 'test-user', role: 'admin' }),
}));

describe("Dashboard Actions", () => {
  const propertyId = "prop-test-dashboard";
  const teamId = "team-test-dashboard";
  const roomId1 = "room-test-1";
  const roomId2 = "room-test-2";
  const guestId1 = "guest-test-1";
  const guestId2 = "guest-test-2";

  beforeEach(async () => {
    // Cleanup
    await prisma.bookingBed.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.property.deleteMany();
    await prisma.team.deleteMany();

    // Setup basic data
    await prisma.team.create({ data: { id: teamId, name: "Test Team", slug: "test-dashboard" } });
    await prisma.property.create({ data: { id: propertyId, teamId, name: "Dash Prop", city: "Dash City" } });
    await prisma.guest.create({ data: { id: guestId1, propertyId, firstName: "Alice", lastName: "Smith" } });
    await prisma.guest.create({ data: { id: guestId2, propertyId, firstName: "Bob", lastName: "Johnson" } });
    await prisma.room.create({ data: { id: roomId1, propertyId, name: "Room 1", type: "private", beds: 1, maxOccupancy: 1, pricePerNight: 5000 } });
    await prisma.room.create({ data: { id: roomId2, propertyId, name: "Room 2", type: "dormitory", beds: 4, maxOccupancy: 4, pricePerNight: 2000 } });

    // Create a booking for today (occupies Room 1)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const booking1 = await prisma.booking.create({
      data: {
        propertyId,
        guestId: guestId1,
        checkIn: startOfDay(today),
        checkOut: endOfDay(tomorrow),
        status: "confirmed",
        totalAmount: 10000,
      },
    });
    await prisma.bookingBed.create({ data: { bookingId: booking1.id, roomId: roomId1, bedLabel: "1", pricePerNight: 5000 } });

    // Create a booking checking in today (for arrivals count)
    const arrivalBooking = await prisma.booking.create({
      data: {
        propertyId,
        guestId: guestId2,
        checkIn: startOfDay(today),
        checkOut: endOfDay(tomorrow),
        status: "confirmed",
        totalAmount: 10000,
      },
    });
    await prisma.bookingBed.create({ data: { bookingId: arrivalBooking.id, roomId: roomId2, bedLabel: "1", pricePerNight: 2000 } });

    // Create a booking checking out today (for departures count)
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const departureBooking = await prisma.booking.create({
      data: {
        propertyId,
        guestId: guestId2,
        checkIn: startOfDay(yesterday),
        checkOut: endOfDay(today),
        status: "checked_in", // Must be checked_in to count as departure
        totalAmount: 10000,
      },
    });
    await prisma.bookingBed.create({ data: { bookingId: departureBooking.id, roomId: roomId2, bedLabel: "2", pricePerNight: 2000 } });
  });

  it("should return correct dashboard stats", async () => {
    const stats = await getDashboardStats(propertyId);

    expect(stats).toBeDefined();
    expect(stats?.totalRooms).toBe(2);
    expect(stats?.totalBeds).toBe(5); // Room 1 (1 bed) + Room 2 (4 beds)
    expect(stats?.occupiedBeds).toBe(3); // Booking 1 (R1, 1 bed) + Arrival (R2, 1 bed) + Departure (R2, 1 bed)
    expect(stats?.availableBeds).toBe(2);
    expect(stats?.arrivalsToday).toBe(2); // Two bookings check in today (booking1, arrivalBooking)
    expect(stats?.departuresToday).toBe(1); // One booking checks out today (departureBooking)
    expect(stats?.currentOccupancyPercentage).toBeCloseTo((3 / 5) * 100);
  });
});