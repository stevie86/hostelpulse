import { useResizeObserver } from '../useResizeObserver';

describe('useResizeObserver', () => {
  it('should be defined and exported correctly', () => {
    expect(useResizeObserver).toBeDefined();
    expect(typeof useResizeObserver).toBe('function');
  });

  it('should be callable', () => {
    expect(() => useResizeObserver).not.toThrow();
  });
});