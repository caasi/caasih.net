import { parseBoardData, serializeBoardData } from '../binary'
import type { BoardData } from '../types'

describe('binary', () => {
  const minimalBoard: BoardData = {
    name: '',
    backgroundId: 1,
    objects: [],
  }

  const singleObjectBoard: BoardData = {
    name: 'Test',
    backgroundId: 2,
    objects: [
      {
        objectId: 0x2f, // Tank
        flags: {
          visible: true,
          flipHorizontal: false,
          flipVertical: false,
          locked: false,
        },
        position: { x: 2560, y: 1920 }, // raw 1/10 px
        rotation: 0,
        size: 100,
        color: { r: 255, g: 0, b: 0, opacity: 0 },
        params: { a: 0, b: 0, c: 0 },
      },
    ],
  }

  const textObjectBoard: BoardData = {
    name: 'TextBoard',
    backgroundId: 1,
    objects: [
      {
        objectId: 0x64, // Text
        flags: {
          visible: true,
          flipHorizontal: false,
          flipVertical: false,
          locked: false,
        },
        position: { x: 1000, y: 1000 },
        rotation: 0,
        size: 100,
        color: { r: 0, g: 0, b: 0, opacity: 0 },
        params: { a: 0, b: 0, c: 0 },
        text: 'Hello',
      },
    ],
  }

  const multiObjectBoard: BoardData = {
    name: 'Multi',
    backgroundId: 3,
    objects: [
      {
        objectId: 0x2f,
        flags: {
          visible: true,
          flipHorizontal: false,
          flipVertical: false,
          locked: false,
        },
        position: { x: 1000, y: 2000 },
        rotation: 45,
        size: 80,
        color: { r: 255, g: 128, b: 0, opacity: 50 },
        params: { a: 10, b: 20, c: 30 },
      },
      {
        objectId: 0x30,
        flags: {
          visible: false,
          flipHorizontal: true,
          flipVertical: true,
          locked: true,
        },
        position: { x: 3000, y: 4000 },
        rotation: -90,
        size: 200,
        color: { r: 0, g: 255, b: 0, opacity: 100 },
        params: { a: 5, b: 15, c: 25 },
      },
    ],
  }

  describe('serialize then parse round-trip', () => {
    it('handles empty board', () => {
      const binary = serializeBoardData(minimalBoard)
      const result = parseBoardData(binary)
      expect(result.name).toBe('')
      expect(result.backgroundId).toBe(1)
      expect(result.objects).toEqual([])
    })

    it('handles single object', () => {
      const binary = serializeBoardData(singleObjectBoard)
      const result = parseBoardData(binary)
      expect(result.name).toBe('Test')
      expect(result.backgroundId).toBe(2)
      expect(result.objects.length).toBe(1)
      const obj = result.objects[0]
      expect(obj.objectId).toBe(0x2f)
      expect(obj.flags.visible).toBe(true)
      expect(obj.flags.flipHorizontal).toBe(false)
      expect(obj.flags.flipVertical).toBe(false)
      expect(obj.flags.locked).toBe(false)
      expect(obj.position.x).toBe(2560)
      expect(obj.position.y).toBe(1920)
      expect(obj.rotation).toBe(0)
      expect(obj.size).toBe(100)
      expect(obj.color.r).toBe(255)
      expect(obj.color.g).toBe(0)
      expect(obj.color.b).toBe(0)
      expect(obj.color.opacity).toBe(0)
      expect(obj.params).toEqual({ a: 0, b: 0, c: 0 })
    })

    it('handles text object', () => {
      const binary = serializeBoardData(textObjectBoard)
      const result = parseBoardData(binary)
      expect(result.objects.length).toBe(1)
      expect(result.objects[0].text).toBe('Hello')
      expect(result.objects[0].objectId).toBe(0x64)
    })

    it('handles multiple objects with varied attributes', () => {
      const binary = serializeBoardData(multiObjectBoard)
      const result = parseBoardData(binary)
      expect(result.name).toBe('Multi')
      expect(result.backgroundId).toBe(3)
      expect(result.objects.length).toBe(2)

      const obj0 = result.objects[0]
      expect(obj0.objectId).toBe(0x2f)
      expect(obj0.flags.visible).toBe(true)
      expect(obj0.flags.locked).toBe(false)
      expect(obj0.position).toEqual({ x: 1000, y: 2000 })
      expect(obj0.rotation).toBe(45)
      expect(obj0.size).toBe(80)
      expect(obj0.color).toEqual({ r: 255, g: 128, b: 0, opacity: 50 })
      expect(obj0.params).toEqual({ a: 10, b: 20, c: 30 })

      const obj1 = result.objects[1]
      expect(obj1.objectId).toBe(0x30)
      expect(obj1.flags.visible).toBe(false)
      expect(obj1.flags.flipHorizontal).toBe(true)
      expect(obj1.flags.flipVertical).toBe(true)
      expect(obj1.flags.locked).toBe(true)
      expect(obj1.position).toEqual({ x: 3000, y: 4000 })
      expect(obj1.rotation).toBe(-90)
      expect(obj1.size).toBe(200)
      expect(obj1.color).toEqual({ r: 0, g: 255, b: 0, opacity: 100 })
      expect(obj1.params).toEqual({ a: 5, b: 15, c: 25 })
    })

    it('handles text object among non-text objects', () => {
      const board: BoardData = {
        name: 'Mixed',
        backgroundId: 1,
        objects: [
          {
            objectId: 0x2f,
            flags: {
              visible: true,
              flipHorizontal: false,
              flipVertical: false,
              locked: false,
            },
            position: { x: 100, y: 200 },
            rotation: 0,
            size: 100,
            color: { r: 255, g: 255, b: 255, opacity: 0 },
            params: { a: 0, b: 0, c: 0 },
          },
          {
            objectId: 0x64,
            flags: {
              visible: true,
              flipHorizontal: false,
              flipVertical: false,
              locked: false,
            },
            position: { x: 300, y: 400 },
            rotation: 0,
            size: 100,
            color: { r: 0, g: 0, b: 0, opacity: 0 },
            params: { a: 0, b: 0, c: 0 },
            text: 'Note',
          },
        ],
      }
      const binary = serializeBoardData(board)
      const result = parseBoardData(binary)
      expect(result.objects.length).toBe(2)
      expect(result.objects[0].objectId).toBe(0x2f)
      expect(result.objects[0].text).toBeUndefined()
      expect(result.objects[1].objectId).toBe(0x64)
      expect(result.objects[1].text).toBe('Note')
    })
  })

  describe('parseBoardData', () => {
    it('rejects unsupported version', () => {
      const binary = new Uint8Array(16)
      // version = 99 (little-endian)
      binary[0] = 99
      expect(() => parseBoardData(binary)).toThrow('version')
    })

    it('rejects truncated data', () => {
      expect(() => parseBoardData(new Uint8Array(4))).toThrow()
    })
  })

  describe('serializeBoardData', () => {
    it('produces valid binary header', () => {
      const binary = serializeBoardData(minimalBoard)
      const view = new DataView(binary.buffer, binary.byteOffset, binary.byteLength)
      // version = 2
      expect(view.getUint32(0, true)).toBe(2)
      // content length > 0
      expect(view.getUint32(4, true)).toBeGreaterThan(0)
    })

    it('binary output is deterministic', () => {
      const a = serializeBoardData(singleObjectBoard)
      const b = serializeBoardData(singleObjectBoard)
      expect(a).toEqual(b)
    })
  })

  describe('edge cases', () => {
    it('handles board name with multibyte UTF-8 characters', () => {
      const board: BoardData = {
        name: 'テスト',
        backgroundId: 1,
        objects: [],
      }
      const binary = serializeBoardData(board)
      const result = parseBoardData(binary)
      expect(result.name).toBe('テスト')
    })

    it('handles odd number of objects (size padding)', () => {
      const board: BoardData = {
        name: '',
        backgroundId: 1,
        objects: [
          {
            objectId: 0x01,
            flags: {
              visible: true,
              flipHorizontal: false,
              flipVertical: false,
              locked: false,
            },
            position: { x: 0, y: 0 },
            rotation: 0,
            size: 50,
            color: { r: 0, g: 0, b: 0, opacity: 0 },
            params: { a: 0, b: 0, c: 0 },
          },
        ],
      }
      const binary = serializeBoardData(board)
      const result = parseBoardData(binary)
      expect(result.objects[0].size).toBe(50)
    })

    it('handles text object with empty string', () => {
      const board: BoardData = {
        name: '',
        backgroundId: 1,
        objects: [
          {
            objectId: 0x64,
            flags: {
              visible: true,
              flipHorizontal: false,
              flipVertical: false,
              locked: false,
            },
            position: { x: 0, y: 0 },
            rotation: 0,
            size: 100,
            color: { r: 0, g: 0, b: 0, opacity: 0 },
            params: { a: 0, b: 0, c: 0 },
            text: '',
          },
        ],
      }
      const binary = serializeBoardData(board)
      const result = parseBoardData(binary)
      expect(result.objects[0].objectId).toBe(0x64)
      // Empty text may or may not be preserved; at minimum the object should round-trip
      expect(result.objects[0].text).toBeDefined()
    })
  })
})
