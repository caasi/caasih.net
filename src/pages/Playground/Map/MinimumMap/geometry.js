/* @flow */

export type Point = {
  x: number,
  y: number,
}

export type Box = {
  x: number,
  y: number,
  width: number,
  height: number,
}

export type PartialBox = {
  x?: number,
  y?: number,
  width?: number,
  height?: number,
}

export type Rect = {
  top: number,
  right: number,
  bottom: number,
  left: number,
}
