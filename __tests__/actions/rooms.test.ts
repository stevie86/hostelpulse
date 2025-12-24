import { createRoom, deleteRoom } from '@/app/actions/rooms';
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

describe('Room Actions', () => {
  const propertyId = 'prop-123';
  const teamId = 'team-123';

  beforeEach(async () => {
    // Cleanup
    await prisma.bookingBed.deleteMany();
    await prisma.room.deleteMany();
    await prisma.property.deleteMany();
    await prisma.team.deleteMany();

    // Setup
    await prisma.team.create({
      data: {
        id: teamId,
        name: 'Test Team',
        slug: 'test-team',
      },
    });

    await prisma.property.create({
      data: {
        id: propertyId,
        teamId: teamId,
        name: 'Test Property',
        city: 'Test City',
      },
    });
  });

  it('should create a room successfully', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Room');
    formData.append('type', 'private');
    formData.append('beds', '2');
    formData.append('pricePerNight', '5000'); // 50.00
    formData.append('maxOccupancy', '2');

    const result = await createRoom(propertyId, {}, formData);
    if (result && result.message) {
      console.error('Create Room Failed:', result);
    }

    const room = await prisma.room.findFirst({
      where: { name: 'Test Room' },
    });

    expect(room).not.toBeNull();
    if (room) {
      expect(room.beds).toBe(2);
    }
  });

  it('should validate input (negative price)', async () => {
    const formData = new FormData();
    formData.append('name', 'Bad Room');
    formData.append('type', 'private');
    formData.append('beds', '1');
    formData.append('pricePerNight', '-100'); // Invalid

    const result = await createRoom(propertyId, {}, formData);

    expect(result.errors?.pricePerNight).toBeDefined();

    const room = await prisma.room.findFirst({
      where: { name: 'Bad Room' },
    });
    expect(room).toBeNull();
  });
});
