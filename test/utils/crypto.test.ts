import { describe, it, expect } from 'vitest';
import { hex, base64 } from '../../src/utils/crypto';

// Since crypto functions depend on browser APIs that are complex to mock,
// we'll create a simplified test that focuses on the exported functions existence
// and basic behavior where possible

describe('crypto utility functions', () => {
  it('should export required functions', async () => {
    const cryptoModule = await import('../../src/utils/crypto');
    
    expect(cryptoModule.base64).toBeDefined();
    expect(cryptoModule.randomString).toBeDefined();
    expect(cryptoModule.hex).toBeDefined();
    expect(cryptoModule.hmacSha1Digest).toBeDefined();
    expect(cryptoModule.hmacSha256Digest).toBeDefined();
    expect(cryptoModule.sha256Digest).toBeDefined();
    expect(cryptoModule.aesEcbEncrypt).toBeDefined();
  });

  it('hex function should convert ArrayBuffer to hex string', () => {
    // Create a simple buffer for testing
    const buffer = new Uint8Array([0, 1, 2, 255]).buffer;
    const result = hex(buffer);
    
    expect(result).toBe('000102ff');
  });

  it('base64 function should convert ArrayBuffer to base64 string', () => {
    // Create a simple buffer for testing
    const str = 'Hello World';
    const buffer = new TextEncoder().encode(str).buffer;
    const result = base64(buffer);
    
    expect(result).toBe(btoa(str));
  });
});