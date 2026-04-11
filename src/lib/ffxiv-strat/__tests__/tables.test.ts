import {
  KEY_TABLE,
  ALPHABET_TABLE,
  base64CharToValue,
  valueToBase64Char,
} from '../tables';

describe('tables', () => {
  describe('KEY_TABLE', () => {
    it('has 64 entries (a-z, A-Z, 0-9, +, -)', () => {
      expect(Object.keys(KEY_TABLE).length).toBe(64);
    });
    it('maps known key chars correctly', () => {
      expect(KEY_TABLE['+']).toBe('N');
      expect(KEY_TABLE['a']).toBe('i');
      expect(KEY_TABLE['z']).toBe('Q');
    });
  });
  describe('ALPHABET_TABLE', () => {
    it('has 64 entries', () => {
      expect(Object.keys(ALPHABET_TABLE).length).toBe(64);
    });
    it('maps known chars correctly', () => {
      expect(ALPHABET_TABLE['b']).toBe('-');
      expect(ALPHABET_TABLE['W']).toBe('_');
      expect(ALPHABET_TABLE['0']).toBe('x');
    });
  });
  describe('base64CharToValue', () => {
    it('maps A-Z to 0-25', () => {
      expect(base64CharToValue('A')).toBe(0);
      expect(base64CharToValue('Z')).toBe(25);
    });
    it('maps a-z to 26-51', () => {
      expect(base64CharToValue('a')).toBe(26);
      expect(base64CharToValue('z')).toBe(51);
    });
    it('maps 0-9 to 52-61', () => {
      expect(base64CharToValue('0')).toBe(52);
      expect(base64CharToValue('9')).toBe(61);
    });
    it('maps - to 62 and _ to 63', () => {
      expect(base64CharToValue('-')).toBe(62);
      expect(base64CharToValue('_')).toBe(63);
    });
    it('throws on invalid char', () => {
      expect(() => base64CharToValue('!')).toThrow();
    });
  });
  describe('valueToBase64Char', () => {
    it('round-trips with base64CharToValue for all 64 values', () => {
      for (let i = 0; i < 64; i++) {
        expect(base64CharToValue(valueToBase64Char(i))).toBe(i);
      }
    });
    it('throws on out-of-range values', () => {
      expect(() => valueToBase64Char(-1)).toThrow();
      expect(() => valueToBase64Char(64)).toThrow();
    });
  });
});
