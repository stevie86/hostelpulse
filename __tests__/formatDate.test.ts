import { formatDate } from '../utils/formatDate';

describe('formatDate', () => {
  it('formats a valid Date into "do MMMM yyyy"', () => {
    const date = new Date(2020, 0, 2); // Jan 2, 2020 (local)
    expect(formatDate(date)).toBe('2nd January 2020');
  });

  it('returns N/A for invalid date', () => {
    // @ts-expect-error: deliberately passing an invalid Date for test
    const invalid = new Date('invalid');
    expect(formatDate(invalid as unknown as Date)).toBe('N/A');
  });
});

