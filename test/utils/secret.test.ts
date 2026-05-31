import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the prefs module
vi.mock('../../src/utils/prefs', () => ({
  getPref: vi.fn(),
  setPref: vi.fn(),
  getPrefJSON: vi.fn(),
}));

import { getServiceSecret, setServiceSecret, validateServiceSecret } from '../../src/utils/secret';
import { getPrefJSON, setPref } from '../../src/utils/prefs';

describe('secret utility functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getServiceSecret function', () => {
    it('should return secret for a service', () => {
      const mockSecrets = { google: 'test-key-123', deepl: 'another-key' };
      vi.mocked(getPrefJSON).mockReturnValue(mockSecrets);

      const result = getServiceSecret('google');
      expect(result).toBe('test-key-123');
      expect(getPrefJSON).toHaveBeenCalledWith('secretObj');
    });

    it('should return empty string when secret not found', () => {
      vi.mocked(getPrefJSON).mockReturnValue({});

      const result = getServiceSecret('nonexistent');
      expect(result).toBe('');
    });

    it('should handle JSON parse error gracefully', () => {
      vi.mocked(getPrefJSON).mockImplementation(() => {
        throw new Error('Invalid JSON');
      });

      const result = getServiceSecret('google');
      expect(result).toBe('');
      expect(setPref).toHaveBeenCalledWith('secretObj', '{}');
    });
  });

  describe('setServiceSecret function', () => {
    it('should set secret for a service', () => {
      const existingSecrets = { google: 'old-key' };
      vi.mocked(getPrefJSON).mockReturnValue(existingSecrets);

      setServiceSecret('deepl', 'new-key');

      expect(setPref).toHaveBeenCalledWith(
        'secretObj',
        JSON.stringify({ google: 'old-key', deepl: 'new-key' })
      );
    });

    it('should trim whitespace from secret', () => {
      vi.mocked(getPrefJSON).mockReturnValue({});

      setServiceSecret('google', '  key-with-spaces  ');

      expect(setPref).toHaveBeenCalledWith(
        'secretObj',
        JSON.stringify({ google: 'key-with-spaces' })
      );
    });

    it('should create new secrets object if none exists', () => {
      vi.mocked(getPrefJSON).mockImplementation(() => {
        throw new Error('No data');
      });

      setServiceSecret('google', 'test-key');

      expect(setPref).toHaveBeenCalledWith(
        'secretObj',
        JSON.stringify({ google: 'test-key' })
      );
    });

    it('should update existing secret', () => {
      const existingSecrets = { google: 'old-key' };
      vi.mocked(getPrefJSON).mockReturnValue(existingSecrets);

      setServiceSecret('google', 'updated-key');

      expect(setPref).toHaveBeenCalledWith(
        'secretObj',
        JSON.stringify({ google: 'updated-key' })
      );
    });
  });

  describe('validateServiceSecret function', () => {
    it('should return valid status when no validator exists', () => {
      // Mock the addon global
      (global as any).addon = {
        data: {
          translate: {
            services: {
              getServiceById: vi.fn().mockReturnValue(null)
            }
          }
        }
      };

      vi.mocked(getPrefJSON).mockReturnValue({ google: 'test-key' });

      const result = validateServiceSecret('google');

      expect(result).toEqual({
        secret: 'test-key',
        status: true,
        info: ''
      });
    });

    it('should call validator when it exists', () => {
      const mockValidator = vi.fn().mockReturnValue({
        secret: 'valid-key',
        status: true,
        info: 'Valid'
      });

      (global as any).addon = {
        data: {
          translate: {
            services: {
              getServiceById: vi.fn().mockReturnValue({
                secretValidator: mockValidator
              })
            }
          }
        }
      };

      vi.mocked(getPrefJSON).mockReturnValue({ test: 'valid-key' });

      const result = validateServiceSecret('test');

      expect(mockValidator).toHaveBeenCalledWith('valid-key');
      expect(result.status).toBe(true);
    });

    it('should call callback when provided', () => {
      const mockValidator = vi.fn().mockReturnValue({
        secret: 'key',
        status: false,
        info: 'Invalid'
      });

      const mockCallback = vi.fn();

      (global as any).addon = {
        data: {
          translate: {
            services: {
              getServiceById: vi.fn().mockReturnValue({
                secretValidator: mockValidator
              })
            }
          }
        }
      };

      vi.mocked(getPrefJSON).mockReturnValue({ test: 'key' });

      validateServiceSecret('test', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith({
        secret: 'key',
        status: false,
        info: 'Invalid'
      });
    });
  });
});
