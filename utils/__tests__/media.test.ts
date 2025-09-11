import { media } from '../media';

describe('media', () => {
  it('should be defined and exported correctly', () => {
    expect(media).toBeDefined();
    expect(typeof media).toBe('function');
  });

  it('should be callable', () => {
    expect(() => media).not.toThrow();
  });
});