import { StratDecodeError } from './types';
import { STGY_PREFIX, STGY_SUFFIX, MIN_PAYLOAD_LENGTH } from './types';
import {
  ALPHABET_TABLE, REVERSE_ALPHABET_TABLE,
  base64CharToValue, valueToBase64Char,
} from './tables';

/**
 * Decrypts a substitution-ciphered payload into a standard base64 string.
 *
 * @remarks
 * For each character at position `i`:
 * `decoded = (charValue - i - key) mod 64`
 *
 * @param encrypted - The ciphered payload (custom alphabet characters).
 * @param key - The 6-bit cipher key derived from `CRC32 & 0x3F`.
 * @returns A standard URL-safe base64 string.
 * @throws {@link StratDecodeError} if any character is not in {@link ALPHABET_TABLE}.
 */
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

/**
 * Encrypts a standard base64 string into a substitution-ciphered payload.
 *
 * @remarks
 * Inverse of {@link decryptCipher}. For each character at position `i`:
 * `encoded = (charValue + i + key) & 0x3F`
 *
 * @param base64 - A standard URL-safe base64 string.
 * @param key - The 6-bit cipher key.
 * @returns The ciphered payload in custom alphabet characters.
 */
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

/**
 * Encodes binary data to a URL-safe base64 string (no padding).
 *
 * @param data - Raw bytes to encode.
 * @returns URL-safe base64 string (`-` and `_` instead of `+` and `/`).
 */
export function encodeBase64(data: Uint8Array): string {
  const chunkSize = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    parts.push(String.fromCharCode(...data.subarray(i, i + chunkSize)));
  }
  const binary = parts.join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a URL-safe base64 string to binary data.
 *
 * @param base64 - URL-safe base64 string (padding is added automatically).
 * @returns Decoded bytes.
 */
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

/**
 * Strips the `[stgy:a...]` shell and extracts the key character and payload.
 *
 * @param input - A complete `[stgy:a...]` string.
 * @returns The first payload character (key) and the remaining cipher text.
 * @throws {@link StratDecodeError} if the prefix, suffix, or minimum length is invalid.
 */
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

/**
 * Wraps a key character and ciphered payload in the `[stgy:a...]` shell.
 *
 * @param keyChar - The cipher key character (from {@link REVERSE_KEY_TABLE}).
 * @param payload - The encrypted payload string.
 * @returns The complete `[stgy:a...]` string.
 */
export function wrapStgy(keyChar: string, payload: string): string {
  return `${STGY_PREFIX}${keyChar}${payload}${STGY_SUFFIX}`;
}
