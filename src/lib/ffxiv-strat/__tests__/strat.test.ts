import { decode, encode } from '../index'
import type { BoardData } from '../types'

// Real strategy codes provided by the user
const FIXTURES = [
  '[stgy:apj2EjrLlv37r5kQyDkVqIktejnb7a10FuHVctG1FIlSnTpKseMjk1kJ1OvYfqMqsV0xU08LtNf57eFaAw7JNJnxuzZLK3a7zYTT+0U-y-zISaaSNi7tFmIPdZSRycb0IJkn0ymx4O3YMwOpeSLC+AzmzdcbkruFrrZIXCUZsYOYeh1kK017N7bnDZpjhrSkNAXB062gltCK7WS08tNjVU3g404AdakFGFIJ5XHJXCUWYBzrGKIOvqIm7YkjraHmpgbwDfkdcLIt0vo+amoaRF7RjpB63mvh8toj-zynh-9k9ZH7BnaEKdXYiSnOCoMtlwdvsgDIvwkGBrNfyl1COlRLbSnwOoQPE02fID9eZ7ZtKNw7o69d68g9+QUnBj4OZdPZMrZooEZBoIyoY0HovNbAhFHx-uKHNMPtSHKEEoDU3dbMy5vS1krloWHhuF5CpaB+FiQmukYwwJ1lhWa+fzTbmuabNQ+mv+vubGm-+Ob9j-ITdVCqa59hqXORS+52naEcTWdpxZkmFrIJt7h1zqI6WO3GfHo3nQtMUOS6liXZG-t6P5DnnEvAZ2p8dvzRw-A8UWkBx0-+nUTdyU7UEEPC5A+qBzeYeAoyhdOJVMpqnANeXfLcZGsWNZHWKXORxOJSCZfJ]',
  '[stgy:aw5-pKJcyPZdvO9iFpRLn893nGo-dyTe5Q+n0j4D3qpRP+mTCPgl9Jrl+2lu7k03DC9TqqPEQ49zWzew62B+IV6P-eWGEznZp-B+P95K6VaPKAnA9vigQwpCDxxIr5kyCveZJX96gGbNEReJZ3vX-u3iO5l0JfgcyHOdUKonCfuXsSQqdM-qqx8ngqZchxv0vAeF5ETCyyFmONz6YzjTAEHEKLCEZkje]',
  '[stgy:a1ki9uZ6uJusZYFDc-IqyHFwb0zEsNICReSPIkX7ya-8XRZA6tT67F1oMlkaKgXobM4HMn7MGNi99Vw5s-hMHVMm7A+f7AMFn8vBM09C3arKTd0kcBLM6wNVOHKZ0pUu0lR-uI9GmoiNIPr4LXT2HazqDltzEUHPPONCAh7ZRz+wZ6sm8rjJc1tegxv9JxmV7PJk4TYG9JW0mQdyvu10sbkjQOzDZjYA6qb1RROw1+7k6eKW+3DREw0qhC0gVixtAllod8i7qq8EErSfsow5-euKPQSkOkmKBbWfRdIilAY+NSTB7E2mhlpB5XstI4ON1P1ogy68C3PSMqQVuswwVy2XeuKiTD4zK--TaBF6ZLXX3]',
  '[stgy:a3L0m7JZf5vIuE3aFM3bIwrCO85NgkcJ6Ha80C7vi4ZR6e0dfreV3m-rs5unMBNGSYoMx0Nv1m2x1Dkv0XQPZUN1UW93cntk1PIGE56bLcAhuZSKCaKa6Qsk6Qc+I5mjCzibqj5mHfFTVzGqV0MduOJ6uhF9HT5LzRWRGfpLT7r37btTPiYd6dYiIFuShq3LXkUmx7VzzVwxbLwVCgPkJpOJWxh7qsPNEU8FwK93Rk40Qy6wfbdkB3Dc]',
]

describe('strat integration', () => {
  describe('decode real strategy codes', () => {
    FIXTURES.forEach((code, i) => {
      it(`decodes fixture ${i + 1} without error`, () => {
        const result = decode(code)
        expect(result).toBeDefined()
        expect(typeof result.name).toBe('string')
        expect(typeof result.backgroundId).toBe('number')
        expect(Array.isArray(result.objects)).toBe(true)
      })

      it(`fixture ${i + 1} has valid objects`, () => {
        const result = decode(code)
        for (const obj of result.objects) {
          expect(obj.objectId).toBeGreaterThan(0)
          expect(obj.position.x).toBeGreaterThanOrEqual(0)
          expect(obj.position.y).toBeGreaterThanOrEqual(0)
          expect(obj.size).toBeGreaterThanOrEqual(0)
          expect(obj.size).toBeLessThanOrEqual(255)
        }
      })
    })
  })

  describe('decode → encode → decode identity', () => {
    FIXTURES.forEach((code, i) => {
      it(`encode(decode(fixture ${i + 1})) produces a decodable string`, () => {
        const decoded = decode(code)
        const reEncoded = encode(decoded)
        const reDecoded = decode(reEncoded)
        expect(reDecoded.name).toBe(decoded.name)
        expect(reDecoded.backgroundId).toBe(decoded.backgroundId)
        expect(reDecoded.objects.length).toBe(decoded.objects.length)
        for (let j = 0; j < decoded.objects.length; j++) {
          expect(reDecoded.objects[j].objectId).toBe(decoded.objects[j].objectId)
          expect(reDecoded.objects[j].position).toEqual(decoded.objects[j].position)
          expect(reDecoded.objects[j].rotation).toBe(decoded.objects[j].rotation)
          expect(reDecoded.objects[j].size).toBe(decoded.objects[j].size)
          expect(reDecoded.objects[j].text).toBe(decoded.objects[j].text)
        }
      })
    })
  })

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
      }
      const encoded = encode(board)
      expect(encoded.startsWith('[stgy:a')).toBe(true)
      expect(encoded.endsWith(']')).toBe(true)

      const decoded = decode(encoded)
      expect(decoded.name).toBe('RoundTrip')
      expect(decoded.backgroundId).toBe(3)
      expect(decoded.objects.length).toBe(2)
      expect(decoded.objects[0].objectId).toBe(0x2f)
      expect(decoded.objects[0].rotation).toBe(45)
      expect(decoded.objects[1].text).toBe('Stack here')
    })
  })

  describe('encode limits', () => {
    it('encodes a board at MAX_OBJECTS (50) without overflow', () => {
      const board: BoardData = {
        name: 'Full',
        backgroundId: 1,
        objects: Array.from({ length: 50 }, (_, i) => ({
          objectId: 0x2f,
          flags: { visible: true, flipHorizontal: false, flipVertical: false, locked: false },
          position: { x: i * 100, y: i * 50 },
          rotation: 0,
          size: 100,
          color: { r: 0, g: 0, b: 0, opacity: 0 },
          params: { a: 0, b: 0, c: 0 },
        })),
      }
      const encoded = encode(board)
      const decoded = decode(encoded)
      expect(decoded.objects.length).toBe(50)
    })
  })

  describe('error cases', () => {
    it('throws on malformed input', () => {
      expect(() => decode('not a stgy string')).toThrow()
    })

    it('throws on truncated input', () => {
      expect(() => decode('[stgy:aXY]')).toThrow()
    })

    it('throws on corrupted payload', () => {
      const code = FIXTURES[0]
      const charAtPos10 = code[10]
      const replacement = charAtPos10 === 'A' ? 'B' : 'A'
      const corrupted = code.slice(0, 10) + replacement + code.slice(11)
      expect(() => decode(corrupted)).toThrow()
    })
  })
})
