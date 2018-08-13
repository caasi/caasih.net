/* @flow */

import type { Point, Box, Rect } from './geometry'
import { makeTransformers } from './transform'

export type MapObjectID = string

export type MapObject = {
  id: MapObjectID,
  x: number,
  y: number,
  width: number,
  height: number,
}

export type State = {
  screen: Box,
  viewport: Box,
  isDraggingV: boolean,
  startPointV: Point,
  prevPointV: Point,
  objects: { [key: string]: MapObject },
  selection: MapObjectID[],
  boundingBox: Box,
  isDragging: boolean,
  startPoint: Point,
  prevPoint: Point,
}

export type Action = State => State

// XXX: wrong direction, should use reduceRight
const pipe
  : (...fs: Action[]) => Action
  = (...fs) => (state) => fs.reduce((s, f) => f(s), state)

export const init
  : (number, number) => Action
  = (width, height) => () => ({
    // TODO: move into the dimension.js
    screen: {
      x: 0,
      y: 0,
      width,
      height,
    },
    viewport: {
      x: 0,
      y: 0,
      width,
      height,
    },
    // TODO: move into the input.js
    isDraggingV: false,
    startPointV: { x: 0, y: 0 },
    prevPointV: { x: 0, y: 0 },
    objects: {
      '0': { id: '0', x: 0, y: 0, width: 200, height: 160 },
      '1': { id: '1', x: 210, y: 20, width: 300, height: 200 },
    },
    selection: [],
    boundingBox: { x: 0, y: 0, width: 0, height: 0 },
    // TODO: move into the input.js
    isDragging: false,
    startPoint: { x: 0, y: 0 },
    prevPoint: { x: 0, y: 0 },
  })

export const getObject
  : State => MapObjectID => MapObject
  = (state) => (id) => {
    return state.objects[id]
  }

export const updateObject
  : MapObject => Action
  = (obj) => (state) => {
    const { id } = obj
    const objects = { ...state.objects, [id]: obj }
    return { ...state, objects }
  }

export const updateBoundingBox
  : Action
  = (state) => {
    if (state.selection.length === 0) {
      return { ...state, boundingBox: { x: 0, y: 0, width: 0, height: 0 } }
    }

    const box = state.selection
      .map(getObject(state))
      .reduce((box, obj) => {
        const left = obj.x
        const right = obj.x + obj.width
        const top = obj.y
        const bottom = obj.y + obj.height
        return {
          left: left < box.left ? left : box.left,
          top: top < box.top ? top : box.top,
          right: right > box.right ? right : box.right,
          bottom: bottom > box.bottom ? bottom : box.bottom,
        }
      }, { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity })

    return {
      ...state,
      boundingBox: {
        x: box.left,
        y: box.top,
        width: box.right - box.left,
        height: box.bottom - box.top
      }
    }
  }

const _select
  : MapObject => Action
  = (obj) => (state) => {
    const { id } = obj
    const selection = state.selection.indexOf(id) === -1
      ? [...state.selection, id]
      : state.selection
    return { ...state, selection }
  }

export const select
  : MapObject => Action
  = (obj) =>
    pipe(
      _select(obj),
      updateBoundingBox,
    )

const _unselect
  : MapObject => Action
  = (obj) => (state) => {
    let selection = []
    for (let id of state.selection) {
      if (id === obj.id) continue
      selection.push(id)
    }
    return { ...state, selection }
  }

export const unselect
  : MapObject => Action
  = (obj) =>
    pipe(
      _unselect(obj),
      updateBoundingBox,
    )

export const moveObject
  : Point => MapObject => Action
  = (pt) => (obj) => {
    const newObj = { ...obj, x: obj.x + pt.x, y: obj.y + pt.y }
    return updateObject(newObj)
  }

export const dragStart
  : Point => Action
  = (pt) => (state) => {
    const { screen, viewport } = state
    const { toGlobal } = makeTransformers(screen, viewport)
    const { x, y } = toGlobal(pt)
    const pt2 = { x, y }
    return { ...state, isDragging: true, startPoint: pt2, prevPoint: pt2 }
  }

export const dragEnd
  : () => Action
  = () => (state) => {
    const origin = { x: 0, y: 0 }
    return { ...state, isDragging: false, startPoint: origin, prevPoint: origin }
  }

export const dragMove
  : Point => Action
  = ({ x: width, y: height }) => (state) => {
    const { selection, prevPoint, screen, viewport } = state
    // scale the input
    // TODO: should do this in the map component
    const { toGlobal } = makeTransformers(screen, viewport)
    const { width: x, height: y } = toGlobal({ width, height })
    const pt2 = { x, y }
    const vector = { x: pt2.x - prevPoint.x, y: pt2.y - prevPoint.y }
    const steps = selection.map(getObject(state)).map(moveObject(vector))
    steps.push((state) => ({ ...state, prevPoint: pt2 }))
    steps.push(updateBoundingBox)
    return pipe(...steps)(state)
  }

const moveViewport
  : Point => Action
  = (pt) => (state) => {
    const vp = state.viewport
    const viewport = { ...vp, x: vp.x + pt.x, y: vp.y + pt.y }
    return { ...state, viewport }
  }

export const scaleViewport
  : number => Action
  = (scale) => (state) => {
    const { screen } = state
    const viewport = {
      ...state.viewport,
      width: screen.width * scale,
      height: screen.height * scale,
    }
    return { ...state, viewport }
  }

export const dragViewportStart
  : Point => Action
  = (pt) => (state) => {
    const { screen, viewport } = state
    const { toGlobal } = makeTransformers(screen, viewport)
    const { x, y } = toGlobal(pt)
    const pt2 = { x, y }
    return { ...state, isDraggingV: true, startPointV: pt2, prevPointV: pt2 }
  }

export const dragViewportEnd
  : () => Action
  = () => (state) => {
    const origin = { x: 0, y: 0 }
    return { ...state, isDraggingV: false, startPointV: origin, prevPointV: origin }
  }

export const dragViewportMove
  : Point => Action
  = ({ x: width, y: height }) => (state) => {
    const { prevPointV, screen, viewport } = state
    const { toGlobal } = makeTransformers(screen, viewport)
    const { width: x, height: y } = toGlobal({ width, height })
    const pt2 = { x, y }
    const vector = { x: pt2.x - prevPointV.x, y: pt2.y - prevPointV.y }
    return pipe(
      moveViewport(vector),
      (state) => ({ ...state, prevPointV: pt2 })
    )(state)
  }
