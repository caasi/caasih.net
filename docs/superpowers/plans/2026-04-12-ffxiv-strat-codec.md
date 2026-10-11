# FFXIV Strategy Board Codec — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a TypeScript encoder/decoder for FFXIV strategy board `[stgy:...]` share codes, with a demo page in caasih.net's Playground.

**Architecture:** Multi-layer codec (substitution cipher → base64 → CRC32+zlib → SoA binary), ported from marimelon/stgy-tools (MIT). Each layer is a separate file with its own tests. The module lives at `src/lib/ffxiv-strat/` for future npm extraction.

**Tech Stack:** TypeScript, pako (zlib), Jest + @swc/jest, React 17

**Spec:** `docs/superpowers/specs/2026-04-12-ffxiv-strat-codec-design.md`

**Primary code reference:** [marimelon/stgy-tools](https://github.com/marimelon/stgy-tools) (MIT)
**Primary spec reference:** [wtw0212/ff14-strategyboard-decode](https://github.com/wtw0212/ff14-strategyboard-decode) (MIT)

---

## File Map

### New files

| File | Responsibility |
|------|---------------|
| `tsconfig.json` | TypeScript config for type checking and editor support |
| `src/lib/ffxiv-strat/types.ts` | Type definitions (`BoardData`, `BoardObject`, etc.) and error classes |
| `src/lib/ffxiv-strat/tables.ts` | Substitution tables (`KEY_TABLE`, `ALPHABET_TABLE`), base64 char↔value |
| `src/lib/ffxiv-strat/codec.ts` | Substitution cipher + URL-safe base64 + `[stgy:a...]` shell |
| `src/lib/ffxiv-strat/compression.ts` | CRC32 (vendored) + 6-byte header + zlib via pako |
| `src/lib/ffxiv-strat/binary.ts` | SoA binary parser + serializer (BinaryReader/BinaryWriter inline) |
| `src/lib/ffxiv-strat/index.ts` | Public API: `decode()`, `encode()` |
| `src/lib/ffxiv-strat/LICENSE` | MIT license text |
| `src/lib/ffxiv-strat/NOTICE` | Attribution to marimelon and wtw0212 |
| `src/lib/ffxiv-strat/__tests__/tables.test.ts` | Tests for tables |
| `src/lib/ffxiv-strat/__tests__/codec.test.ts` | Tests for cipher + base64 |
| `src/lib/ffxiv-strat/__tests__/compression.test.ts` | Tests for CRC32 + zlib |
| `src/lib/ffxiv-strat/__tests__/binary.test.ts` | Tests for binary parser/serializer |
| `src/lib/ffxiv-strat/__tests__/strat.test.ts` | Integration tests with real strategy codes |
| `src/pages/Playground/FFXIVStrat/index.jsx` | Demo page |

### Modified files

| File | Change |
|------|--------|
| `config/base.js` | Add `.ts`, `.tsx` to `resolve.extensions` and SWC loader regex |
| `jest.config.js` | Switch SWC parser to `typescript` for `.ts`/`.tsx` files |
| `package.json` | Add `pako` dependency and `@types/pako` devDependency |
| `src/pages/Playground/index.jsx` | Register FFXIVStrat route |

---

## Task 1: TypeScript Build Support

**Files:**
- Create: `tsconfig.json`
- Modify: `config/base.js`
- Modify: `jest.config.js`

- [ ] **Step 1: Add `.ts`/`.tsx` to webpack resolve.extensions**

In `config/base.js`, add `.ts` and `.tsx` to the extensions array:

```javascript
// Before:
extensions: ['.md', '.mdx', '.js', '.jsx'],

// After:
extensions: ['.md', '.mdx', '.js', '.jsx', '.ts', '.tsx'],
```

- [ ] **Step 2: Add a separate SWC loader rule for `.ts`/`.tsx`**

In `config/base.js`, keep the existing `.jsx?` rule unchanged (it uses `ecmascript` parser with `exportDefaultFrom`). Add a **new** rule for TypeScript files right after it:

```javascript
// Existing rule — DO NOT MODIFY:
{
  test: /\.jsx?$/,
  exclude: /node_modules/,
  use: [{ loader: 'swc-loader', options: { /* existing ecmascript config */ } }],
},
// NEW rule for TypeScript:
{
  test: /\.tsx?$/,
  exclude: /node_modules/,
  use: [{
    loader: 'swc-loader',
    options: {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
      },
    },
  }],
},
```

Why a separate rule: the `exportDefaultFrom` option is specific to the `ecmascript` parser and not valid for the `typescript` parser. Keeping them separate avoids breaking existing JS/JSX compilation.

- [ ] **Step 3: Add TypeScript transform to Jest config**

In `jest.config.js`, add a separate transform entry for `.ts`/`.tsx` files. Keep the existing transform for JS/JSX unchanged:

```javascript
transform: {
  // Existing JS/JSX transform — keep as-is:
  '^.+\\.jsx?$': ['@swc/jest', { /* existing ecmascript swcOptions */ }],
  // NEW TypeScript transform:
  '^.+\\.tsx?$': ['@swc/jest', {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
    },
  }],
},
```

Note: The more specific `.tsx?$` pattern won't conflict because Jest uses the first matching transform.

- [ ] **Step 4: Create tsconfig.json**

Create `tsconfig.json` in the project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "jsx": "react",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "noEmit": true,
    "baseUrl": "src",
    "paths": {
      "components/*": ["components/*"],
      "pages/*": ["pages/*"],
      "types/*": ["types/*"],
      "data/*": ["data/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Verify existing tests still pass**

Run: `npx jest --no-coverage 2>&1 | tail -20`

Expected: All existing tests pass (the TypeScript parser in SWC handles JS/JSX).

- [ ] **Step 6: Verify a minimal `.ts` file can be imported**

Create a quick smoke test. Write `src/lib/ffxiv-strat/types.ts` with just:

```typescript
export interface Placeholder {
  value: number;
}
```

Then write `src/lib/ffxiv-strat/__tests__/smoke.test.ts`:

```typescript
import { Placeholder } from '../types';

test('TypeScript import works', () => {
  const p: Placeholder = { value: 42 };
  expect(p.value).toBe(42);
});
```

Run: `npx jest src/lib/ffxiv-strat/__tests__/smoke.test.ts --no-coverage`

Expected: PASS

- [ ] **Step 7: Clean up smoke test and commit**

Delete the smoke test file. Keep `types.ts` — it will be rewritten in Task 3.

```bash
rm src/lib/ffxiv-strat/__tests__/smoke.test.ts
git add tsconfig.json config/base.js jest.config.js src/lib/ffxiv-strat/types.ts
git commit -m "feat: add TypeScript build support for webpack and Jest"
```

---

## Task 2: Install pako

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install pako and types**

```bash
npm install --save pako
npm install --save-dev @types/pako
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add pako dependency for zlib support"
```

---

## Task 3: Types and Error Classes

**Files:**
- Create: `src/lib/ffxiv-strat/types.ts`

- [ ] **Step 1: Write types.ts**

```typescript
// Error classes

export class StratError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StratError';
  }
}

export class StratDecodeError extends StratError {
  constructor(message: string) {
    super(message);
    this.name = 'StratDecodeError';
  }
}

export class StratEncodeError extends StratError {
  constructor(message: string) {
    super(message);
    this.name = 'StratEncodeError';
  }
}

// Data types

export interface ObjectFlags {
  visible: boolean;
  flipHorizontal: boolean;
  flipVertical: boolean;
  locked: boolean;
}

export interface BoardObject {
  objectId: number;
  flags: ObjectFlags;
  position: { x: number; y: number };
  rotation: number;
  size: number;
  color: { r: number; g: number; b: number; opacity: number };
  params: { a: number; b: number; c: number };
  text?: string;
}

export interface BoardData {
  name: string;
  backgroundId: number;
  objects: BoardObject[];
}

// Constants

export const STGY_PREFIX = '[stgy:a';
export const STGY_SUFFIX = ']';
export const MIN_PAYLOAD_LENGTH = 2;
export const BINARY_HEADER_SIZE = 6; // CRC32 (4) + decompressed length (2)
export const COMPRESSED_DATA_OFFSET = 6;
export const BOARD_HEADER_SIZE = 16;
export const TEXT_OBJECT_ID = 0x64; // 100
export const MAX_OBJECTS = 50;
export const MAX_NAME_LENGTH = 20;
export const MAX_TEXT_BYTES = 30;
export const COORDINATE_SCALE = 10;

export const FieldIds = {
  EMPTY: 0x00,
  BOARD_NAME: 0x01,
  OBJECT_ID: 0x02,
  TEXT_TERMINATOR: 0x03, // also used for background
  FLAGS: 0x04,
  POSITIONS: 0x05,
  ROTATIONS: 0x06,
  SIZES: 0x07,
  COLORS: 0x08,
  PARAM_A: 0x0a,
  PARAM_B: 0x0b,
  PARAM_C: 0x0c,
} as const;

export const FlagBits = {
  VISIBLE: 0x01,
  FLIP_HORIZONTAL: 0x02,
  FLIP_VERTICAL: 0x04,
  LOCKED: 0x08,
} as const;

export const SectionType = {
  CONTENT: 0x00,
  BACKGROUND: 0x03,
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ffxiv-strat/types.ts
git commit -m "feat(ffxiv-strat): add type definitions and error classes"
```

---

## Task 4: Substitution Tables

**Files:**
- Create: `src/lib/ffxiv-strat/tables.ts`
- Test: `src/lib/ffxiv-strat/__tests__/tables.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
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
      // From marimelon/stgy-tools constants.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/ffxiv-strat/__tests__/tables.test.ts --no-coverage`

Expected: FAIL — cannot resolve `../tables`

- [ ] **Step 3: Write tables.ts**

Copy the table data exactly from marimelon/stgy-tools `tables.ts` (MIT licensed). The file contains:

- `KEY_TABLE`: Record<string, string> — 64 entries mapping key characters to standard base64 chars
- `ALPHABET_TABLE`: Record<string, string> — 64 entries mapping custom alphabet chars to standard base64 chars
- `REVERSE_ALPHABET_TABLE`: Record<string, string> — reverse of ALPHABET_TABLE (computed)
- `REVERSE_KEY_TABLE`: Record<number, string> — maps base64 values to key chars (computed, used by encoder)
- `base64CharToValue(char: string): number` — URL-safe base64 char to 0-63
- `valueToBase64Char(value: number): string` — 0-63 to URL-safe base64 char

```typescript
import { StratDecodeError } from './types';

export const KEY_TABLE: Record<string, string> = {
  '+': 'N', '-': 'P', '0': 'x', '1': 'g', '2': '0', '3': 'K',
  '4': '8', '5': 'S', '6': 'J', '7': '2', '8': 's', '9': 'Z',
  'A': 'D', 'B': 'F', 'C': 't', 'D': 'T', 'E': '6', 'F': 'E',
  'G': 'a', 'H': 'V', 'I': 'c', 'J': 'p', 'K': 'L', 'L': 'M',
  'M': 'm', 'N': 'e', 'O': 'j', 'P': '9', 'Q': 'X', 'R': 'B',
  'S': '4', 'T': 'R', 'U': 'Y', 'V': '7', 'W': '_', 'X': 'n',
  'Y': 'O', 'Z': 'b', 'a': 'i', 'b': '-', 'c': 'v', 'd': 'H',
  'e': 'C', 'f': 'A', 'g': 'r', 'h': 'W', 'i': 'o', 'j': 'd',
  'k': 'I', 'l': 'q', 'm': 'h', 'n': 'U', 'o': 'l', 'p': 'k',
  'q': '3', 'r': 'f', 's': 'y', 't': '5', 'u': 'G', 'v': 'w',
  'w': '1', 'x': 'u', 'y': 'z', 'z': 'Q',
};

export const ALPHABET_TABLE: Record<string, string> = {
  'b': '-', '2': '0', 'w': '1', '7': '2', 'q': '3', 'S': '4',
  't': '5', 'E': '6', 'V': '7', '4': '8', 'P': '9', 'f': 'A',
  'R': 'B', 'e': 'C', 'A': 'D', 'F': 'E', 'B': 'F', 'u': 'G',
  'd': 'H', 'k': 'I', '6': 'J', '3': 'K', 'K': 'L', 'L': 'M',
  '+': 'N', 'Y': 'O', '-': 'P', 'z': 'Q', 'T': 'R', '5': 'S',
  'D': 'T', 'n': 'U', 'H': 'V', 'h': 'W', 'Q': 'X', 'U': 'Y',
  '9': 'Z', 'W': '_', 'G': 'a', 'Z': 'b', 'I': 'c', 'j': 'd',
  'N': 'e', 'r': 'f', '1': 'g', 'm': 'h', 'a': 'i', 'O': 'j',
  'p': 'k', 'o': 'l', 'M': 'm', 'X': 'n', 'i': 'o', 'J': 'p',
  'l': 'q', 'g': 'r', '8': 's', 'C': 't', 'x': 'u', 'c': 'v',
  'v': 'w', '0': 'x', 's': 'y', 'y': 'z',
};

// Reverse lookup: standard base64 char -> custom alphabet char
export const REVERSE_ALPHABET_TABLE: Record<string, string> =
  Object.fromEntries(
    Object.entries(ALPHABET_TABLE).map(([k, v]) => [v, k])
  );

// Reverse lookup: base64 value (0-63) -> key character
export const REVERSE_KEY_TABLE: Record<number, string> =
  Object.fromEntries(
    Object.entries(KEY_TABLE).map(([keyChar, base64Char]) => [
      base64CharToValue(base64Char),
      keyChar,
    ])
  );

export function base64CharToValue(char: string): number {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) return code - 65;       // A-Z -> 0-25
  if (code >= 97 && code <= 122) return code - 97 + 26;  // a-z -> 26-51
  if (code >= 48 && code <= 57) return code - 48 + 52;   // 0-9 -> 52-61
  if (char === '-') return 62;
  if (char === '_') return 63;
  throw new StratDecodeError(`Invalid base64 character: ${char}`);
}

export function valueToBase64Char(value: number): string {
  if (value < 0 || value > 63) {
    throw new StratDecodeError(`Invalid base64 value: ${value}`);
  }
  if (value < 26) return String.fromCharCode(65 + value);        // A-Z
  if (value < 52) return String.fromCharCode(97 + value - 26);   // a-z
  if (value < 62) return String.fromCharCode(48 + value - 52);   // 0-9
  if (value === 62) return '-';
  return '_';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/ffxiv-strat/__tests__/tables.test.ts --no-coverage`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/ffxiv-strat/tables.ts src/lib/ffxiv-strat/__tests__/tables.test.ts
git commit -m "feat(ffxiv-strat): add substitution tables and base64 char mapping"
```

---

## Task 5: Substitution Cipher + Base64 (codec.ts)

**Files:**
- Create: `src/lib/ffxiv-strat/codec.ts`
- Test: `src/lib/ffxiv-strat/__tests__/codec.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import {
  encryptCipher,
  decryptCipher,
  encodeBase64,
  decodeBase64,
  unwrapStgy,
  wrapStgy,
} from '../codec';

describe('codec', () => {
  describe('cipher round-trip', () => {
    it('encrypt then decrypt returns original', () => {
      const original = 'SGVsbG8gV29ybGQ'; // arbitrary base64 string
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
      // Should be URL-safe (no + or / or =)
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/ffxiv-strat/__tests__/codec.test.ts --no-coverage`

Expected: FAIL — cannot resolve `../codec`

- [ ] **Step 3: Write codec.ts**

```typescript
import { StratDecodeError } from './types';
import { STGY_PREFIX, STGY_SUFFIX, MIN_PAYLOAD_LENGTH } from './types';
import {
  ALPHABET_TABLE,
  REVERSE_ALPHABET_TABLE,
  base64CharToValue,
  valueToBase64Char,
} from './tables';

// --- Substitution cipher ---

export function decryptCipher(encrypted: string, key: number): string {
  let result = '';
  for (let i = 0; i < encrypted.length; i++) {
    const char = encrypted[i];
    const mapped = ALPHABET_TABLE[char];
    if (mapped === undefined) {
      throw new StratDecodeError(`Unknown cipher character: ${char}`);
    }
    const val = base64CharToValue(mapped);
    const decoded = ((val - i - key) % 64 + 64) % 64; // ensure positive mod
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

// --- URL-safe Base64 ---

export function encodeBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBase64(base64: string): Uint8Array {
  // Restore standard base64
  let std = base64.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  const pad = (4 - (std.length % 4)) % 4;
  std += '='.repeat(pad);
  const binary = atob(std);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// --- Shell wrapper ---

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/ffxiv-strat/__tests__/codec.test.ts --no-coverage`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/ffxiv-strat/codec.ts src/lib/ffxiv-strat/__tests__/codec.test.ts
git commit -m "feat(ffxiv-strat): add substitution cipher, base64, and shell wrapper"
```

---

## Task 6: CRC32 + Compression (compression.ts)

**Files:**
- Create: `src/lib/ffxiv-strat/compression.ts`
- Test: `src/lib/ffxiv-strat/__tests__/compression.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import {
  calculateCRC32,
  packHeader,
  unpackHeader,
  compress,
  decompress,
} from '../compression';

describe('compression', () => {
  describe('CRC32', () => {
    it('computes correct CRC32 for known input', () => {
      // CRC32 of "123456789" = 0xCBF43926
      const input = new TextEncoder().encode('123456789');
      expect(calculateCRC32(input)).toBe(0xcbf43926);
    });

    it('computes correct CRC32 for empty input', () => {
      expect(calculateCRC32(new Uint8Array([]))).toBe(0x00000000);
    });

    it('computes correct CRC32 for single byte', () => {
      // CRC32 of [0x00] = 0xD202EF8D
      expect(calculateCRC32(new Uint8Array([0x00]))).toBe(0xd202ef8d);
    });
  });

  describe('header pack/unpack', () => {
    it('round-trips CRC32 and decompressed length', () => {
      const crc = 0xdeadbeef;
      const length = 1234;
      const compressed = new Uint8Array([1, 2, 3, 4]);
      const packed = packHeader(crc, length, compressed);
      expect(packed.length).toBe(6 + 4); // 4 CRC + 2 length + 4 data
      const result = unpackHeader(packed);
      expect(result.storedCRC).toBe(crc);
      expect(result.decompressedLength).toBe(length);
      expect(result.compressedData).toEqual(compressed);
    });
  });

  describe('compress/decompress', () => {
    it('round-trips arbitrary data', () => {
      const data = new Uint8Array(100);
      for (let i = 0; i < data.length; i++) data[i] = i % 256;
      const compressed = compress(data);
      const decompressed = decompress(compressed);
      expect(decompressed).toEqual(data);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/ffxiv-strat/__tests__/compression.test.ts --no-coverage`

Expected: FAIL — cannot resolve `../compression`

- [ ] **Step 3: Write compression.ts**

```typescript
import pako from 'pako';
import { StratDecodeError } from './types';
import { BINARY_HEADER_SIZE, COMPRESSED_DATA_OFFSET } from './types';

// CRC32 lookup table (polynomial 0xEDB88320)

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    table[i] = crc;
  }
  return table;
})();

export function calculateCRC32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Header: CRC32 (4 bytes LE) + decompressed length (2 bytes LE) + compressed data

export function packHeader(
  crc: number,
  decompressedLength: number,
  compressedData: Uint8Array
): Uint8Array {
  const result = new Uint8Array(BINARY_HEADER_SIZE + compressedData.length);
  // CRC32 LE
  result[0] = crc & 0xff;
  result[1] = (crc >> 8) & 0xff;
  result[2] = (crc >> 16) & 0xff;
  result[3] = (crc >> 24) & 0xff;
  // Decompressed length LE
  result[4] = decompressedLength & 0xff;
  result[5] = (decompressedLength >> 8) & 0xff;
  // Compressed data
  result.set(compressedData, COMPRESSED_DATA_OFFSET);
  return result;
}

export function unpackHeader(data: Uint8Array): {
  storedCRC: number;
  decompressedLength: number;
  compressedData: Uint8Array;
} {
  if (data.length < BINARY_HEADER_SIZE) {
    throw new StratDecodeError('Binary data too short for header');
  }
  const storedCRC =
    ((data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24)) >>> 0);
  const decompressedLength = data[4] | (data[5] << 8);
  const compressedData = data.slice(COMPRESSED_DATA_OFFSET);
  return { storedCRC, decompressedLength, compressedData };
}

export function compress(data: Uint8Array): Uint8Array {
  return pako.deflate(data);
}

export function decompress(data: Uint8Array): Uint8Array {
  try {
    return pako.inflate(data);
  } catch (e) {
    throw new StratDecodeError(
      `Zlib decompression failed: ${e instanceof Error ? e.message : e}`
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/ffxiv-strat/__tests__/compression.test.ts --no-coverage`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/ffxiv-strat/compression.ts src/lib/ffxiv-strat/__tests__/compression.test.ts
git commit -m "feat(ffxiv-strat): add CRC32 calculation and zlib compression"
```

---

## Task 7: Binary Parser + Serializer (binary.ts)

**Files:**
- Create: `src/lib/ffxiv-strat/binary.ts`
- Test: `src/lib/ffxiv-strat/__tests__/binary.test.ts`

This is the most complex layer. It parses the SoA binary format into `BoardData` and serializes it back.

Reference: marimelon/stgy-tools `parser.ts` + `serializer.ts`

The binary structure has two levels:
1. **Board header** (16 bytes): version(u32) + content_length(u32) + flags(u16) + title_length(u16) + padding(u32)
2. **Sections**: Content section (SectionType=0x00 + length + field containers) then Background section (SectionType=0x03 + typed array)

Within the Content section, fields are identified by Field IDs (u16):
- Field 0: Empty (skip)
- Field 1: Board name
- Field 2: Object ID (repeated per object; text objects followed by Field 3)
- Field 3: Text content (when following a text object ID)
- Fields 4-8, 10-12: Object attributes (flags, positions, rotations, sizes, colors, params)

The Background section reuses the Field 3 / SectionType 0x03 value — it appears after the content section and holds `[type=1, count=1, backgroundId]`.

- [ ] **Step 1: Write failing test**

```typescript
import { parseBoardData, serializeBoardData } from '../binary';
import type { BoardData } from '../types';

describe('binary', () => {
  const minimalBoard: BoardData = {
    name: '',
    backgroundId: 1,
    objects: [],
  };

  const singleObjectBoard: BoardData = {
    name: 'Test',
    backgroundId: 2,
    objects: [
      {
        objectId: 0x2f, // Tank
        flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
        position: { x: 2560, y: 1920 }, // center of 512x384 canvas in 1/10 px
        rotation: 0,
        size: 100,
        color: { r: 255, g: 0, b: 0, opacity: 0 },
        params: { a: 0, b: 0, c: 0 },
      },
    ],
  };

  const textObjectBoard: BoardData = {
    name: 'TextBoard',
    backgroundId: 1,
    objects: [
      {
        objectId: 0x64, // Text
        flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
        position: { x: 1000, y: 1000 },
        rotation: 0,
        size: 100,
        color: { r: 0, g: 0, b: 0, opacity: 0 },
        params: { a: 0, b: 0, c: 0 },
        text: 'Hello',
      },
    ],
  };

  describe('serialize then parse round-trip', () => {
    it('handles empty board', () => {
      const binary = serializeBoardData(minimalBoard);
      const result = parseBoardData(binary);
      expect(result.name).toBe('');
      expect(result.backgroundId).toBe(1);
      expect(result.objects).toEqual([]);
    });

    it('handles single object', () => {
      const binary = serializeBoardData(singleObjectBoard);
      const result = parseBoardData(binary);
      expect(result.name).toBe('Test');
      expect(result.backgroundId).toBe(2);
      expect(result.objects.length).toBe(1);
      const obj = result.objects[0];
      expect(obj.objectId).toBe(0x2f);
      expect(obj.flags.visible).toBe(true);
      expect(obj.position.x).toBe(2560);
      expect(obj.position.y).toBe(1920);
      expect(obj.rotation).toBe(0);
      expect(obj.size).toBe(100);
      expect(obj.color.r).toBe(255);
    });

    it('handles text object', () => {
      const binary = serializeBoardData(textObjectBoard);
      const result = parseBoardData(binary);
      expect(result.objects.length).toBe(1);
      expect(result.objects[0].text).toBe('Hello');
      expect(result.objects[0].objectId).toBe(0x64);
    });
  });

  describe('parseBoardData', () => {
    it('rejects unsupported version', () => {
      const binary = new Uint8Array(16);
      // version = 99
      binary[0] = 99;
      expect(() => parseBoardData(binary)).toThrow('version');
    });

    it('rejects truncated data', () => {
      expect(() => parseBoardData(new Uint8Array(4))).toThrow();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/ffxiv-strat/__tests__/binary.test.ts --no-coverage`

Expected: FAIL — cannot resolve `../binary`

- [ ] **Step 3: Write binary.ts**

Implement `parseBoardData` and `serializeBoardData` following the marimelon reference. The file contains:

- `BinaryReader` class: wraps DataView with position tracking, reads u8/u16/i16/u32/bytes/string
- `BinaryWriter` class: builds a byte array, writes u8/u16/i16/u32/bytes/string, padding
- `parseBoardData(data: Uint8Array): BoardData`: parses the SoA binary
- `serializeBoardData(board: BoardData): Uint8Array`: serializes to SoA binary

Parser logic:
1. Read 16-byte board header (version must be 2)
2. Read content section: SectionType(u16)=0x00, length(u16), then field containers
3. Within content section, loop reading Field IDs and dispatching to field-specific parsers
4. Read background section: SectionType(u16)=0x03, type(u16)=1, count(u16)=1, backgroundId(u16)
5. Assemble parsed arrays into `BoardObject[]`

Serializer logic (reverse of parser):
1. Serialize field content to a temporary buffer
2. Calculate total content length
3. Write board header
4. Write content section wrapper + fields
5. Write background section

This file is substantial (~300 lines). The implementer should reference marimelon/stgy-tools `parser.ts`, `parser/BinaryReader.ts`, `parser/fieldParsers.ts`, and `serializer.ts` for the exact logic. Key points:

- Positions are stored as-is (raw 1/10 pixel values, no scaling on parse)
- Field 3 (TEXT_TERMINATOR) is overloaded: it encodes text content when following a text object ID, and the background when it's the final section. The parser distinguishes by reading section types first.
- The SectionType for background (0x03) is the same value as FieldIds.TEXT_TERMINATOR — the parser handles this by reading sections at the top level, not field IDs.
- Sizes field uses u8 and needs 2-byte alignment padding when object count is odd.
- Board name and text strings are padded to 4-byte alignment including a null terminator.
- Unknown field IDs should be skipped gracefully.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/ffxiv-strat/__tests__/binary.test.ts --no-coverage`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/ffxiv-strat/binary.ts src/lib/ffxiv-strat/__tests__/binary.test.ts
git commit -m "feat(ffxiv-strat): add SoA binary parser and serializer"
```

---

## Task 8: Public API + Integration Tests (index.ts)

**Files:**
- Create: `src/lib/ffxiv-strat/index.ts`
- Test: `src/lib/ffxiv-strat/__tests__/strat.test.ts`

- [ ] **Step 1: Write failing integration test first (TDD)**

Create `src/lib/ffxiv-strat/__tests__/strat.test.ts` with the full integration test (see Task 9 below for the complete test code). This test imports `decode` and `encode` from `../index` which doesn't exist yet, so it will fail.

Run: `npx jest src/lib/ffxiv-strat/__tests__/strat.test.ts --no-coverage`

Expected: FAIL — cannot resolve `../index`

- [ ] **Step 2: Write index.ts**

```typescript
import { StratDecodeError, StratEncodeError } from './types';
import type { BoardData } from './types';
import { KEY_TABLE, REVERSE_KEY_TABLE, base64CharToValue } from './tables';
import { unwrapStgy, wrapStgy, decryptCipher, encryptCipher, encodeBase64, decodeBase64 } from './codec';
import { calculateCRC32, packHeader, unpackHeader, compress, decompress } from './compression';
import { parseBoardData, serializeBoardData } from './binary';

export type { BoardData, BoardObject, ObjectFlags } from './types';
export { StratError, StratDecodeError, StratEncodeError } from './types';

export function decode(input: string): BoardData {
  // 1. Unwrap shell, extract key
  const { keyChar, payload } = unwrapStgy(input);
  const keyMapped = KEY_TABLE[keyChar];
  if (keyMapped === undefined) {
    throw new StratDecodeError(`Invalid key character: ${keyChar}`);
  }
  const key = base64CharToValue(keyMapped);

  // 2. Decrypt substitution cipher
  const base64String = decryptCipher(payload, key);

  // 3. Base64 decode
  const binary = decodeBase64(base64String);

  // 4. Unpack header, verify CRC32
  const { storedCRC, decompressedLength, compressedData } = unpackHeader(binary);
  const calculatedCRC = calculateCRC32(binary.slice(4));
  if (storedCRC !== calculatedCRC) {
    throw new StratDecodeError(
      `CRC32 mismatch: stored=0x${storedCRC.toString(16)}, calculated=0x${calculatedCRC.toString(16)}`
    );
  }

  // 5. Decompress
  const decompressed = decompress(compressedData);
  if (decompressed.length !== decompressedLength) {
    throw new StratDecodeError(
      `Decompressed length mismatch: expected=${decompressedLength}, actual=${decompressed.length}`
    );
  }

  // 6. Parse binary
  return parseBoardData(decompressed);
}

export function encode(board: BoardData): string {
  // 1. Serialize to binary
  const binaryData = serializeBoardData(board);

  // 2. Compress
  const compressedData = compress(binaryData);

  // 3. Build integrity header
  const lengthBytes = new Uint8Array(2);
  lengthBytes[0] = binaryData.length & 0xff;
  lengthBytes[1] = (binaryData.length >> 8) & 0xff;

  const dataForCRC = new Uint8Array(2 + compressedData.length);
  dataForCRC.set(lengthBytes, 0);
  dataForCRC.set(compressedData, 2);

  const crc = calculateCRC32(dataForCRC);
  const packed = packHeader(crc, binaryData.length, compressedData);

  // 4. Base64 encode
  const base64String = encodeBase64(packed);

  // 5. Derive key from CRC32
  const key = crc & 0x3f;
  const keyChar = REVERSE_KEY_TABLE[key];
  if (keyChar === undefined) {
    throw new StratEncodeError(`Invalid key value: ${key}`);
  }

  // 6. Encrypt with substitution cipher
  const encryptedPayload = encryptCipher(base64String, key);

  // 7. Wrap in shell
  return wrapStgy(keyChar, encryptedPayload);
}
```

- [ ] **Step 3: Run integration tests**

Run: `npx jest src/lib/ffxiv-strat/__tests__/strat.test.ts --no-coverage`

Expected: PASS

- [ ] **Step 4: Run full test suite**

Run: `npx jest --no-coverage 2>&1 | tail -20`

Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/ffxiv-strat/index.ts src/lib/ffxiv-strat/__tests__/strat.test.ts
git commit -m "feat(ffxiv-strat): add public encode/decode API with integration tests"
```

---

## Task 9: Integration Test Code (referenced by Task 8 Step 1)

```typescript
import { decode, encode } from '../index';
import type { BoardData } from '../types';

// Real strategy codes provided by the user
const FIXTURES = [
  '[stgy:apj2EjrLlv37r5kQyDkVqIktejnb7a10FuHVctG1FIlSnTpKseMjk1kJ1OvYfqMqsV0xU08LtNf57eFaAw7JNJnxuzZLK3a7zYTT+0U-y-zISaaSNi7tFmIPdZSRycb0IJkn0ymx4O3YMwOpeSLC+AzmzdcbkruFrrZIXCUZsYOYeh1kK017N7bnDZpjhrSkNAXB062gltCK7WS08tNjVU3g404AdakFGFIJ5XHJXCUWYBzrGKIOvqIm7YkjraHmpgbwDfkdcLIt0vo+amoaRF7RjpB63mvh8toj-zynh-9k9ZH7BnaEKdXYiSnOCoMtlwdvsgDIvwkGBrNfyl1COlRLbSnwOoQPE02fID9eZ7ZtKNw7o69d68g9+QUnBj4OZdPZMrZooEZBoIyoY0HovNbAhFHx-uKHNMPtSHKEEoDU3dbMy5vS1krloWHhuF5CpaB+FiQmukYwwJ1lhWa+fzTbmuabNQ+mv+vubGm-+Ob9j-ITdVCqa59hqXORS+52naEcTWdpxZkmFrIJt7h1zqI6WO3GfHo3nQtMUOS6liXZG-t6P5DnnEvAZ2p8dvzRw-A8UWkBx0-+nUTdyU7UEEPC5A+qBzeYeAoyhdOJVMpqnANeXfLcZGsWNZHWKXORxOJSCZfJ]',
  '[stgy:aw5-pKJcyPZdvO9iFpRLn893nGo-dyTe5Q+n0j4D3qpRP+mTCPgl9Jrl+2lu7k03DC9TqqPEQ49zWzew62B+IV6P-eWGEznZp-B+P95K6VaPKAnA9vigQwpCDxxIr5kyCveZJX96gGbNEReJZ3vX-u3iO5l0JfgcyHOdUKonCfuXsSQqdM-qqx8ngqZchxv0vAeF5ETCyyFmONz6YzjTAEHEKLCEZkje]',
  '[stgy:a1ki9uZ6uJusZYFDc-IqyHFwb0zEsNICReSPIkX7ya-8XRZA6tT67F1oMlkaKgXobM4HMn7MGNi99Vw5s-hMHVMm7A+f7AMFn8vBM09C3arKTd0kcBLM6wNVOHKZ0pUu0lR-uI9GmoiNIPr4LXT2HazqDltzEUHPPONCAh7ZRz+wZ6sm8rjJc1tegxv9JxmV7PJk4TYG9JW0mQdyvu10sbkjQOzDZjYA6qb1RROw1+7k6eKW+3DREw0qhC0gVixtAllod8i7qq8EErSfsow5-euKPQSkOkmKBbWfRdIilAY+NSTB7E2mhlpB5XstI4ON1P1ogy68C3PSMqQVuswwVy2XeuKiTD4zK--TaBF6ZLXX3]',
  '[stgy:a3L0m7JZf5vIuE3aFM3bIwrCO85NgkcJ6Ha80C7vi4ZR6e0dfreV3m-rs5unMBNGSYoMx0Nv1m2x1Dkv0XQPZUN1UW93cntk1PIGE56bLcAhuZSKCaKa6Qsk6Qc+I5mjCzibqj5mHfFTVzGqV0MduOJ6uhF9HT5LzRWRGfpLT7r37btTPiYd6dYiIFuShq3LXkUmx7VzzVwxbLwVCgPkJpOJWxh7qsPNEU8FwK93Rk40Qy6wfbdkB3Dc]',
];

describe('strat integration', () => {
  describe('decode real strategy codes', () => {
    FIXTURES.forEach((code, i) => {
      it(`decodes fixture ${i + 1} without error`, () => {
        const result = decode(code);
        expect(result).toBeDefined();
        expect(typeof result.name).toBe('string');
        expect(typeof result.backgroundId).toBe('number');
        expect(Array.isArray(result.objects)).toBe(true);
      });

      it(`fixture ${i + 1} has valid objects`, () => {
        const result = decode(code);
        for (const obj of result.objects) {
          expect(obj.objectId).toBeGreaterThan(0);
          expect(obj.position.x).toBeGreaterThanOrEqual(0);
          expect(obj.position.y).toBeGreaterThanOrEqual(0);
          expect(obj.size).toBeGreaterThanOrEqual(50);
          expect(obj.size).toBeLessThanOrEqual(200);
        }
      });
    });
  });

  describe('encode → decode round-trip', () => {
    it('round-trips a constructed board', () => {
      const board: BoardData = {
        name: 'RoundTrip',
        backgroundId: 3,
        objects: [
          {
            objectId: 0x2f,
            flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
            position: { x: 2560, y: 1920 },
            rotation: 45,
            size: 100,
            color: { r: 255, g: 128, b: 0, opacity: 50 },
            params: { a: 0, b: 0, c: 0 },
          },
          {
            objectId: 0x64,
            flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
            position: { x: 1000, y: 500 },
            rotation: 0,
            size: 80,
            color: { r: 0, g: 0, b: 0, opacity: 0 },
            params: { a: 0, b: 0, c: 0 },
            text: 'Stack here',
          },
        ],
      };
      const encoded = encode(board);
      expect(encoded.startsWith('[stgy:a')).toBe(true);
      expect(encoded.endsWith(']')).toBe(true);

      const decoded = decode(encoded);
      expect(decoded.name).toBe('RoundTrip');
      expect(decoded.backgroundId).toBe(3);
      expect(decoded.objects.length).toBe(2);
      expect(decoded.objects[0].objectId).toBe(0x2f);
      expect(decoded.objects[0].rotation).toBe(45);
      expect(decoded.objects[1].text).toBe('Stack here');
    });
  });

  describe('error cases', () => {
    it('throws on malformed input', () => {
      expect(() => decode('not a stgy string')).toThrow();
    });

    it('throws on truncated input', () => {
      expect(() => decode('[stgy:aXY]')).toThrow();
    });

    it('throws on corrupted payload', () => {
      // Replace a payload character with a different valid alphabet char
      // This should cause CRC mismatch or decompression failure
      const code = FIXTURES[0];
      const charAtPos10 = code[10];
      const replacement = charAtPos10 === 'A' ? 'B' : 'A';
      const corrupted = code.slice(0, 10) + replacement + code.slice(11);
      expect(() => decode(corrupted)).toThrow();
    });
  });
});
```

This is a reference section — the test file is created in Task 8 Step 1 and committed together with `index.ts` in Task 8 Step 5.

---

## Task 10: LICENSE and NOTICE

**Files:**
- Create: `src/lib/ffxiv-strat/LICENSE`
- Create: `src/lib/ffxiv-strat/NOTICE`

- [ ] **Step 1: Write LICENSE**

Standard MIT license text with the current year and author.

- [ ] **Step 2: Write NOTICE**

```
This project contains code derived from the following projects:

- marimelon/stgy-tools (https://github.com/marimelon/stgy-tools)
  Copyright (c) marimelon
  Licensed under the MIT License
  Used as the primary code reference for the encoder/decoder implementation.

- wtw0212/ff14-strategyboard-decode (https://github.com/wtw0212/ff14-strategyboard-decode)
  Copyright (c) 2025 wtw0212
  Licensed under the MIT License
  Used as the primary spec/documentation reference for the binary format.
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/ffxiv-strat/LICENSE src/lib/ffxiv-strat/NOTICE
git commit -m "docs(ffxiv-strat): add MIT license and attribution notice"
```

---

## Task 11: Demo Page

**Files:**
- Create: `src/pages/Playground/FFXIVStrat/index.jsx`
- Modify: `src/pages/Playground/index.jsx`

- [ ] **Step 1: Create the demo page component**

Create `src/pages/Playground/FFXIVStrat/index.jsx`. Follow the existing Playground pattern (React Helmet for title, functional component with hooks).

The page should include a brief description explaining this is a project to test Claude Code's capabilities — specifically, its ability to read open-source references, understand a binary format, and implement a working encoder/decoder.

Features:
- A short intro paragraph explaining the purpose (testing Claude Code's ability) and linking to the reference repos
- Textarea for pasting `[stgy:...]` codes
- Decode button
- On success: display board name, background ID, and a table of objects (objectId, position, rotation, size, color, flags, params, text)
- On error: display the error message
- Pre-populate the textarea with one of the fixture codes as a placeholder

Use `useState` for the input text, decoded result, and error state. Import `decode` from `../../lib/ffxiv-strat`. Minimal inline styles or CSS module following existing playground conventions.

- [ ] **Step 2: Register the route**

In `src/pages/Playground/index.jsx`:

Add import:
```javascript
import FFXIVStrat from './FFXIVStrat';
```

Add to the `routes` array:
```javascript
{ path: 'ffxiv-strat', label: 'FFXIV Strat', component: FFXIVStrat },
```

- [ ] **Step 3: Verify the page works**

Run: `npm run dev`

Open `http://localhost:8080/playground/ffxiv-strat` in a browser. Paste a test strategy code, click Decode, verify the output displays correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Playground/FFXIVStrat/index.jsx src/pages/Playground/index.jsx
git commit -m "feat: add FFXIV strategy board decoder demo page"
```

---

## Task 12: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npx jest --no-coverage`

Expected: All tests pass

- [ ] **Step 2: Run webpack build**

Run: `npm run build 2>&1 | tail -10`

Expected: Build succeeds without errors

- [ ] **Step 3: Manual testing in browser**

Start dev server (`npm run dev`), open the demo page, decode all 4 fixture codes. Verify each shows reasonable output.
