import pako from 'pako'
import { StratDecodeError } from './types'
import { BINARY_HEADER_SIZE, COMPRESSED_DATA_OFFSET } from './types'

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let crc = i
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1
    }
    table[i] = crc
  }
  return table
})()

/**
 * Computes a CRC32 checksum using polynomial `0xEDB88320`.
 *
 * @param data - Input bytes.
 * @returns The CRC32 value as an unsigned 32-bit integer.
 */
export function calculateCRC32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

/**
 * Builds the 6-byte integrity header followed by compressed data.
 *
 * @remarks
 * Layout: `[CRC32 LE (4B)] [decompressed length LE (2B)] [compressed data...]`
 *
 * @param crc - CRC32 checksum of the length field + compressed data.
 * @param decompressedLength - Original (uncompressed) byte count.
 * @param compressedData - zlib-compressed bytes.
 * @returns The complete buffer ready for base64 encoding.
 */
export function packHeader(
  crc: number,
  decompressedLength: number,
  compressedData: Uint8Array
): Uint8Array {
  const result = new Uint8Array(BINARY_HEADER_SIZE + compressedData.length)
  result[0] = crc & 0xff
  result[1] = (crc >> 8) & 0xff
  result[2] = (crc >> 16) & 0xff
  result[3] = (crc >> 24) & 0xff
  result[4] = decompressedLength & 0xff
  result[5] = (decompressedLength >> 8) & 0xff
  result.set(compressedData, COMPRESSED_DATA_OFFSET)
  return result
}

/**
 * Parses the 6-byte integrity header and extracts the compressed payload.
 *
 * @param data - Buffer starting with the integrity header.
 * @returns The stored CRC32, expected decompressed length, and compressed bytes.
 * @throws {@link StratDecodeError} if the buffer is shorter than 6 bytes.
 */
export function unpackHeader(data: Uint8Array): {
  storedCRC: number
  decompressedLength: number
  compressedData: Uint8Array
} {
  if (data.length < BINARY_HEADER_SIZE) {
    throw new StratDecodeError('Binary data too short for header')
  }
  const storedCRC =
    (data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24)) >>> 0
  const decompressedLength = data[4] | (data[5] << 8)
  const compressedData = data.slice(COMPRESSED_DATA_OFFSET)
  return { storedCRC, decompressedLength, compressedData }
}

/**
 * Compresses data using zlib deflate.
 *
 * @param data - Raw bytes to compress.
 * @returns Deflated bytes.
 */
export function compress(data: Uint8Array): Uint8Array {
  return pako.deflate(data)
}

/**
 * Decompresses zlib-deflated data.
 *
 * @param data - Deflated bytes.
 * @returns Inflated bytes.
 * @throws {@link StratDecodeError} if decompression fails.
 */
export function decompress(data: Uint8Array): Uint8Array {
  try {
    return pako.inflate(data)
  } catch (e) {
    throw new StratDecodeError(
      `Zlib decompression failed: ${e instanceof Error ? e.message : e}`
    )
  }
}
