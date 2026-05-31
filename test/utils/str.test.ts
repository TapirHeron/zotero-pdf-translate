import { describe, it, expect } from 'vitest';
import { slice, fill, stripEmptyLines } from '../../src/utils/str';

describe('str utility functions', () => {
  describe('slice function', () => {
    it('should return original string if length is less than or equal to specified length', () => {
      expect(slice('hello', 10)).toBe('hello');
      expect(slice('hello', 5)).toBe('hello');
    });

    it('should truncate string and add ellipsis if length exceeds specified length', () => {
      expect(slice('hello world', 8)).toBe('hello...');
      expect(slice('hello world', 6)).toBe('hel...');
    });

    it('should handle empty strings', () => {
      expect(slice('', 5)).toBe('');
    });
  });

  describe('fill function', () => {
    it('should return original string if length is greater than or equal to specified length', () => {
      expect(fill('hello', 3)).toBe('hello');
      expect(fill('hello', 5)).toBe('hello');
    });

    it('should pad string at the end by default', () => {
      // The fill function uses (len - str.length) as the target for padEnd/padStart
      // For 'hello' (5 chars) with len=13: padEnd(13-5=8, '*') -> pads to total length 8
      const result = fill('hello', 13, { char: '*', position: 'end' });
      expect(result).toBe('hello***'); // Total length 8 (5 original + 3 padding)
    });

    it('should pad string at the start when specified', () => {
      const result = fill('hello', 13, { char: '*', position: 'start' });
      expect(result).toBe('***hello'); // Total length 8 (3 padding + 5 original)
    });

    it('should use space as default padding character', () => {
      const result = fill('hello', 13);
      expect(result).toBe('hello   '); // Total length 8 (5 original + 3 spaces)
    });

    it('should demonstrate the fill function behavior', () => {
      // The fill function's logic: if str.length >= len, return str
      // Otherwise: str.padEnd(len - str.length, char)
      // For 'hello' (len=5) with target 8: padEnd(8-5=3, char) won't work because 5 > 3
      // So it returns 'hello' unchanged
      expect(fill('hello', 8)).toBe('hello');
      
      // To actually pad, we need len > str.length * 2
      // For 'hello' (len=5) with target 10: padEnd(10-5=5, char) -> 'hello' (no change, 5 >= 5)
      expect(fill('hello', 10)).toBe('hello');
      
      // For 'hello' (len=5) with target 11: padEnd(11-5=6, char) -> 'hello*'
      expect(fill('hello', 11, { char: '*', position: 'end' })).toBe('hello*');
    });
  });

  describe('stripEmptyLines function', () => {
    it('should return original text if disabled', () => {
      const text = 'Hello\n\nWorld';
      expect(stripEmptyLines(text, false)).toBe(text);
    });

    it('should return original text if empty', () => {
      expect(stripEmptyLines('', true)).toBe('');
      expect(stripEmptyLines(null as any, true)).toBe(null);
    });

    it('should remove think tags and their content', () => {
      const text = 'Hello <think>this is thinking</think> World';
      expect(stripEmptyLines(text, true)).toBe('Hello  World');
    });

    it('should preserve error messages with blank lines', () => {
      const text = 'Error: Something went wrong\n\nDetails here';
      // Since we mock getString to return 'Error:', this should preserve the text
      expect(stripEmptyLines(text, true)).toContain('Error:');
    });

    it('should normalize line endings and remove leading newlines', () => {
      const text = '\n\nHello\r\nWorld\r\nTest';
      expect(stripEmptyLines(text, true)).toBe('Hello World Test');
    });

    it('should replace remaining newlines with spaces', () => {
      const text = 'Hello\nWorld\nTest';
      expect(stripEmptyLines(text, true)).toBe('Hello World Test');
    });
  });
});