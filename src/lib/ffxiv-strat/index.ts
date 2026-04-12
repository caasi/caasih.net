import { StratDecodeError, StratEncodeError } from './types'
import type { BoardData } from './types'
import { KEY_TABLE, REVERSE_KEY_TABLE, base64CharToValue } from './tables'
import { unwrapStgy, wrapStgy, decryptCipher, encryptCipher, encodeBase64, decodeBase64 } from './codec'
import { calculateCRC32, packHeader, unpackHeader, compress, decompress } from './compression'
import { parseBoardData, serializeBoardData } from './binary'

export type { BoardData, BoardObject, ObjectFlags } from './types'
export { StratError, StratDecodeError, StratEncodeError } from './types'

/**
 * Decodes a `[stgy:...]` share code into structured board data.
 *
 * @remarks
 * Pipeline: unwrap shell → derive key → decrypt cipher → base64 decode →
 * verify CRC32 → zlib inflate → parse SoA binary.
 *
 * @param input - A complete `[stgy:a...]` string.
 * @returns The decoded {@link BoardData}.
 * @throws {@link StratDecodeError} on any decode failure (malformed input,
 *   CRC mismatch, decompression error, unsupported binary version, etc.).
 */
export function decode(input: string): BoardData {
  // 1. Unwrap shell, extract key
  const { keyChar, payload } = unwrapStgy(input)
  const keyMapped = KEY_TABLE[keyChar]
  if (keyMapped === undefined) {
    throw new StratDecodeError(`Invalid key character: ${keyChar}`)
  }
  const key = base64CharToValue(keyMapped)

  // 2. Decrypt substitution cipher
  const base64String = decryptCipher(payload, key)

  // 3. Base64 decode
  const binary = decodeBase64(base64String)

  // 4. Unpack header, verify CRC32
  // Header: [CRC32 (4B)] [decompressed length (2B)] [compressed data...]
  // CRC covers bytes 4–end (length field + compressed data)
  const { storedCRC, decompressedLength, compressedData } = unpackHeader(binary)
  const calculatedCRC = calculateCRC32(binary.slice(4))
  if (storedCRC !== calculatedCRC) {
    throw new StratDecodeError(
      `CRC32 mismatch: stored=0x${storedCRC.toString(16)}, calculated=0x${calculatedCRC.toString(16)}`
    )
  }

  // 5. Decompress
  const decompressed = decompress(compressedData)
  if (decompressed.length !== decompressedLength) {
    throw new StratDecodeError(
      `Decompressed length mismatch: expected=${decompressedLength}, actual=${decompressed.length}`
    )
  }

  // 6. Parse binary
  return parseBoardData(decompressed)
}

/**
 * Encodes structured board data into a `[stgy:...]` share code.
 *
 * @remarks
 * Pipeline (reverse of {@link decode}): serialize SoA binary → zlib deflate →
 * build CRC32 header → base64 encode → encrypt cipher → wrap shell.
 *
 * @param board - The {@link BoardData} to encode.
 * @returns A complete `[stgy:a...]` string.
 * @throws {@link StratEncodeError} if the key derivation fails.
 */
export function encode(board: BoardData): string {
  // 1. Serialize to binary
  const binaryData = serializeBoardData(board)

  if (binaryData.length > 0xffff) {
    throw new StratEncodeError(
      `Serialized data too large for u16 length field: ${binaryData.length} bytes (max 65535)`,
    )
  }

  // 2. Compress
  const compressedData = compress(binaryData)

  // 3. Build integrity header
  const lengthBytes = new Uint8Array(2)
  lengthBytes[0] = binaryData.length & 0xff
  lengthBytes[1] = (binaryData.length >> 8) & 0xff

  const dataForCRC = new Uint8Array(2 + compressedData.length)
  dataForCRC.set(lengthBytes, 0)
  dataForCRC.set(compressedData, 2)

  const crc = calculateCRC32(dataForCRC)
  const packed = packHeader(crc, binaryData.length, compressedData)

  // 4. Base64 encode
  const base64String = encodeBase64(packed)

  // 5. Derive key from CRC32
  const key = crc & 0x3f
  const keyChar = REVERSE_KEY_TABLE[key]
  if (keyChar === undefined) {
    throw new StratEncodeError(`Invalid key value: ${key}`)
  }

  // 6. Encrypt with substitution cipher
  const encryptedPayload = encryptCipher(base64String, key)

  // 7. Wrap in shell
  return wrapStgy(keyChar, encryptedPayload)
}
