import {
  calculateCRC32,
  packHeader,
  unpackHeader,
  compress,
  decompress,
} from '../compression'

describe('compression', () => {
  describe('CRC32', () => {
    it('computes correct CRC32 for known input', () => {
      const input = new TextEncoder().encode('123456789')
      expect(calculateCRC32(input)).toBe(0xcbf43926)
    })
    it('computes correct CRC32 for empty input', () => {
      expect(calculateCRC32(new Uint8Array([]))).toBe(0x00000000)
    })
    it('computes correct CRC32 for single byte', () => {
      expect(calculateCRC32(new Uint8Array([0x00]))).toBe(0xd202ef8d)
    })
  })
  describe('header pack/unpack', () => {
    it('round-trips CRC32 and decompressed length', () => {
      const crc = 0xdeadbeef
      const length = 1234
      const compressed = new Uint8Array([1, 2, 3, 4])
      const packed = packHeader(crc, length, compressed)
      expect(packed.length).toBe(6 + 4)
      const result = unpackHeader(packed)
      expect(result.storedCRC).toBe(crc)
      expect(result.decompressedLength).toBe(length)
      expect(result.compressedData).toEqual(compressed)
    })
  })
  describe('compress/decompress', () => {
    it('round-trips arbitrary data', () => {
      const data = new Uint8Array(100)
      for (let i = 0; i < data.length; i++) data[i] = i % 256
      const compressed = compress(data)
      const decompressed = decompress(compressed)
      expect(decompressed).toEqual(data)
    })
  })
})
