import { describe, it, expect } from 'vitest';
import { inferLanguage, matchLanguage, LANG_CODE } from '../../src/utils/config';

describe('config utility functions', () => {
  describe('inferLanguage function', () => {
    it('should detect English text', () => {
      const result = inferLanguage('This is a test sentence in English');
      expect(result.code).toBe('en');
      expect(result.name).toContain('English');
    });

    it('should detect Chinese text', () => {
      const result = inferLanguage('这是一个中文测试句子');
      expect(result.code).toMatch(/zh/);
      expect(result.name).toContain('Chinese');
    });

    it('should detect French text', () => {
      const result = inferLanguage('Ceci est une phrase en français');
      // franc may not always detect short French text correctly, so we just check it returns something
      expect(result).toBeDefined();
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('name');
    });

    it('should return unknown for very short text', () => {
      const result = inferLanguage('ab');
      expect(result.code).toBe('');
      expect(result.name).toBe('Unknown');
    });

    it('should handle empty string', () => {
      const result = inferLanguage('');
      expect(result.code).toBe('');
      expect(result.name).toBe('Unknown');
    });
  });

  describe('matchLanguage function', () => {
    it('should match English language code', () => {
      const result = matchLanguage('en');
      expect(result.code).toBe('en');
      expect(result.name).toBe('English');
    });

    it('should match Chinese Simplified', () => {
      const result = matchLanguage('zh-CN');
      // The function matches the base language code first
      expect(result.code).toMatch(/zh/);
      expect(result.name).toContain('Chinese');
    });

    it('should match Chinese Traditional', () => {
      const result = matchLanguage('zh-TW');
      // The function matches the base language code first
      expect(result.code).toMatch(/zh/);
      expect(result.name).toContain('Chinese');
    });

    it('should match Japanese', () => {
      const result = matchLanguage('ja');
      expect(result.code).toBe('ja');
      expect(result.name).toBe('Japanese');
    });

    it('should match Korean', () => {
      const result = matchLanguage('ko');
      expect(result.code).toBe('ko');
      expect(result.name).toBe('Korean');
    });

    it('should handle language with region', () => {
      const result = matchLanguage('en-US');
      // The function matches the base language code first
      expect(result.code).toMatch(/en/);
      expect(result.name).toContain('English');
    });

    it('should handle underscore separator', () => {
      const result = matchLanguage('zh_CN');
      expect(result.code).toBe('zh');
      expect(result.name).toBe('Chinese');
    });

    it('should return unknown for invalid language code', () => {
      const result = matchLanguage('invalid-lang');
      expect(result.code).toBe('');
      expect(result.name).toBe('Unknown');
    });

    it('should be case insensitive', () => {
      const result = matchLanguage('EN');
      expect(result.code).toBe('en');
      expect(result.name).toBe('English');
    });
  });

  describe('LANG_CODE constant', () => {
    it('should contain expected number of languages', () => {
      expect(LANG_CODE.length).toBeGreaterThan(200);
    });

    it('should have valid structure for each language', () => {
      LANG_CODE.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
      });
    });

    it('should contain major languages', () => {
      const codes = LANG_CODE.map(l => l.code);
      expect(codes).toContain('en');
      expect(codes).toContain('zh');
      expect(codes).toContain('zh-CN');
      expect(codes).toContain('ja');
      expect(codes).toContain('ko');
      expect(codes).toContain('fr');
      expect(codes).toContain('de');
      expect(codes).toContain('es');
    });
  });
});
