import { formatDate } from '../formatDate';

describe('formatDate', () => {
  it('should format a valid Date object correctly', () => {
    const date = new Date('2023-10-15');
    const result = formatDate(date);
    expect(result).toBe('15th October 2023');
  });

  it('should format a valid timestamp correctly', () => {
    const timestamp = new Date('2023-01-01').getTime();
    const result = formatDate(timestamp);
    expect(result).toBe('1st January 2023');
  });

  it('should return "N/A" for invalid date', () => {
    const result = formatDate(new Date('invalid'));
    expect(result).toBe('N/A');
  });

  it('should return "N/A" for null input', () => {
    const result = formatDate(null as any);
    expect(result).toBe('N/A');
  });

  it('should return "N/A" for undefined input', () => {
    const result = formatDate(undefined as any);
    expect(result).toBe('N/A');
  });

  it('should handle edge cases with different date formats', () => {
    const date = new Date('2023-02-28');
    const result = formatDate(date);
    expect(result).toBe('28th February 2023');
  });

  it('should handle leap year dates correctly', () => {
    const date = new Date('2024-02-29');
    const result = formatDate(date);
    expect(result).toBe('29th February 2024');
  });
});