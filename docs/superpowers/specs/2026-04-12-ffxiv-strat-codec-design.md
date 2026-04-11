# FFXIV Strategy Board Codec — Design Spec

**Date**: 2026-04-12
**Status**: Draft

## Goal

Extract and reimplement the FFXIV strategy board encoder/decoder as a TypeScript module within caasih.net, with a demo page for decoding. The module will be released under MIT.

## References

Both MIT licensed:

- [marimelon/stgy-tools](https://github.com/marimelon/stgy-tools) — TypeScript encoder + decoder with CRC32 validation and round-trip support. Used as the primary code reference.
- [wtw0212/ff14-strategyboard-decode](https://github.com/wtw0212/ff14-strategyboard-decode) — Python + TypeScript implementation with the most detailed binary format documentation (`BINARY_STRUCTURE.md`, `OBJECT_TYPES.md`). Used as the primary spec reference.

## Prerequisites

### TypeScript Build Support

The project currently only supports JS/JSX. The SWC compiler already supports TypeScript parsing — the changes needed are:

- Add `.ts`, `.tsx` to webpack's `resolve.extensions`
- Add `.ts`, `.tsx` to SWC loader's `test` regex
- Enable `typescript` parser in SWC config
- Add `tsconfig.json` for type checking and editor support
- Update `@swc/jest` config in `jest.config.js` — the transform regex already matches `.ts`/`.tsx`, but `swcOptions.jsc.parser` needs to switch from `"ecmascript"` to `"typescript"` (or add a separate transform entry for TS files)

### Dependencies

- **`pako`** — zlib inflate/deflate for browser. Lightweight, well-maintained, used by all reference implementations.
- **CRC32** — vendored implementation (small, ~30 lines, polynomial `0xEDB88320`). No need for an npm package.

## Format Overview

A `[stgy:...]` string goes through these layers:

1. **Outer shell** — prefix `[stgy:a`, suffix `]`
2. **Substitution cipher** — for each character at position `i`: `decoded = (charValue - i - key) & 0x3F` (decrypt) / `encoded = (charValue + i + key) & 0x3F` (encrypt). Key = CRC32 from integrity header & 0x3F. Two 64-entry lookup tables translate between the custom alphabet and standard base64 chars.
3. **URL-safe Base64** — `-` and `_` instead of `+` and `/`, no padding
4. **Integrity header** — CRC32 (4 bytes LE) + decompressed length (2 bytes LE)
5. **Compression** — zlib/deflate (via `pako`)
6. **Binary data** — Structure-of-Arrays format with 16-byte header + field-based sections

### Binary Structure

**Header (16 bytes):**

| Offset | Size | Type    | Description                                         |
|--------|------|---------|-----------------------------------------------------|
| 0x00   | 4    | u32 LE  | Version (expected: 2). Reject other values.         |
| 0x04   | 4    | u32 LE  | Content length (bytes after header)                 |
| 0x08   | 2    | u16 LE  | Flags (observed: `0x0001`). Preserve for round-trip.|
| 0x0A   | 2    | u16 LE  | Title length (bytes)                                |
| 0x0C   | 4    | —       | Padding (zeros). Preserve for round-trip.           |

**Content sections** use a Structure-of-Arrays layout. All objects' same attribute is stored contiguously. Each section starts with a Field ID (u16 LE):

1. Board name (Field 1) — u16 length + UTF-8 string, padded to 4-byte alignment
2. Object IDs (Field 2) — repeated N times; text objects (ID=0x64) immediately followed by Field 3 string content
3. Flags (Field 4) — u16 subtype + u16 count + N × u16 bitmask (bit 0: visible, bit 1: flipH, bit 2: flipV, bit 3: locked)
4. Positions (Field 5) — u16 subtype + u16 count + N × {u16 x, u16 y} in 1/10 pixel units
5. Rotations (Field 6) — u16 subtype + u16 count + N × i16 degrees (-180 to 180)
6. Sizes (Field 7) — u16 subtype + u16 count + N × u8 (50-200, 100=100%), padded to 2-byte alignment
7. Colors (Field 8) — u16 subtype + u16 count + N × {u8 r, u8 g, u8 b, u8 opacity}
8. Param A (Field 10) — u16 subtype + u16 count + N × u16
9. Param B (Field 11) — u16 subtype + u16 count + N × u16
10. Param C (Field 12) — u16 subtype + u16 count + N × u16
11. Background (Field 3 as terminator) — u16 length=1 + u16 unknown + u16 backgroundId

**Note**: Field ID 3 is overloaded: it encodes text content when it follows a text object (ID=0x64) in the Field 2 section, and encodes the background ID when it appears as the final section (distinguished by length=1).

**Note**: Field ID 9 does not exist in the upstream format. This is intentional — the game client skips this ID. The parser should treat an encountered Field 9 as unknown and skip it gracefully.

**Note**: Field 0 (empty) may appear as alignment padding between sections. Skip it.

### Coordinate System

- Canvas size: 512 × 384 pixels
- Positions stored as 1/10 pixel units (multiply by 10 to get stored value)
- Origin: top-left corner
- `BoardObject.position` stores **raw 1/10 pixel values** as-is from the binary format

### Object Types

~100+ types across categories: jobs, roles, AoE markers, enemy markers, waymarks, shapes, text, lines. Full list in wtw0212's `OBJECT_TYPES.md`.

### Limits

- Max 50 objects per board
- Board name max 20 characters
- Text content max 30 bytes UTF-8

## Module Design

### Location

`src/lib/ffxiv-strat/` — standalone module within caasih.net, structured for future extraction to npm package. No webpack alias for `lib` — use relative imports (e.g., `../../lib/ffxiv-strat` from the demo page).

### File Structure

```
src/lib/ffxiv-strat/
├── index.ts              # Public API: encode(), decode()
├── codec.ts              # Substitution cipher + base64
├── binary.ts             # SoA binary serialization/deserialization
├── compression.ts        # CRC32 header + zlib (pako)
├── tables.ts             # Substitution tables (KEY_TABLE, ALPHABET_TABLE)
├── types.ts              # BoardData, BoardObject, ObjectType, etc.
├── LICENSE               # MIT
└── NOTICE                # Attribution to marimelon/stgy-tools and wtw0212
```

### Public API

```typescript
// Decode a [stgy:...] string into structured board data.
// Throws StratDecodeError on invalid input.
function decode(input: string): BoardData;

// Encode structured board data into a [stgy:...] string.
// Reverses the pipeline: binary serialize → zlib compress → integrity header → base64 → cipher → shell.
// Throws StratEncodeError on invalid data.
function encode(data: BoardData): string;
```

### Error Handling

Decode and encode throw typed errors extending a common base:

```typescript
class StratError extends Error {
  constructor(message: string);
}

class StratDecodeError extends StratError {
  constructor(message: string);
}

class StratEncodeError extends StratError {
  constructor(message: string);
}
```

Decode failure cases:
- Missing or malformed `[stgy:a...]` wrapper
- Substitution cipher produces invalid base64
- CRC32 checksum mismatch
- Zlib decompression failure
- Unsupported version (not 2)
- Truncated or malformed binary data

### Key Types

```typescript
interface BoardData {
  name: string;
  backgroundId: number;
  objects: BoardObject[];
}

interface BoardObject {
  objectId: number;
  flags: ObjectFlags;
  position: { x: number; y: number }; // raw 1/10 pixel units
  rotation: number;                    // degrees, -180 to 180
  size: number;                        // 50-200, 100 = 100%
  color: { r: number; g: number; b: number; opacity: number };
  params: { a: number; b: number; c: number };
  text?: string; // only for objectId=0x64 (Text)
}

interface ObjectFlags {
  visible: boolean;
  flipHorizontal: boolean;
  flipVertical: boolean;
  locked: boolean;
}
```

### Layer Responsibilities

- **`codec.ts`** — strips/adds `[stgy:a...]` shell, applies substitution cipher (encrypt/decrypt), converts URL-safe base64
- **`compression.ts`** — computes/validates CRC32 (vendored), reads/writes 6-byte integrity header, zlib inflate/deflate via `pako`
- **`binary.ts`** — parses/builds the SoA binary format (header + field sections)
- **`tables.ts`** — the two 64-entry substitution tables (values from marimelon/stgy-tools `constants.ts`) and base64 char↔value mappings
- **`types.ts`** — pure type definitions and error classes, no logic

## Testing

Jest (with TypeScript support via `@swc/jest`), test files in `src/lib/ffxiv-strat/__tests__/`.

### Layer Tests

**`codec.test.ts`**
- Substitution cipher encrypt/decrypt round-trip
- Key extraction from CRC32
- Base64 URL-safe conversion (with/without padding)

**`compression.test.ts`**
- CRC32 against known values
- zlib compress → decompress round-trip
- 6-byte header assembly/parsing

**`binary.test.ts`**
- Field type serialization/deserialization round-trip
- Header parsing (version, content length)
- Position (1/10 pixel values), rotation, size, color, flags
- Text objects (Field 3 dual role)
- 4-byte alignment padding
- Unknown field IDs skipped gracefully

### Integration Tests

**`strat.test.ts`**
- Decode known strategy codes and verify output structure
- Encode → decode round-trip
- Error cases: malformed input, bad CRC, truncated data

**Test fixtures** (real strategy codes):

```
[stgy:apj2EjrLlv37r5kQyDkVqIktejnb7a10FuHVctG1FIlSnTpKseMjk1kJ1OvYfqMqsV0xU08LtNf57eFaAw7JNJnxuzZLK3a7zYTT+0U-y-zISaaSNi7tFmIPdZSRycb0IJkn0ymx4O3YMwOpeSLC+AzmzdcbkruFrrZIXCUZsYOYeh1kK017N7bnDZpjhrSkNAXB062gltCK7WS08tNjVU3g404AdakFGFIJ5XHJXCUWYBzrGKIOvqIm7YkjraHmpgbwDfkdcLIt0vo+amoaRF7RjpB63mvh8toj-zynh-9k9ZH7BnaEKdXYiSnOCoMtlwdvsgDIvwkGBrNfyl1COlRLbSnwOoQPE02fID9eZ7ZtKNw7o69d68g9+QUnBj4OZdPZMrZooEZBoIyoY0HovNbAhFHx-uKHNMPtSHKEEoDU3dbMy5vS1krloWHhuF5CpaB+FiQmukYwwJ1lhWa+fzTbmuabNQ+mv+vubGm-+Ob9j-ITdVCqa59hqXORS+52naEcTWdpxZkmFrIJt7h1zqI6WO3GfHo3nQtMUOS6liXZG-t6P5DnnEvAZ2p8dvzRw-A8UWkBx0-+nUTdyU7UEEPC5A+qBzeYeAoyhdOJVMpqnANeXfLcZGsWNZHWKXORxOJSCZfJ]

[stgy:aw5-pKJcyPZdvO9iFpRLn893nGo-dyTe5Q+n0j4D3qpRP+mTCPgl9Jrl+2lu7k03DC9TqqPEQ49zWzew62B+IV6P-eWGEznZp-B+P95K6VaPKAnA9vigQwpCDxxIr5kyCveZJX96gGbNEReJZ3vX-u3iO5l0JfgcyHOdUKonCfuXsSQqdM-qqx8ngqZchxv0vAeF5ETCyyFmONz6YzjTAEHEKLCEZkje]

[stgy:a1ki9uZ6uJusZYFDc-IqyHFwb0zEsNICReSPIkX7ya-8XRZA6tT67F1oMlkaKgXobM4HMn7MGNi99Vw5s-hMHVMm7A+f7AMFn8vBM09C3arKTd0kcBLM6wNVOHKZ0pUu0lR-uI9GmoiNIPr4LXT2HazqDltzEUHPPONCAh7ZRz+wZ6sm8rjJc1tegxv9JxmV7PJk4TYG9JW0mQdyvu10sbkjQOzDZjYA6qb1RROw1+7k6eKW+3DREw0qhC0gVixtAllod8i7qq8EErSfsow5-euKPQSkOkmKBbWfRdIilAY+NSTB7E2mhlpB5XstI4ON1P1ogy68C3PSMqQVuswwVy2XeuKiTD4zK--TaBF6ZLXX3]

[stgy:a3L0m7JZf5vIuE3aFM3bIwrCO85NgkcJ6Ha80C7vi4ZR6e0dfreV3m-rs5unMBNGSYoMx0Nv1m2x1Dkv0XQPZUN1UW93cntk1PIGE56bLcAhuZSKCaKa6Qsk6Qc+I5mjCzibqj5mHfFTVzGqV0MduOJ6uhF9HT5LzRWRGfpLT7r37btTPiYd6dYiIFuShq3LXkUmx7VzzVwxbLwVCgPkJpOJWxh7qsPNEU8FwK93Rk40Qy6wfbdkB3Dc]
```

## Demo Page

### Location

`src/pages/Playground/FFXIVStrat/index.jsx` — registered in Playground routes as `{ path: 'ffxiv-strat', label: 'FFXIV Strat', component: FFXIVStrat }`.

### Features

- Textarea for pasting `[stgy:...]` codes
- Decode button
- Decoded output display:
  - Board name, background type
  - Object list with: type name, position, rotation, size, color, flags, params
  - Text content for text objects
- Error display on decode failure (shows `StratDecodeError` message)

### Not in Scope

- No canvas rendering
- No game asset loading
- No encode UI
- No editing/creation UI

## Licensing

- Module (`src/lib/ffxiv-strat/`): **MIT**
- `NOTICE` file attributing:
  - marimelon/stgy-tools (MIT) — primary code reference
  - wtw0212/ff14-strategyboard-decode (MIT) — primary spec/documentation reference
