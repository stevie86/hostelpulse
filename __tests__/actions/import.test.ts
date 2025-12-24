import { importBookings, importRooms } from '@/app/actions/import';
import prisma from '@/lib/db';
import Papa from 'papaparse';

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(() =>
    Promise.resolve({ user: { id: 'test-user', email: 'test@example.com' } })
  ),
}));

// Mock auth-utils
jest.mock('@/lib/auth-utils', () => ({
  verifyPropertyAccess: jest
    .fn()
    .mockResolvedValue({ userId: 'test-user', role: 'admin' }),
}));

// Mock PapaParse
jest.mock('papaparse', () => ({
  parse: jest.fn(),
}));

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Import Actions', () => {
  const propertyId = 'prop-test-import';

  beforeEach(async () => {
    // Cleanup
    await prisma.bookingBed.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.room.deleteMany();
    await prisma.guest.deleteMany();
    await prisma.property.deleteMany();
    await prisma.team.deleteMany();

    // Setup basic team/property
    await prisma.team.create({
      data: { id: 'team-import', name: 'Import Team', slug: 'import-team' },
    });
    await prisma.property.create({
      data: { id: propertyId, teamId: 'team-import', name: 'Import Prop', city: 'Import City' },
    });
  });

  describe('importRooms', () => {
    it('should import rooms successfully', async () => {
      const roomsData = [
        { name: 'Room A', type: 'private', beds: '1', pricePerNight: '5000', maxOccupancy: '1', description: 'Single Room' },
        { name: 'Room B', type: 'dormitory', beds: '4', pricePerNight: '2000', maxOccupancy: '4', description: 'Shared Dorm' }
      ];

      (Papa.parse as jest.Mock).mockImplementation((file, config) => {
        if (config.complete) {
          config.complete({ data: roomsData, errors: [], meta: {} });
        }
      });

      const mockFile = new Blob(['dummy'], { type: 'text/csv' }) as File;
      const formData = new FormData();
      formData.append('file', mockFile);

      const result = await importRooms(propertyId, {}, formData);

      expect(result.message).toBe('Import complete.');
      expect(result.results?.successCount).toBe(2);
      
      const createdRooms = await prisma.room.findMany({ where: { propertyId } });
      expect(createdRooms).toHaveLength(2);
    }, 30000);

    it('should handle invalid room data', async () => {
      const roomsData = [
        { name: 'Invalid Room', type: '', beds: '1', pricePerNight: '5000', maxOccupancy: '1' }
      ];

      (Papa.parse as jest.Mock).mockImplementation((file, config) => {
        if (config.complete) {
          config.complete({ data: roomsData, errors: [], meta: {} });
        }
      });

      const mockFile = new Blob(['dummy'], { type: 'text/csv' }) as File;
      const formData = new FormData();
      formData.append('file', mockFile);

      const result = await importRooms(propertyId, {}, formData);
      expect(result.results?.failCount).toBe(1);
    }, 30000);
  });

  describe('importBookings', () => {
    it('should import bookings successfully', async () => {
      // Create a room first
      await prisma.room.create({
        data: { id: 'room-1', propertyId, name: 'Import Room 1', type: 'private', beds: 1, maxOccupancy: 1, pricePerNight: 1000 }
      });

      const bookingsData = [
        { guestFirstName: 'New', guestLastName: 'Booking', roomName: 'Import Room 1', checkIn: '2025-02-01', checkOut: '2025-02-05', status: 'confirmed', email: 'new@example.com' }
      ];

      (Papa.parse as jest.Mock).mockImplementation((file, config) => {
        if (config.complete) {
          config.complete({ data: bookingsData, errors: [], meta: {} });
        }
      });

      const mockFile = new Blob(['dummy'], { type: 'text/csv' }) as File;
      const formData = new FormData();
      formData.append('file', mockFile);

      const result = await importBookings(propertyId, {}, formData);
      expect(result.message).toBe('Import complete.');
      expect(result.results?.successCount).toBe(1);

      const createdBookings = await prisma.booking.findMany({ where: { propertyId } });
      expect(createdBookings).toHaveLength(1);
    }, 30000);

    it('should fail to import booking if room is unavailable', async () => {
      // 1. Create a room
      const room = await prisma.room.create({
        data: { id: 'room-fail', propertyId, name: 'Full Room', type: 'private', beds: 1, maxOccupancy: 1, pricePerNight: 1000 }
      });

      // 2. Create an existing booking that fills the room
      const guest = await prisma.guest.create({
        data: { propertyId, firstName: 'Existing', lastName: 'Guest' }
      });

      await prisma.booking.create({
        data: {
          propertyId,
          guestId: guest.id,
          checkIn: new Date('2025-02-01'),
          checkOut: new Date('2025-02-05'),
          status: 'confirmed',
          beds: { create: { roomId: room.id, bedLabel: '1', pricePerNight: 1000 } }
        }
      });

      // 3. Try to import a conflicting booking
      const bookingsData = [
        { guestFirstName: 'Conflict', guestLastName: 'User', roomName: 'Full Room', checkIn: '2025-02-02', checkOut: '2025-02-04', status: 'confirmed', email: 'conflict@example.com' }
      ];

      (Papa.parse as jest.Mock).mockImplementation((file, config) => {
        if (config.complete) {
          config.complete({ data: bookingsData, errors: [], meta: {} });
        }
      });

      const mockFile = new Blob(['dummy'], { type: 'text/csv' }) as File;
      const formData = new FormData();
      formData.append('file', mockFile);

      const result = await importBookings(propertyId, {}, formData);
      expect(result.results?.failCount).toBe(1);
      expect(result.results?.successCount).toBe(0);
    }, 30000);
  });
});