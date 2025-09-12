import { mockRooms, mockGuests, mockBookings, mockPricing } from '../../lib/mock-room-data';

describe('mock-room-data', () => {
  it('has rooms with required fields', () => {
    expect(Array.isArray(mockRooms)).toBe(true);
    expect(mockRooms.length).toBeGreaterThan(0);
    const r = mockRooms[0];
    expect(r).toEqual(
      expect.objectContaining({ id: expect.any(String), name: expect.any(String), capacity: expect.any(Number) })
    );
  });

  it('has guests and bookings data', () => {
    expect(mockGuests.length).toBeGreaterThan(0);
    expect(mockBookings.length).toBeGreaterThan(0);
  });

  it('has pricing configured for some rooms', () => {
    expect(mockPricing.length).toBeGreaterThan(0);
    const p = mockPricing[0];
    expect(p).toEqual(expect.objectContaining({ roomId: expect.any(String), basePrice: expect.any(Number) }));
  });
});

