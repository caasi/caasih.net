/**
 * Base error for all FFXIV strategy board codec failures.
 */
export class StratError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StratError'
  }
}

/**
 * Thrown when a `[stgy:...]` string cannot be decoded.
 *
 * @remarks
 * Common causes: malformed wrapper, invalid cipher characters,
 * CRC32 mismatch, decompression failure, or unsupported binary version.
 */
export class StratDecodeError extends StratError {
  constructor(message: string) {
    super(message)
    this.name = 'StratDecodeError'
  }
}

/**
 * Thrown when a {@link BoardData} cannot be encoded.
 */
export class StratEncodeError extends StratError {
  constructor(message: string) {
    super(message)
    this.name = 'StratEncodeError'
  }
}

/** Per-object visibility and transform flags. */
export interface ObjectFlags {
  visible: boolean
  flipHorizontal: boolean
  flipVertical: boolean
  locked: boolean
}

/**
 * A single object on the strategy board.
 *
 * @remarks
 * Positions are stored as raw 1/10-pixel units (canvas 512 × 384 px).
 * Multiply by {@link COORDINATE_SCALE} to convert from pixels.
 */
export interface BoardObject {
  /** Game-defined object type (see `OBJECT_TYPES.md` in wtw0212). */
  objectId: number
  flags: ObjectFlags
  /** Position in 1/10-pixel units. */
  position: { x: number; y: number }
  /** Rotation in degrees, −180 to 180. */
  rotation: number
  /** Display scale, 50–200 (100 = 100%). */
  size: number
  color: { r: number; g: number; b: number; opacity: number }
  params: { a: number; b: number; c: number }
  /** Text content. Only present when {@link objectId} is {@link TEXT_OBJECT_ID} (0x64). */
  text?: string
}

/**
 * Decoded strategy board data.
 *
 * @remarks
 * Produced by {@link decode} and consumed by {@link encode}.
 */
export interface BoardData {
  /** Board name (max 20 characters). */
  name: string
  /** Background map identifier. */
  backgroundId: number
  /** Board objects (max 50). */
  objects: BoardObject[]
}

export const STGY_PREFIX = '[stgy:a'
export const STGY_SUFFIX = ']'
export const MIN_PAYLOAD_LENGTH = 2
export const BINARY_HEADER_SIZE = 6 // CRC32 (4) + decompressed length (2)
export const COMPRESSED_DATA_OFFSET = 6
export const BOARD_HEADER_SIZE = 16
export const TEXT_OBJECT_ID = 0x64 // 100
export const MAX_OBJECTS = 50
export const MAX_NAME_LENGTH = 20
export const MAX_TEXT_BYTES = 30
export const COORDINATE_SCALE = 10

export const FieldIds = {
  EMPTY: 0x00,
  BOARD_NAME: 0x01,
  OBJECT_ID: 0x02,
  TEXT_TERMINATOR: 0x03,
  FLAGS: 0x04,
  POSITIONS: 0x05,
  ROTATIONS: 0x06,
  SIZES: 0x07,
  COLORS: 0x08,
  PARAM_A: 0x0a,
  PARAM_B: 0x0b,
  PARAM_C: 0x0c,
} as const

export const FlagBits = {
  VISIBLE: 0x01,
  FLIP_HORIZONTAL: 0x02,
  FLIP_VERTICAL: 0x04,
  LOCKED: 0x08,
} as const

export const SectionType = {
  CONTENT: 0x00,
  BACKGROUND: 0x03,
} as const
