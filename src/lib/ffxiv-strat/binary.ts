/**
 * SoA binary parser and serializer for FFXIV strategy board data.
 *
 * Binary format:
 * - Board header (16 bytes): version(u32) + contentLength(u32) + padding(8 bytes)
 * - Content section: SectionType(u16)=0x00 + length(u16) + field containers
 * - Background section: SectionType(u16)=0x03 + type(u16)=1 + count(u16)=1 + backgroundId(u16)
 *
 * All multi-byte values are little-endian.
 */

import {
  StratDecodeError,
  StratEncodeError,
  BOARD_HEADER_SIZE,
  TEXT_OBJECT_ID,
  MAX_OBJECTS,
  MAX_NAME_LENGTH,
  MAX_TEXT_BYTES,
  FieldIds,
  FlagBits,
  SectionType,
} from './types'
import type { BoardData, BoardObject, ObjectFlags } from './types'

// ---------------------------------------------------------------------------
// BinaryReader
// ---------------------------------------------------------------------------

class BinaryReader {
  private view: DataView
  private offset: number

  constructor(data: Uint8Array) {
    this.view = new DataView(data.buffer, data.byteOffset, data.byteLength)
    this.offset = 0
  }

  get position(): number {
    return this.offset
  }

  get remaining(): number {
    return this.view.byteLength - this.offset
  }

  readUint8(): number {
    this.ensureRemaining(1)
    const value = this.view.getUint8(this.offset)
    this.offset += 1
    return value
  }

  readUint16(): number {
    this.ensureRemaining(2)
    const value = this.view.getUint16(this.offset, true)
    this.offset += 2
    return value
  }

  readInt16(): number {
    this.ensureRemaining(2)
    const value = this.view.getInt16(this.offset, true)
    this.offset += 2
    return value
  }

  readUint32(): number {
    this.ensureRemaining(4)
    const value = this.view.getUint32(this.offset, true)
    this.offset += 4
    return value
  }

  readString(length: number): string {
    this.ensureRemaining(length)
    const bytes = new Uint8Array(
      this.view.buffer,
      this.view.byteOffset + this.offset,
      length
    )
    this.offset += length
    let end = bytes.indexOf(0)
    if (end === -1) end = bytes.length
    return new TextDecoder('utf-8').decode(bytes.subarray(0, end))
  }

  skip(bytes: number): void {
    if (bytes < 0) {
      throw new StratDecodeError(
        `Invalid skip length: ${bytes} at offset ${this.offset}`
      )
    }
    this.ensureRemaining(bytes)
    this.offset += bytes
  }

  private ensureRemaining(bytes: number): void {
    if (this.remaining < bytes) {
      throw new StratDecodeError(
        `Unexpected end of data: need ${bytes} bytes at offset ${this.offset}, ` +
          `but only ${this.remaining} remaining`
      )
    }
  }
}

// ---------------------------------------------------------------------------
// BinaryWriter
// ---------------------------------------------------------------------------

class BinaryWriter {
  private buffer: number[] = []

  get length(): number {
    return this.buffer.length
  }

  writeUint8(value: number): void {
    this.buffer.push(value & 0xff)
  }

  writeUint16(value: number): void {
    this.buffer.push(value & 0xff)
    this.buffer.push((value >> 8) & 0xff)
  }

  writeInt16(value: number): void {
    const unsigned = value < 0 ? value + 0x10000 : value
    this.writeUint16(unsigned)
  }

  writeUint32(value: number): void {
    this.buffer.push(value & 0xff)
    this.buffer.push((value >> 8) & 0xff)
    this.buffer.push((value >> 16) & 0xff)
    this.buffer.push((value >> 24) & 0xff)
  }

  writeBytes(bytes: Uint8Array): void {
    for (const byte of bytes) {
      this.buffer.push(byte)
    }
  }

  writeString(str: string): void {
    const bytes = new TextEncoder().encode(str)
    this.writeBytes(bytes)
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return length padded to 4-byte boundary. */
function padTo4Bytes(length: number): number {
  return Math.ceil(length / 4) * 4
}

/** Encode flags to a u16 bitmask. */
function encodeFlags(flags: ObjectFlags): number {
  let value = 0
  if (flags.visible) value |= FlagBits.VISIBLE
  if (flags.flipHorizontal) value |= FlagBits.FLIP_HORIZONTAL
  if (flags.flipVertical) value |= FlagBits.FLIP_VERTICAL
  if (flags.locked) value |= FlagBits.LOCKED
  return value
}

/** Decode a u16 bitmask to ObjectFlags. */
function decodeFlags(value: number): ObjectFlags {
  return {
    visible: (value & FlagBits.VISIBLE) !== 0,
    flipHorizontal: (value & FlagBits.FLIP_HORIZONTAL) !== 0,
    flipVertical: (value & FlagBits.FLIP_VERTICAL) !== 0,
    locked: (value & FlagBits.LOCKED) !== 0,
  }
}

// ---------------------------------------------------------------------------
// Parser intermediate context (SoA arrays)
// ---------------------------------------------------------------------------

interface ParseContext {
  boardName: string
  backgroundId: number
  objectIds: number[]
  texts: string[]
  flagsArray: ObjectFlags[]
  positions: Array<{ x: number; y: number }>
  rotations: number[]
  sizes: number[]
  colors: Array<{ r: number; g: number; b: number; opacity: number }>
  paramAs: number[]
  paramBs: number[]
  paramCs: number[]
}

function createParseContext(): ParseContext {
  return {
    boardName: '',
    backgroundId: 1,
    objectIds: [],
    texts: [],
    flagsArray: [],
    positions: [],
    rotations: [],
    sizes: [],
    colors: [],
    paramAs: [],
    paramBs: [],
    paramCs: [],
  }
}

// ---------------------------------------------------------------------------
// Field parsers
// ---------------------------------------------------------------------------

type FieldParser = (reader: BinaryReader, context: ParseContext) => void

/** Field 1: Board name — string with 4-byte-aligned length. */
function parseFieldBoardName(
  reader: BinaryReader,
  context: ParseContext
): void {
  const stringLength = reader.readUint16()
  const paddedLength = padTo4Bytes(stringLength)
  context.boardName = reader.readString(paddedLength)
}

/** Field 2: Object ID — single u16 per occurrence. */
function parseFieldObjectId(reader: BinaryReader, context: ParseContext): void {
  const objectId = reader.readUint16()
  context.objectIds.push(objectId)
}

/**
 * Field 3 / SectionType 0x03: Text content OR background section.
 *
 * When length === 1 it is a background section marker:
 *   type(u16)=1, count(u16)=1, backgroundId(u16)
 * Otherwise it is text content following a text object ID.
 */
function parseFieldTextOrBackground(
  reader: BinaryReader,
  context: ParseContext
): void {
  const length = reader.readUint16()
  if (length === 1) {
    // Background section: type(1) already read as length, count(u16)=1, backgroundId(u16)
    reader.readUint16() // count = 1
    context.backgroundId = reader.readUint16()
  } else {
    // Text content
    const paddedLength = padTo4Bytes(length)
    const text = reader.readString(paddedLength)
    context.texts.push(text)
  }
}

/** Field 4: Flags array — typed array of u16. */
function parseFieldFlags(reader: BinaryReader, context: ParseContext): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    context.flagsArray.push(decodeFlags(reader.readUint16()))
  }
}

/** Field 5: Positions array — each element is two u16 (x, y). No scaling. */
function parseFieldPositions(
  reader: BinaryReader,
  context: ParseContext
): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    const x = reader.readUint16()
    const y = reader.readUint16()
    context.positions.push({ x, y })
  }
}

/** Field 6: Rotations array — typed array of i16. */
function parseFieldRotations(
  reader: BinaryReader,
  context: ParseContext
): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    context.rotations.push(reader.readInt16())
  }
}

/** Field 7: Sizes array — typed array of u8 with 2-byte alignment padding. */
function parseFieldSizes(reader: BinaryReader, context: ParseContext): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    context.sizes.push(reader.readUint8())
  }
  // Align to 2-byte boundary when count is odd
  if (count % 2 === 1) {
    reader.readUint8() // padding byte
  }
}

/** Field 8: Colors array — each element is 4 u8 (r, g, b, opacity). */
function parseFieldColors(reader: BinaryReader, context: ParseContext): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    const r = reader.readUint8()
    const g = reader.readUint8()
    const b = reader.readUint8()
    const opacity = reader.readUint8()
    context.colors.push({ r, g, b, opacity })
  }
}

/** Field 10: Param A array — typed array of u16. */
function parseFieldParamA(reader: BinaryReader, context: ParseContext): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    context.paramAs.push(reader.readUint16())
  }
}

/** Field 11: Param B array — typed array of u16. */
function parseFieldParamB(reader: BinaryReader, context: ParseContext): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    context.paramBs.push(reader.readUint16())
  }
}

/** Field 12: Param C array — typed array of u16. */
function parseFieldParamC(reader: BinaryReader, context: ParseContext): void {
  reader.readUint16() // type
  const count = reader.readUint16()
  for (let i = 0; i < count; i++) {
    context.paramCs.push(reader.readUint16())
  }
}

const fieldParsers: Readonly<Record<number, FieldParser>> = {
  [FieldIds.BOARD_NAME]: parseFieldBoardName,
  [FieldIds.OBJECT_ID]: parseFieldObjectId,
  [FieldIds.TEXT_TERMINATOR]: parseFieldTextOrBackground,
  [FieldIds.FLAGS]: parseFieldFlags,
  [FieldIds.POSITIONS]: parseFieldPositions,
  [FieldIds.ROTATIONS]: parseFieldRotations,
  [FieldIds.SIZES]: parseFieldSizes,
  [FieldIds.COLORS]: parseFieldColors,
  [FieldIds.PARAM_A]: parseFieldParamA,
  [FieldIds.PARAM_B]: parseFieldParamB,
  [FieldIds.PARAM_C]: parseFieldParamC,
}

// ---------------------------------------------------------------------------
// Assemble objects from SoA context into BoardObject[]
// ---------------------------------------------------------------------------

function assembleObjects(context: ParseContext): BoardObject[] {
  const objects: BoardObject[] = []
  let textIndex = 0

  const defaultFlags: ObjectFlags = {
    visible: true,
    flipHorizontal: false,
    flipVertical: false,
    locked: false,
  }

  for (let i = 0; i < context.objectIds.length; i++) {
    const objectId = context.objectIds[i]
    const isTextObject = objectId === TEXT_OBJECT_ID

    const obj: BoardObject = {
      objectId,
      flags: context.flagsArray[i] ?? defaultFlags,
      position: context.positions[i] ?? { x: 0, y: 0 },
      rotation: context.rotations[i] ?? 0,
      size: context.sizes[i] ?? 100,
      color: context.colors[i] ?? { r: 255, g: 255, b: 255, opacity: 0 },
      params: {
        a: context.paramAs[i] ?? 0,
        b: context.paramBs[i] ?? 0,
        c: context.paramCs[i] ?? 0,
      },
    }

    if (isTextObject && textIndex < context.texts.length) {
      obj.text = context.texts[textIndex]
      textIndex++
    }

    objects.push(obj)
  }

  return objects
}

// ---------------------------------------------------------------------------
// Public API: parseBoardData
// ---------------------------------------------------------------------------

const SUPPORTED_VERSION = 2

/**
 * Parse decompressed SoA binary data into a BoardData structure.
 *
 * @throws {StratDecodeError} on truncated data or unsupported version
 */
export function parseBoardData(data: Uint8Array): BoardData {
  if (data.length < BOARD_HEADER_SIZE) {
    throw new StratDecodeError(
      `Data too short: expected at least ${BOARD_HEADER_SIZE} bytes, got ${data.length}`
    )
  }

  const reader = new BinaryReader(data)

  // Board header (16 bytes)
  const version = reader.readUint32()
  if (version !== SUPPORTED_VERSION) {
    throw new StratDecodeError(
      `Unsupported version: ${version} (expected ${SUPPORTED_VERSION})`
    )
  }
  reader.readUint32() // content length (skip; we parse to end)
  reader.readUint16() // flags (always 0x0001 in real data; hardcoded on re-encode)
  reader.readUint16() // title length (not used; name parsed from Field 1)
  reader.readUint32() // padding

  // Parse sections / fields
  const context = createParseContext()
  let insideContentSection = false

  while (reader.remaining >= 2) {
    const sectionTypeOrFieldId = reader.readUint16()

    // Content section start (SectionType 0x00)
    // Note: SectionType.CONTENT (0x00) and FieldId EMPTY (0x00) share the same value.
    // Only treat as SectionType when not yet inside the content section.
    if (sectionTypeOrFieldId === SectionType.CONTENT && !insideContentSection) {
      reader.readUint16() // section content length (skip)
      insideContentSection = true
      continue
    }

    // FieldId 0 (Empty) — skip
    if (sectionTypeOrFieldId === FieldIds.EMPTY) {
      continue
    }

    // Dispatch to field-specific parser
    // Note: SectionType.BACKGROUND (0x03) and FieldIds.TEXT_TERMINATOR (0x03)
    // share the same value. parseFieldTextOrBackground handles both cases
    // by inspecting the length value (1 => background section).
    const parser = fieldParsers[sectionTypeOrFieldId]
    if (parser) {
      parser(reader, context)
    } else {
      // Unknown field ID encountered. The binary format has no generic length
      // prefix, so we cannot safely skip the field's data. Treat this as a
      // decode failure instead of returning a partially parsed board.
      throw new StratDecodeError(
        `Unknown field ID: 0x${sectionTypeOrFieldId.toString(16).padStart(4, '0')}`
      )
    }
  }

  return {
    name: context.boardName,
    backgroundId: context.backgroundId,
    objects: assembleObjects(context),
  }
}

// ---------------------------------------------------------------------------
// Public API: serializeBoardData
// ---------------------------------------------------------------------------

/**
 * Serialize a BoardData structure into SoA binary format.
 */
export function serializeBoardData(board: BoardData): Uint8Array {
  // Validate format limits
  if (board.objects.length > MAX_OBJECTS) {
    throw new StratEncodeError(
      `Too many objects: ${board.objects.length} (max ${MAX_OBJECTS})`
    )
  }
  if (board.name.length > MAX_NAME_LENGTH) {
    throw new StratEncodeError(
      `Board name too long: ${board.name.length} chars (max ${MAX_NAME_LENGTH})`
    )
  }
  for (let i = 0; i < board.objects.length; i++) {
    const obj = board.objects[i]
    if (obj.text !== undefined) {
      const textBytes = new TextEncoder().encode(obj.text)
      if (textBytes.length > MAX_TEXT_BYTES) {
        throw new StratEncodeError(
          `Object ${i} text too long: ${textBytes.length} bytes (max ${MAX_TEXT_BYTES})`
        )
      }
    }
  }

  // 1. Serialize field content into a temporary buffer
  const contentWriter = new BinaryWriter()
  serializeFields(board, contentWriter)
  const contentData = contentWriter.toUint8Array()

  // Content section: SectionType(u16) + length(u16) + content
  const sectionContentLength = contentData.length

  // Background section: SectionType(u16) + type(u16) + count(u16) + backgroundId(u16) = 8 bytes
  const backgroundSectionLength = 8

  // Total content length (after the 16-byte header)
  const totalContentLength =
    2 + 2 + sectionContentLength + backgroundSectionLength

  // 2. Write final binary
  const writer = new BinaryWriter()

  // Board header (16 bytes)
  writer.writeUint32(SUPPORTED_VERSION) // version = 2
  writer.writeUint32(totalContentLength) // content length
  writer.writeUint16(1) // flags (always 0x0001 in real game data)
  writer.writeUint16(0) // title length (unused, set to zero)
  writer.writeUint32(0) // padding

  // Content section
  writer.writeUint16(SectionType.CONTENT) // 0x00
  writer.writeUint16(sectionContentLength) // content length
  writer.writeBytes(contentData)

  // Background section
  writer.writeUint16(SectionType.BACKGROUND) // 0x03
  writer.writeUint16(1) // type = 1 (WORD)
  writer.writeUint16(1) // count = 1
  writer.writeUint16(board.backgroundId)

  return writer.toUint8Array()
}

// ---------------------------------------------------------------------------
// Field serialization
// ---------------------------------------------------------------------------

/**
 * Serialize all field containers (TypeContainers) inside the content section.
 */
function serializeFields(board: BoardData, writer: BinaryWriter): void {
  const objects = board.objects
  const objectCount = objects.length

  // Field 1: Board name
  if (board.name.length > 0) {
    const nameBytes = new TextEncoder().encode(board.name)
    const nameLength = nameBytes.length
    // Pad to 4-byte boundary including at least 1 null byte
    const paddedLength = Math.ceil((nameLength + 1) / 4) * 4

    writer.writeUint16(FieldIds.BOARD_NAME) // fieldId
    writer.writeUint16(paddedLength) // string length (padded)
    for (const byte of nameBytes) {
      writer.writeUint8(byte)
    }
    // Null + padding bytes
    for (let i = nameLength; i < paddedLength; i++) {
      writer.writeUint8(0)
    }
  }

  // Field 2: Object IDs (one record per object)
  // For text objects, Field 3 (text content) immediately follows
  for (const obj of objects) {
    writer.writeUint16(FieldIds.OBJECT_ID) // fieldId
    writer.writeUint16(obj.objectId)

    if (obj.objectId === TEXT_OBJECT_ID && obj.text !== undefined) {
      const textBytes = new TextEncoder().encode(obj.text)
      const textLength = textBytes.length
      // Pad to 4-byte boundary including at least 1 null byte
      const paddedLength = Math.ceil((textLength + 1) / 4) * 4

      writer.writeUint16(FieldIds.TEXT_TERMINATOR) // fieldId = 0x03
      writer.writeUint16(paddedLength) // string length (padded)
      for (const byte of textBytes) {
        writer.writeUint8(byte)
      }
      for (let i = textLength; i < paddedLength; i++) {
        writer.writeUint8(0)
      }
    }
  }

  // Field 4: Flags array
  if (objectCount > 0) {
    writer.writeUint16(FieldIds.FLAGS)
    writer.writeUint16(1) // type = 1 (WORD)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeUint16(encodeFlags(obj.flags))
    }
  }

  // Field 5: Positions array (raw 1/10 pixel values, no scaling)
  if (objectCount > 0) {
    writer.writeUint16(FieldIds.POSITIONS)
    writer.writeUint16(3) // type = 3 (two u16 per element)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeUint16(obj.position.x)
      writer.writeUint16(obj.position.y)
    }
  }

  // Field 6: Rotations array
  if (objectCount > 0) {
    writer.writeUint16(FieldIds.ROTATIONS)
    writer.writeUint16(1) // type = 1 (WORD)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeInt16(obj.rotation)
    }
  }

  // Field 7: Sizes array (u8 with 2-byte alignment padding)
  if (objectCount > 0) {
    writer.writeUint16(FieldIds.SIZES)
    writer.writeUint16(0) // type = 0 (BYTE)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeUint8(obj.size)
    }
    // Pad to 2-byte boundary when count is odd
    if (objectCount % 2 === 1) {
      writer.writeUint8(0)
    }
  }

  // Field 8: Colors array
  if (objectCount > 0) {
    writer.writeUint16(FieldIds.COLORS)
    writer.writeUint16(2) // type = 2 (4 bytes per element)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeUint8(obj.color.r)
      writer.writeUint8(obj.color.g)
      writer.writeUint8(obj.color.b)
      writer.writeUint8(obj.color.opacity)
    }
  }

  // Field 10: Param A array (only if any object has a non-zero value)
  const hasParamA = objects.some((obj) => obj.params.a !== 0)
  if (hasParamA && objectCount > 0) {
    writer.writeUint16(FieldIds.PARAM_A)
    writer.writeUint16(1) // type = 1 (WORD)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeUint16(obj.params.a)
    }
  }

  // Field 11: Param B array
  const hasParamB = objects.some((obj) => obj.params.b !== 0)
  if (hasParamB && objectCount > 0) {
    writer.writeUint16(FieldIds.PARAM_B)
    writer.writeUint16(1) // type = 1 (WORD)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeUint16(obj.params.b)
    }
  }

  // Field 12: Param C array
  const hasParamC = objects.some((obj) => obj.params.c !== 0)
  if (hasParamC && objectCount > 0) {
    writer.writeUint16(FieldIds.PARAM_C)
    writer.writeUint16(1) // type = 1 (WORD)
    writer.writeUint16(objectCount)
    for (const obj of objects) {
      writer.writeUint16(obj.params.c)
    }
  }
}
