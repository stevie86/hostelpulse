import { getReadTime } from '../readTime';

describe('getReadTime', () => {
  it('should return "< 1min read" for very short text', () => {
    const shortText = 'Hello world';
    const result = getReadTime(shortText);
    expect(result).toBe('< 1min read');
  });

  it('should calculate read time correctly for average text', () => {
    // Average reading speed is about 200-250 words per minute
    // This text is approximately 50 words, so should be about 0.2-0.25 minutes
    const text = 'This is a sample text that contains approximately fifty words for testing purposes. We want to make sure the reading time calculation works correctly with different text lengths and complexities.';
    const result = getReadTime(text);
    expect(result).toBe('< 1min read');
  });

  it('should return "1min read" for text that takes about 1 minute', () => {
    // Create text that should take approximately 1 minute to read
    const words = Array(200).fill('word').join(' ');
    const result = getReadTime(words);
    expect(result).toBe('1min read');
  });

  it('should round up correctly for longer texts', () => {
    // Create text that should take about 2.7 minutes
    const words = Array(540).fill('word').join(' ');
    const result = getReadTime(words);
    expect(result).toBe('3min read');
  });

  it('should handle empty string', () => {
    const result = getReadTime('');
    expect(result).toBe('< 1min read');
  });

  it('should handle text with only whitespace', () => {
    const result = getReadTime('   \n\t   ');
    expect(result).toBe('< 1min read');
  });

  it('should handle very long text correctly', () => {
    const longText = 'word '.repeat(1000);
    const result = getReadTime(longText);
    expect(result).toBe('5min read');
  });

  it('should handle text with special characters', () => {
    const textWithSpecialChars = 'Hello! @world# $test% ^special& *chars( )more+ text= here';
    const result = getReadTime(textWithSpecialChars);
    expect(result).toBe('< 1min read');
  });

  it('should handle text with numbers', () => {
    const textWithNumbers = 'The year is 2023 and there are 365 days in a year';
    const result = getReadTime(textWithNumbers);
    expect(result).toBe('< 1min read');
  });
});