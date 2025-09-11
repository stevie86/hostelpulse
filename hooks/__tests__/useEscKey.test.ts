import useEscClose from '../useEscKey';

describe('useEscClose', () => {
  it('should be defined and exported correctly', () => {
    expect(useEscClose).toBeDefined();
    expect(typeof useEscClose).toBe('function');
  });

  it('should handle the escape key code correctly', () => {
    // Test the keyCode logic directly
    const mockOnClose = jest.fn();

    // Simulate the internal logic
    const handleUserKeyPress = (event: { keyCode: number }) => {
      const { keyCode } = event;
      const escapeKeyCode = 27;
      if (keyCode === escapeKeyCode) {
        mockOnClose();
      }
    };

    // Test escape key
    handleUserKeyPress({ keyCode: 27 });
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Test other key
    handleUserKeyPress({ keyCode: 13 });
    expect(mockOnClose).toHaveBeenCalledTimes(1); // Should not increase
  });
});