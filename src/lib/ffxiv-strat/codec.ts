import { StratDecodeError } from './types';
import { STGY_PREFIX, STGY_SUFFIX, MIN_PAYLOAD_LENGTH } from './types';
import {
  ALPHABET_TABLE, REVERSE_ALPHABET_TABLE,
  base64CharToValue, valueToBase64Char,
} from './tables';

export function decryptCipher(encrypted: string, key: number): string {
  let result = '';
  for (let i = 0; i < encrypted.length; i++) {
    const char = encrypted[i];
    const mapped = ALPHABET_TABLE[char];
    if (mapped === undefined) {
      throw new StratDecodeError(`Unknown cipher character: ${char}`);
    }
    const val = base64CharToValue(mapped);
    const decoded = ((val - i - key) % 64 + 64) % 64;
    result += valueToBase64Char(decoded);
  }
  return result;
}

export function encryptCipher(base64: string, key: number): string {
  let result = '';
  for (let i = 0; i < base64.length; i++) {
    const val = base64CharToValue(base64[i]);
    const encoded = (val + i + key) & 0x3f;
    const base64Char = valueToBase64Char(encoded);
    const customChar = REVERSE_ALPHABET_TABLE[base64Char];
    if (customChar === undefined) {
      throw new StratDecodeError(`No reverse mapping for: ${base64Char}`);
    }
    result += customChar;
  }
  return result;
}

export function encodeBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeBase64(base64: string): Uint8Array {
  let std = base64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (std.length % 4)) % 4;
  std += '='.repeat(pad);
  const binary = atob(std);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function unwrapStgy(input: string): { keyChar: string; payload: string } {
  if (!input.startsWith(STGY_PREFIX)) {
    throw new StratDecodeError('Invalid stgy string: missing prefix');
  }
  if (!input.endsWith(STGY_SUFFIX)) {
    throw new StratDecodeError('Invalid stgy string: missing suffix');
  }
  const inner = input.slice(STGY_PREFIX.length, -STGY_SUFFIX.length);
  if (inner.length < MIN_PAYLOAD_LENGTH) {
    throw new StratDecodeError('Invalid stgy string: too short');
  }
  return { keyChar: inner[0], payload: inner.slice(1) };
}

export function wrapStgy(keyChar: string, payload: string): string {
  return `${STGY_PREFIX}${keyChar}${payload}${STGY_SUFFIX}`;
}
