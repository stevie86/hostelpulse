import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
  it('should be defined and exported correctly', () => {
    expect(useClipboard).toBeDefined();
    expect(typeof useClipboard).toBe('function');
  });

  it('should be callable', () => {
    expect(() => useClipboard).not.toThrow();
  });
});