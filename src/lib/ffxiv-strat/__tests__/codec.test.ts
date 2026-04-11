import {
  encryptCipher, decryptCipher,
  encodeBase64, decodeBase64,
  unwrapStgy, wrapStgy,
} from '../codec';

describe('codec', () => {
  describe('cipher round-trip', () => {
    it('encrypt then decrypt returns original', () => {
      const original = 'SGVsbG8gV29ybGQ';
      const key = 42;
      const encrypted = encryptCipher(original, key);
      expect(encrypted).not.toBe(original);
      const decrypted = decryptCipher(encrypted, key);
      expect(decrypted).toBe(original);
    });
    it('works with key=0', () => {
      const original = 'AAAA';
      const encrypted = encryptCipher(original, 0);
      const decrypted = decryptCipher(encrypted, 0);
      expect(decrypted).toBe(original);
    });
    it('works with key=63', () => {
      const original = 'test1234';
      const encrypted = encryptCipher(original, 63);
      const decrypted = decryptCipher(encrypted, 63);
      expect(decrypted).toBe(original);
    });
  });
  describe('base64 round-trip', () => {
    it('encode then decode returns original bytes', () => {
      const data = new Uint8Array([0, 1, 2, 255, 128, 64]);
      const encoded = encodeBase64(data);
      expect(encoded).not.toMatch(/[+/=]/);
      const decoded = decodeBase64(encoded);
      expect(decoded).toEqual(data);
    });
    it('handles empty input', () => {
      const data = new Uint8Array([]);
      const encoded = encodeBase64(data);
      const decoded = decodeBase64(encoded);
      expect(decoded).toEqual(data);
    });
  });
  describe('unwrapStgy / wrapStgy', () => {
    it('unwrapStgy extracts key char and payload', () => {
      const { keyChar, payload } = unwrapStgy('[stgy:aXhello]');
      expect(keyChar).toBe('X');
      expect(payload).toBe('hello');
    });
    it('unwrapStgy throws on missing prefix', () => {
      expect(() => unwrapStgy('hello')).toThrow('missing prefix');
    });
    it('unwrapStgy throws on missing suffix', () => {
      expect(() => unwrapStgy('[stgy:aXhello')).toThrow('missing suffix');
    });
    it('unwrapStgy throws on too-short payload', () => {
      expect(() => unwrapStgy('[stgy:aX]')).toThrow('too short');
    });
    it('wrapStgy produces valid format', () => {
      const result = wrapStgy('X', 'hello');
      expect(result).toBe('[stgy:aXhello]');
    });
  });
});
