import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the prefs module - must be at top level
vi.mock('../../src/utils/prefs', () => ({
  getPref: vi.fn()
}));

import { transformPromptWithContext } from '../../src/utils/llmPrompt';
import { getPref } from '../../src/utils/prefs';

describe('llmPrompt utility functions', () => {
  describe('transformPromptWithContext function', () => {
    const mockData = {
      itemId: null,
      result: '',
      rawResult: '',
      status: undefined,
      retry: 0,
      serviceId: 'test',
      type: 'text' as const,
      langFrom: 'en',
      langTo: 'zh',
      sourceText: 'Hello World',
      audioUrl: '',
      cacheKey: '',
      context: {}
    } as any;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should replace placeholders in prompt template', () => {
      vi.mocked(getPref).mockImplementation((key) => {
        if (key === 'llmPrompt') return 'Translate from ${langFrom} to ${langTo}: ${sourceText}';
        if (key === 'attachPaperContext') return false;
        return '';
      });

      const result = transformPromptWithContext(
        'llmPrompt',
        'en',
        'zh',
        'Hello World',
        mockData
      );

      expect(result).toBe('Translate from en to zh: Hello World');
    });

    it('should replace langFrom placeholder', () => {
      vi.mocked(getPref).mockImplementation((key) => {
        if (key === 'llmPrompt') return 'Source: ${langFrom}';
        return false;
      });

      const result = transformPromptWithContext(
        'llmPrompt',
        'fr',
        'de',
        'Test',
        mockData
      );

      expect(result).toContain('fr');
    });

    it('should replace langTo placeholder', () => {
      vi.mocked(getPref).mockImplementation((key) => {
        if (key === 'llmPrompt') return 'Target: ${langTo}';
        return false;
      });

      const result = transformPromptWithContext(
        'llmPrompt',
        'en',
        'ja',
        'Test',
        mockData
      );

      expect(result).toContain('ja');
    });

    it('should replace sourceText placeholder', () => {
      vi.mocked(getPref).mockImplementation((key) => {
        if (key === 'llmPrompt') return 'Text: ${sourceText}';
        return false;
      });

      const result = transformPromptWithContext(
        'llmPrompt',
        'en',
        'zh',
        'Sample text',
        mockData
      );

      expect(result).toContain('Sample text');
    });

    it('should handle multiple occurrences of same placeholder', () => {
      vi.mocked(getPref).mockImplementation((key) => {
        if (key === 'llmPrompt') return '${langFrom} -> ${langTo} | ${sourceText} (${langFrom})';
        return false;
      });

      const result = transformPromptWithContext(
        'llmPrompt',
        'en',
        'zh',
        'Test',
        mockData
      );

      expect(result).toBe('en -> zh | Test (en)');
    });

    it('should handle empty source text', () => {
      vi.mocked(getPref).mockImplementation((key) => {
        if (key === 'llmPrompt') return 'Text: "${sourceText}"';
        return false;
      });

      const result = transformPromptWithContext(
        'llmPrompt',
        'en',
        'zh',
        '',
        mockData
      );

      expect(result).toBe('Text: ""');
    });

    it('should preserve special characters in replacements', () => {
      vi.mocked(getPref).mockImplementation((key) => {
        if (key === 'llmPrompt') return '${sourceText}';
        return false;
      });

      const result = transformPromptWithContext(
        'llmPrompt',
        'en',
        'zh',
        'Hello\nWorld\t!',
        mockData
      );

      expect(result).toBe('Hello\nWorld\t!');
    });
  });
});
